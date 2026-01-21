import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Real-time Voice Agent using Cloudflare Workers AI @cf/deepgram/flux
 *
 * This component establishes a WebSocket connection for real-time speech-to-text
 * streaming using Deepgram Flux model.
 */
export default function VoiceAgent() {
	const [isConnected, setIsConnected] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [transcription, setTranscription] = useState("");
	const [error, setError] = useState<string | null>(null);

	const wsRef = useRef<WebSocket | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopRecording();
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, []);

	const connectWebSocket = () => {
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${window.location.host}/demo/api/ai/transcription`;

		try {
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("WebSocket connected");
				setIsConnected(true);
				setError(null);
				startAudioStream();
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					if (data.text) {
						setTranscription((prev) => prev + " " + data.text);
					} else if (data.transcript) {
						setTranscription((prev) => prev + " " + data.transcript);
					}
				} catch (e) {
					console.error("Failed to parse message:", e);
				}
			};

			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
				setError("WebSocket connection error");
				setIsConnected(false);
			};

			ws.onclose = () => {
				console.log("WebSocket closed");
				setIsConnected(false);
				stopAudioStream();
			};
		} catch (err) {
			console.error("Failed to create WebSocket:", err);
			setError("Failed to create WebSocket connection");
		}
	};

	const startAudioStream = async () => {
		try {
			// Request microphone access
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					sampleRate: 16000, // Deepgram Flux requires 16kHz
					echoCancellation: true,
					noiseSuppression: true,
				},
			});

			streamRef.current = stream;

			// Create AudioContext for processing
			const audioContext = new AudioContext({ sampleRate: 16000 });
			audioContextRef.current = audioContext;

			const source = audioContext.createMediaStreamSource(stream);
			const processor = audioContext.createScriptProcessor(4096, 1, 1);

			processor.onaudioprocess = (event) => {
				if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
					return;
				}

				const inputData = event.inputBuffer.getChannelData(0);

				// Convert Float32Array to Int16Array (linear16 format)
				const pcmData = new Int16Array(inputData.length);
				for (let i = 0; i < inputData.length; i++) {
					// Clamp to [-1, 1] and scale to int16 range
					const s = Math.max(-1, Math.min(1, inputData[i]));
					pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
				}

				// Send binary audio data to WebSocket
				wsRef.current.send(pcmData.buffer);
			};

			source.connect(processor);
			processor.connect(audioContext.destination);

			setIsRecording(true);
		} catch (err) {
			console.error("Failed to start audio stream:", err);
			setError("Failed to access microphone. Please check permissions.");
			stopRecording();
		}
	};

	const stopAudioStream = () => {
		// Stop audio processing
		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}

		// Stop all tracks
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}

		setIsRecording(false);
	};

	const startRecording = () => {
		setTranscription(""); // Clear previous transcription
		connectWebSocket();
	};

	const stopRecording = () => {
		stopAudioStream();

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setIsConnected(false);
	};

	return (
		<div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl border border-orange-500/20">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-semibold text-white">
						Real-Time Voice Agent
					</h3>
					<div className="flex items-center gap-2">
						{isConnected && (
							<span className="text-xs text-green-400 flex items-center gap-1">
								<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
								Connected
							</span>
						)}
					</div>
				</div>

				<p className="text-sm text-gray-400">
					Powered by Cloudflare Workers AI (@cf/deepgram/flux)
				</p>

				{error && (
					<div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
						{error}
					</div>
				)}

				<div className="flex justify-center">
					<button
						onClick={isRecording ? stopRecording : startRecording}
						disabled={isConnected && !isRecording}
						className={`
							flex items-center gap-3 px-8 py-4 rounded-lg font-medium text-lg
							transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
							${
								isRecording
									? "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 animate-pulse"
									: "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white focus:ring-orange-500"
							}
							disabled:opacity-50 disabled:cursor-not-allowed
						`}
					>
						{isRecording ? (
							<>
								<MicOff size={24} />
								<span>Stop Recording</span>
							</>
						) : (
							<>
								<Mic size={24} />
								<span>Start Voice Agent</span>
							</>
						)}
					</button>
				</div>

				{transcription && (
					<div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-orange-500/20">
						<h4 className="text-sm font-medium text-orange-400 mb-2">
							Real-Time Transcription:
						</h4>
						<p className="text-white whitespace-pre-wrap">{transcription}</p>
					</div>
				)}

				<div className="text-xs text-gray-500 space-y-1">
					<p>💡 Click "Start Voice Agent" to begin speaking</p>
					<p>🎤 Audio streams in real-time to Cloudflare Workers AI</p>
					<p>📝 Transcription appears as you speak</p>
					<p>🛑 Click "Stop Recording" when done</p>
				</div>
			</div>
		</div>
	);
}

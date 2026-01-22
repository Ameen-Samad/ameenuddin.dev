import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

const VOICES = [
	{ id: "asteria", name: "Asteria (Female)" },
	{ id: "luna", name: "Luna (Female)" },
	{ id: "stella", name: "Stella (Female)" },
	{ id: "athena", name: "Athena (Female)" },
	{ id: "hera", name: "Hera (Female)" },
	{ id: "orion", name: "Orion (Male)" },
	{ id: "arcas", name: "Arcas (Male)" },
	{ id: "perseus", name: "Perseus (Male)" },
	{ id: "angus", name: "Angus (Male)" },
	{ id: "orpheus", name: "Orpheus (Male)" },
	{ id: "helios", name: "Helios (Male)" },
	{ id: "zeus", name: "Zeus (Male)" },
];

function TTSPage() {
	const [text, setText] = useState(
		"Hi, I'm Ameenuddin, a full-stack developer based in Singapore. I help businesses automate their operations with voice-enabled solutions like customer service bots, multilingual notifications, and accessibility features for diverse audiences.",
	);
	const [voice, setVoice] = useState("asteria");
	const [audioData, setAudioData] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
		null,
	);

	// Cleanup blob URL when component unmounts or audioData changes
	useEffect(() => {
		return () => {
			if (audioData && audioData.startsWith("blob:")) {
				URL.revokeObjectURL(audioData);
			}
		};
	}, [audioData]);

	const handleGenerate = async () => {
		setIsLoading(true);
		setError(null);
		setAudioData(null);
		setIsPlaying(false);

		try {
			// Use streaming endpoint for better UX
			const response = await fetch("/demo/api/ai/tts-stream", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, voice }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to generate speech");
			}

			// Get the audio stream
			const blob = await response.blob();
			const audioSrc = URL.createObjectURL(blob);
			setAudioData(audioSrc);

			// Create and store audio element
			const audio = new Audio(audioSrc);
			audio.onended = () => setIsPlaying(false);

			// Auto-play the audio as soon as it's ready
			audio.oncanplay = () => {
				setIsLoading(false);
				audio.play();
				setIsPlaying(true);
			};

			setAudioElement(audio);
		} catch (err: any) {
			setError(err.message);
			setIsLoading(false);
		}
	};

	const handlePlayPause = () => {
		if (!audioElement) return;

		if (isPlaying) {
			audioElement.pause();
			setIsPlaying(false);
		} else {
			audioElement.play();
			setIsPlaying(true);
		}
	};

	const handleDownload = () => {
		if (!audioData) return;

		const a = document.createElement("a");
		a.href = audioData;
		a.download = `tts-${voice}-${Date.now()}.mp3`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	return (
		<div className="min-h-[calc(100vh-80px)] bg-gray-900 p-4 sm:p-6">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center gap-3 mb-6">
					<Volume2 className="w-8 h-8 text-orange-500" />
					<h1 className="text-2xl font-bold text-white">Text-to-Speech</h1>
				</div>

				<div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-orange-500/20">
					<div className="space-y-4">
						{/* Voice Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Voice
							</label>
							<select
								value={voice}
								onChange={(e) => setVoice(e.target.value)}
								disabled={isLoading}
								className="w-full rounded-lg border border-orange-500/20 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
							>
								{VOICES.map((v) => (
									<option key={v.id} value={v.id}>
										{v.name}
									</option>
								))}
							</select>
						</div>

						{/* Text Input */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Text to Speak
							</label>
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								disabled={isLoading}
								rows={6}
								className="w-full rounded-lg border border-orange-500/20 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
								placeholder="Enter the text you want to convert to speech..."
							/>
							<p className="text-xs text-gray-400 mt-1">
								{text.length} characters
							</p>
						</div>

						{/* Generate Button */}
						<button
							onClick={handleGenerate}
							disabled={isLoading || !text.trim()}
							className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Generating Speech...
								</>
							) : (
								<>
									<Volume2 className="w-5 h-5" />
									Generate Speech
								</>
							)}
						</button>

						{/* Error Display */}
						{error && (
							<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
								{error}
							</div>
						)}

						{/* Audio Player */}
						{audioData && !error && (
							<div className="p-4 bg-gray-700/50 border border-orange-500/20 rounded-lg">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3 flex-1">
										<button
											onClick={handlePlayPause}
											className="p-3 bg-orange-600 hover:bg-orange-700 rounded-full transition-colors"
										>
											{isPlaying ? (
												<Pause className="w-5 h-5 text-white" />
											) : (
												<Play className="w-5 h-5 text-white ml-0.5" />
											)}
										</button>
										<div className="flex-1">
											<p className="text-sm font-medium text-white">
												Generated Audio
											</p>
											<p className="text-xs text-gray-400">
												{VOICES.find((v) => v.id === voice)?.name}
											</p>
										</div>
									</div>
									<button
										onClick={handleDownload}
										className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
										title="Download audio"
									>
										<Download className="w-5 h-5 text-white" />
									</button>
								</div>
							</div>
						)}

						{/* Info */}
						<div className="text-xs text-gray-400 space-y-1">
							<p>
								<strong className="text-gray-300">Why voice?</strong>{" "}
								Voice-enabled applications improve accessibility, reduce support
								costs, and enhance customer experience across multiple languages
								and channels.
							</p>
						</div>
					</div>
				</div>

				{/* Usage Examples */}
				<div className="mt-6 bg-gray-800 rounded-lg p-4 sm:p-6 border border-orange-500/20">
					<h2 className="text-lg font-semibold text-white mb-3">
						Real Business Applications in Singapore
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
						<button
							onClick={() =>
								setText(
									"Good morning! Your food delivery order from Yishun will arrive in 15 minutes. Our rider is on the way with your chicken rice and teh peng.",
								)
							}
							className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
						>
							<p className="font-medium text-white mb-1">
								Delivery Notifications
							</p>
							<p className="text-xs text-gray-400">
								Real-time updates for logistics and food delivery
							</p>
						</button>
						<button
							onClick={() =>
								setText(
									"This is a reminder that your medical appointment at Tan Tock Seng Hospital is scheduled for tomorrow at 2 PM. Please arrive 15 minutes early and bring your NRIC.",
								)
							}
							className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
						>
							<p className="font-medium text-white mb-1">
								Healthcare Reminders
							</p>
							<p className="text-xs text-gray-400">
								Appointment confirmations for clinics
							</p>
						</button>
						<button
							onClick={() =>
								setText(
									"Welcome to DBS customer service. For account inquiries, press 1. For credit card services, press 2. To report a lost card, press 3. Or say what you need help with.",
								)
							}
							className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
						>
							<p className="font-medium text-white mb-1">Banking Hotlines</p>
							<p className="text-xs text-gray-400">
								Automated customer service for financial institutions
							</p>
						</button>
						<button
							onClick={() =>
								setText(
									"Your HDB maintenance fee payment of $85 is due on the 15th of this month. Pay online via PayNow or at any AXS station to avoid late charges.",
								)
							}
							className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
						>
							<p className="font-medium text-white mb-1">Government Alerts</p>
							<p className="text-xs text-gray-400">
								Automated reminders for residents and citizens
							</p>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/demo/ai-tts")({
	component: TTSPage,
});

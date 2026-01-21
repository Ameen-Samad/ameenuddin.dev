import { useState, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Mic, MicOff, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react'

interface TranscriptionMessage {
  type: 'connected' | 'transcription' | 'error'
  message?: string
  text?: string
  data?: any
  error?: string
  details?: string
  timestamp?: number
  config?: {
    encoding: string
    sampleRate: number
    model: string
  }
}

interface Transcription {
  text: string
  timestamp: number
  confidence?: number
}

function VoiceAgentPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected')
  const [modelConfig, setModelConfig] = useState<any>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
      disconnectWebSocket()
    }
  }, [])

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/demo/api/ai/transcription`
  }

  const connectWebSocket = () => {
    const wsUrl = getWebSocketUrl()
    setConnectionStatus('Connecting...')
    setError(null)

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    // Set binary type for efficient audio data transfer
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      setConnectionStatus('Connected')
    }

    ws.onmessage = (event) => {
      try {
        // Handle text messages (JSON)
        if (typeof event.data === 'string') {
          const message: TranscriptionMessage = JSON.parse(event.data)

          if (message.type === 'connected') {
            console.log('Voice agent ready:', message.config)
            setModelConfig(message.config)
            setConnectionStatus(`Connected (${message.config?.model})`)
          } else if (message.type === 'transcription') {
            // Handle transcription result
            const text = message.data?.text || message.text || ''
            console.log('Received transcription:', text)
            if (text.trim()) {
              setTranscriptions((prev) => [
                ...prev,
                {
                  text,
                  timestamp: message.timestamp || Date.now(),
                  confidence: message.data?.confidence,
                },
              ])
            }
          } else if (message.error) {
            console.error('Voice agent error:', message.error)
            setError(`${message.error}: ${message.details || ''}`)
          }
        }
      } catch (err) {
        console.error('Failed to parse message:', err)
      }
    }

    ws.onerror = (event) => {
      console.error('WebSocket error:', event)
      setError('WebSocket connection error')
      setConnectionStatus('Error')
    }

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)

      // Stop recording if it was active
      if (isRecording) {
        stopRecording()
      }

      setIsConnected(false)
      setConnectionStatus('Disconnected')

      // Show user-friendly error messages
      if (event.code === 1006) {
        setError('Connection lost unexpectedly. The server may have closed the connection.')
      } else if (event.code !== 1000 && event.code !== 1001) {
        setError(`Connection closed: ${event.reason || `Code ${event.code}`}`)
      }

      wsRef.current = null
    }
  }

  const disconnectWebSocket = () => {
    // Stop recording first if recording is active
    if (isRecording) {
      stopRecording()
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }
    setIsConnected(false)
    setConnectionStatus('Disconnected')
  }

  const startRecording = async () => {
    if (!isConnected) {
      setError('Please connect to the voice agent first')
      return
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      // Create inline AudioWorklet processor
      const processorCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs, outputs) {
            const input = inputs[0];
            if (input.length > 0) {
              const audioData = input[0];

              // Convert Float32Array to Int16Array (linear16 format)
              const int16Data = new Int16Array(audioData.length);
              for (let i = 0; i < audioData.length; i++) {
                const s = Math.max(-1, Math.min(1, audioData[i]));
                int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }

              // Send to main thread
              this.port.postMessage(int16Data.buffer);
            }
            return true;
          }
        }

        registerProcessor('audio-processor', AudioProcessor);
      `;

      // Create blob URL for the processor
      const blob = new Blob([processorCode], { type: 'application/javascript' })
      const processorUrl = URL.createObjectURL(blob)

      try {
        await audioContext.audioWorklet.addModule(processorUrl)
      } finally {
        URL.revokeObjectURL(processorUrl)
      }

      // Create worklet node
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor')
      workletNodeRef.current = workletNode

      // Handle messages from worklet (audio data)
      workletNode.port.onmessage = (event) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data)
        }
      }

      // Connect nodes
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(workletNode)

      setIsRecording(true)
      setError(null)
    } catch (err: any) {
      console.error('Failed to start recording:', err)
      setError(`Microphone error: ${err.message}`)
    }
  }

  const stopRecording = () => {
    // Stop audio processing
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect()
      workletNodeRef.current.port.close()
      workletNodeRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
  }

  const clearTranscriptions = () => {
    setTranscriptions([])
  }

  const getStatusColor = () => {
    if (isRecording) return 'text-green-400'
    if (isConnected) return 'text-orange-400'
    if (error) return 'text-red-400'
    return 'text-gray-400'
  }

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="w-5 h-5" />
    return <WifiOff className="w-5 h-5" />
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Mic className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-white">Voice Agent</h1>
        </div>

        <div className="space-y-4">
          {/* Connection Panel */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={getStatusColor()}>{getStatusIcon()}</div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Connection Status
                  </p>
                  <p className={`text-xs ${getStatusColor()}`}>
                    {connectionStatus}
                  </p>
                </div>
              </div>

              {!isConnected ? (
                <button
                  onClick={connectWebSocket}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Wifi className="w-4 h-4" />
                  Connect
                </button>
              ) : (
                <button
                  onClick={disconnectWebSocket}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            {modelConfig && (
              <div className="text-xs text-gray-400 space-y-1 p-3 bg-gray-700/50 rounded-lg">
                <p>
                  <strong className="text-gray-300">Model:</strong>{' '}
                  {modelConfig.model}
                </p>
                <p>
                  <strong className="text-gray-300">Encoding:</strong>{' '}
                  {modelConfig.encoding}
                </p>
                <p>
                  <strong className="text-gray-300">Sample Rate:</strong>{' '}
                  {modelConfig.sampleRate} Hz
                </p>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-orange-500/20">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-orange-600 hover:bg-orange-700'
                } disabled:bg-gray-600 disabled:cursor-not-allowed`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>

              <div className="text-center">
                <p className="text-white font-medium">
                  {isRecording ? 'Recording...' : 'Ready to Record'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isRecording
                    ? 'Speak into your microphone'
                    : isConnected
                      ? 'Click the microphone to start'
                      : 'Connect first to begin recording'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-400/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Transcriptions Panel */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Transcriptions
              </h2>
              {transcriptions.length > 0 && (
                <button
                  onClick={clearTranscriptions}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transcriptions.length > 0 ? (
                transcriptions.map((t, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <p className="text-white text-sm">{t.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </span>
                      {t.confidence && (
                        <span>Confidence: {(t.confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <Mic className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-center">
                    {isConnected
                      ? 'Start recording to see transcriptions here'
                      : 'Connect and start recording to begin'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-orange-500/20">
            <h2 className="text-lg font-semibold text-white mb-3">
              How It Works
            </h2>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">1.</span>
                <p>
                  Click <strong className="text-white">Connect</strong> to
                  establish a WebSocket connection to the voice agent
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">2.</span>
                <p>
                  Click the <strong className="text-white">microphone button</strong> and
                  allow microphone access
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">3.</span>
                <p>
                  Speak clearly into your microphone - audio is processed in
                  real-time
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">4.</span>
                <p>
                  See live transcriptions appear below as you speak
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
              <p>
                <strong className="text-gray-300">Technology:</strong> Cloudflare
                Workers AI with Deepgram Flux
              </p>
              <p className="mt-1">
                <strong className="text-gray-300">Format:</strong> Linear16 PCM,
                16kHz, Mono
              </p>
              <p className="mt-1">
                <strong className="text-gray-300">Latency:</strong> Real-time
                streaming with WebSocket
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/demo/ai-voice')({
  component: VoiceAgentPage,
})

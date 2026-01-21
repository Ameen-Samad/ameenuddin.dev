import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Volume2, Loader2, Download, Play, Pause } from 'lucide-react'

const VOICES = [
  { id: 'aura-asteria-en', name: 'Asteria (Female)' },
  { id: 'aura-luna-en', name: 'Luna (Female)' },
  { id: 'aura-stella-en', name: 'Stella (Female)' },
  { id: 'aura-athena-en', name: 'Athena (Female)' },
  { id: 'aura-hera-en', name: 'Hera (Female)' },
  { id: 'aura-orion-en', name: 'Orion (Male)' },
  { id: 'aura-arcas-en', name: 'Arcas (Male)' },
  { id: 'aura-perseus-en', name: 'Perseus (Male)' },
  { id: 'aura-angus-en', name: 'Angus (Male)' },
  { id: 'aura-orpheus-en', name: 'Orpheus (Male)' },
  { id: 'aura-helios-en', name: 'Helios (Male)' },
  { id: 'aura-zeus-en', name: 'Zeus (Male)' },
]

function TTSPage() {
  const [text, setText] = useState(
    'Hello! This is a demonstration of Cloudflare Workers AI text-to-speech using Deepgram Aura. The voice quality is impressive and the latency is minimal.',
  )
  const [voice, setVoice] = useState('aura-asteria-en')
  const [audioData, setAudioData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    setAudioData(null)
    setIsPlaying(false)

    try {
      const response = await fetch('/demo/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech')
      }

      // Store base64 audio data
      const audioSrc = `data:${data.contentType};base64,${data.audio}`
      setAudioData(audioSrc)

      // Create and store audio element
      const audio = new Audio(audioSrc)
      audio.onended = () => setIsPlaying(false)
      setAudioElement(audio)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioElement) return

    if (isPlaying) {
      audioElement.pause()
      setIsPlaying(false)
    } else {
      audioElement.play()
      setIsPlaying(true)
    }
  }

  const handleDownload = () => {
    if (!audioData) return

    const a = document.createElement('a')
    a.href = audioData
    a.download = `tts-${voice}-${Date.now()}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

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
                        {VOICES.find((v) => v.id === voice)?.name} • Deepgram
                        Aura
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
                <strong className="text-gray-300">Model:</strong>{' '}
                @cf/deepgram/aura-2-en
              </p>
              <p>
                <strong className="text-gray-300">Provider:</strong> Cloudflare
                Workers AI
              </p>
              <p>
                <strong className="text-gray-300">Format:</strong> MP3
              </p>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 sm:p-6 border border-orange-500/20">
          <h2 className="text-lg font-semibold text-white mb-3">
            Example Use Cases
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <button
              onClick={() =>
                setText(
                  'Welcome to our website! We are excited to have you here. Feel free to explore our features and let us know if you have any questions.',
                )
              }
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
            >
              <p className="font-medium text-white mb-1">Website Welcome</p>
              <p className="text-xs text-gray-400">
                Greeting message for visitors
              </p>
            </button>
            <button
              onClick={() =>
                setText(
                  'Your order has been confirmed and will be delivered within 2-3 business days. Thank you for your purchase!',
                )
              }
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
            >
              <p className="font-medium text-white mb-1">Order Confirmation</p>
              <p className="text-xs text-gray-400">E-commerce notification</p>
            </button>
            <button
              onClick={() =>
                setText(
                  'Press 1 for sales, press 2 for support, or press 0 to speak with an operator.',
                )
              }
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
            >
              <p className="font-medium text-white mb-1">IVR System</p>
              <p className="text-xs text-gray-400">
                Interactive voice response
              </p>
            </button>
            <button
              onClick={() =>
                setText(
                  'New message from John: Hey, are we still meeting at 3 PM today? Let me know if you need to reschedule.',
                )
              }
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
            >
              <p className="font-medium text-white mb-1">Message Reading</p>
              <p className="text-xs text-gray-400">
                Audio accessibility feature
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/demo/ai-tts')({
  component: TTSPage,
})

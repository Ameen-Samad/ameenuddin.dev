import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/api/ai/tts')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json()
        const {
          text,
          voice = 'aura-asteria-en', // Default Deepgram Aura voice
          // Note: Deepgram Aura supports various voices like:
          // aura-asteria-en, aura-luna-en, aura-stella-en, aura-athena-en, etc.
        } = body

        if (!text || text.trim().length === 0) {
          return new Response(
            JSON.stringify({
              error: 'Text is required',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const env = (context as any)?.cloudflare?.env
        if (!env?.AI) {
          return new Response(
            JSON.stringify({
              error: 'Cloudflare AI binding not available',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        try {
          const response = await env.AI.run(
            '@cf/deepgram/aura-2-en',
            {
              text,
              voice,
            }
          )

          // The response should be audio data
          // Convert to base64 if needed for JSON transport
          let audioData: string
          if (response instanceof ArrayBuffer || Buffer.isBuffer(response)) {
            audioData = Buffer.from(response).toString('base64')
          } else if (response instanceof ReadableStream) {
            // If streaming, we need to collect the chunks
            const reader = response.getReader()
            const chunks: Uint8Array[] = []

            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              chunks.push(value)
            }

            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
            const combined = new Uint8Array(totalLength)
            let offset = 0
            for (const chunk of chunks) {
              combined.set(chunk, offset)
              offset += chunk.length
            }

            audioData = Buffer.from(combined).toString('base64')
          } else {
            audioData = response
          }

          return new Response(
            JSON.stringify({
              model: '@cf/deepgram/aura-2-en',
              audio: audioData,
              format: 'mp3', // Deepgram Aura typically returns MP3
              contentType: 'audio/mpeg',
              voice,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error: any) {
          console.error('Text-to-speech error:', error)
          return new Response(
            JSON.stringify({
              error: error.message || 'An error occurred during text-to-speech',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})

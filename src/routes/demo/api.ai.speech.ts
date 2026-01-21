import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/api/ai/speech')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const formData = await request.formData()
        const audioFile = formData.get('audio') as File | null
        const audioBase64 = formData.get('audioBase64') as string | null

        if (!audioFile && !audioBase64) {
          return new Response(
            JSON.stringify({
              error: 'Audio file or base64 data is required',
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
          // Prepare audio data for Cloudflare AI
          let audioBuffer: ArrayBuffer

          if (audioFile) {
            audioBuffer = await audioFile.arrayBuffer()
          } else if (audioBase64) {
            // Convert base64 to ArrayBuffer
            const base64Data = audioBase64.includes('base64,')
              ? audioBase64.split('base64,')[1]
              : audioBase64
            const binaryString = atob(base64Data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            audioBuffer = bytes.buffer
          } else {
            throw new Error('No audio data provided')
          }

          // Use Cloudflare Workers AI for speech recognition
          const response = await env.AI.run('@cf/deepgram/flux', {
            audio: Array.from(new Uint8Array(audioBuffer)),
          })

          return new Response(
            JSON.stringify({
              model: '@cf/deepgram/flux',
              text: response.text || response,
              ...(response.confidence && { confidence: response.confidence }),
              ...(response.words && { words: response.words }),
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error: any) {
          console.error('Speech recognition error:', error)
          return new Response(
            JSON.stringify({
              error: error.message || 'An error occurred during speech recognition',
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

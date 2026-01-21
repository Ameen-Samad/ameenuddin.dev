import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/api/ai/image')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json()
        const { prompt, numberOfImages = 1 } = body

        if (!prompt || prompt.trim().length === 0) {
          return new Response(
            JSON.stringify({
              error: 'Prompt is required',
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
          // Generate images using Cloudflare Workers AI
          const imagePromises = Array.from({ length: numberOfImages }, async () => {
            const response = await env.AI.run(
              '@cf/bytedance/stable-diffusion-xl-lightning',
              {
                prompt,
              }
            )
            return response
          })

          const results = await Promise.all(imagePromises)

          // Convert image buffers to base64 for easier handling
          const images = results.map((result: any) => {
            if (result instanceof ReadableStream) {
              // Handle streaming response if needed
              return result
            }
            // If it's a buffer, convert to base64
            if (result instanceof ArrayBuffer || Buffer.isBuffer(result)) {
              const base64 = Buffer.from(result).toString('base64')
              return `data:image/png;base64,${base64}`
            }
            return result
          })

          return new Response(
            JSON.stringify({
              images,
              model: '@cf/bytedance/stable-diffusion-xl-lightning',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error: any) {
          console.error('Image generation error:', error)
          return new Response(
            JSON.stringify({
              error: error.message || 'An error occurred during image generation',
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

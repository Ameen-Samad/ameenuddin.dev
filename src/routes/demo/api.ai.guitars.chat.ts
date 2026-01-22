import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit'
import guitars from '@/data/demo-guitars'

const SYSTEM_PROMPT = `You are an expert music shop owner with 30 years of experience selling guitars. You're knowledgeable, passionate about guitars, and love helping customers find their perfect instrument.

Your personality:
- Warm and welcoming, like a friendly neighborhood shop owner
- Genuinely passionate about music and instruments
- Patient with beginners, respectful to experts
- You tell stories about guitars and their history

When helping customers:
1. Ask about their playing style and experience level
2. Understand their preferred music genres
3. Consider their budget
4. Ask if they prefer acoustic or electric sounds

You have access to these tools:
- getGuitars: View all available guitars in the shop
- recommendGuitar: Display a guitar recommendation to the customer

IMPORTANT: When recommending a guitar, you MUST use the recommendGuitar tool to display it nicely. Don't just describe the guitar - use the tool!

Current inventory:
${guitars.map((g) => `- ID ${g.id}: ${g.name} ($${g.price}) - ${g.type} - ${g.shortDescription} - Tags: ${g.tags.join(', ')}`).join('\n')}

Keep responses conversational but concise. You're helpful, not pushy.`

const TOOLS = [
  {
    name: 'getGuitars',
    description: 'Get all guitars available in the shop inventory',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'recommendGuitar',
    description:
      'Display a guitar recommendation to the customer with a nice card UI. Use this when you want to show a specific guitar to the customer.',
    input_schema: {
      type: 'object',
      properties: {
        guitarId: {
          type: 'number',
          description: 'The ID of the guitar to recommend',
        },
        reason: {
          type: 'string',
          description: 'Why you are recommending this guitar (1-2 sentences)',
        },
      },
      required: ['guitarId', 'reason'],
    },
  },
]

export const Route = createFileRoute('/demo/api/ai/guitars/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      request,
      'guitar-chat',
      RATE_LIMITS.CHAT,
      env.RATE_LIMIT
    )

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use Cloudflare AI with streaming
    const ai = env.AI

    // Build conversation with system prompt
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ]

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Run AI in background
    ;(async () => {
      try {
        let response = await ai.run('@cf/meta/llama-3.1-70b-instruct', {
          messages: fullMessages,
          stream: true,
          max_tokens: 1024,
        })

        // Handle the response as an async iterator
        if (response && typeof response[Symbol.asyncIterator] === 'function') {
          let fullResponse = ''

          for await (const chunk of response) {
            if (chunk.response) {
              fullResponse += chunk.response
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', content: chunk.response })}\n\n`
                )
              )
            }
          }

          // Check if we need to handle tool calls (simplified - real implementation would parse and handle)
          // For now, just send done
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          )
        } else {
          // Non-streaming fallback
          const text = typeof response === 'string' ? response : response?.response || ''
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'text', content: text })}\n\n`
            )
          )
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          )
        }
      } catch (error) {
        console.error('AI streaming error:', error)
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', content: 'Failed to generate response' })}\n\n`
          )
        )
      } finally {
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      },
    })
  } catch (error) {
    console.error('Guitar chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
      },
    },
  },
})

// Handle tool execution
function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): unknown {
  switch (toolName) {
    case 'getGuitars':
      return guitars.map((g) => ({
        id: g.id,
        name: g.name,
        price: g.price,
        type: g.type,
        shortDescription: g.shortDescription,
        tags: g.tags,
      }))

    case 'recommendGuitar':
      const guitarId = toolInput.guitarId as number
      const guitar = guitars.find((g) => g.id === guitarId)
      if (!guitar) {
        return { error: 'Guitar not found' }
      }
      return {
        type: 'recommendation',
        guitar: {
          id: guitar.id,
          name: guitar.name,
          price: guitar.price,
          image: guitar.image,
          shortDescription: guitar.shortDescription,
          type: guitar.type,
        },
        reason: toolInput.reason,
      }

    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}

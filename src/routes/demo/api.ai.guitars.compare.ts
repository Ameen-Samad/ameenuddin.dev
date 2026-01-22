import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { checkRateLimit } from '@/lib/rate-limit'

export const Route = createFileRoute('/demo/api/ai/guitars/compare')({
  staticData: {
    skipLayoutWrapper: true,
  },
})

interface GuitarInput {
  id: number
  name: string
  description: string
  price: number
  type: string
  tags: string[]
  features: string[]
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
    const rateLimitResult = await checkRateLimit(
      env.RATE_LIMIT,
      `guitar-compare:${clientIP}`,
      10,
      60
    )

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const { guitars } = await request.json()

    if (!guitars || !Array.isArray(guitars) || guitars.length !== 2) {
      return new Response(
        JSON.stringify({ error: 'Exactly 2 guitars are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const [guitar1, guitar2] = guitars as GuitarInput[]

    const prompt = `Compare these two guitars for a customer who is deciding between them:

Guitar A: ${guitar1.name}
- Price: $${guitar1.price}
- Type: ${guitar1.type}
- Description: ${guitar1.description}
- Tags: ${guitar1.tags.join(', ')}
- Features: ${guitar1.features.join(', ')}

Guitar B: ${guitar2.name}
- Price: $${guitar2.price}
- Type: ${guitar2.type}
- Description: ${guitar2.description}
- Tags: ${guitar2.tags.join(', ')}
- Features: ${guitar2.features.join(', ')}

For EACH guitar, provide a brief analysis in this exact JSON format:
{
  "insights": [
    {
      "guitarId": ${guitar1.id},
      "bestFor": "1-2 specific use cases (e.g., 'Jazz clubs, intimate venues')",
      "soundProfile": "2-3 words describing the sound (e.g., 'warm, mellow, rich')",
      "whyChoose": "One compelling sentence on why someone would choose this guitar"
    },
    {
      "guitarId": ${guitar2.id},
      "bestFor": "1-2 specific use cases",
      "soundProfile": "2-3 words",
      "whyChoose": "One compelling sentence"
    }
  ]
}

Be specific and helpful. This helps the customer decide. Return ONLY the JSON, no other text.`

    const ai = env.AI

    const response = await ai.run('@cf/meta/llama-3.1-70b-instruct', {
      messages: [
        {
          role: 'system',
          content:
            'You are a guitar expert helping customers compare instruments. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
    })

    // Parse the AI response
    let insights = []
    try {
      const responseText =
        typeof response === 'string' ? response : response?.response || ''

      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        insights = parsed.insights || []
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Return fallback insights
      insights = [
        {
          guitarId: guitar1.id,
          bestFor: `${guitar1.type} enthusiasts`,
          soundProfile: guitar1.tags.slice(0, 3).join(', '),
          whyChoose: `Perfect if you love ${guitar1.tags[0]} tones and ${guitar1.features[0]?.toLowerCase() || 'unique design'}.`,
        },
        {
          guitarId: guitar2.id,
          bestFor: `${guitar2.type} enthusiasts`,
          soundProfile: guitar2.tags.slice(0, 3).join(', '),
          whyChoose: `Ideal for those who appreciate ${guitar2.tags[0]} sounds and ${guitar2.features[0]?.toLowerCase() || 'distinctive style'}.`,
        },
      ]
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Compare error:', error)
    return new Response(
      JSON.stringify({ error: 'Comparison failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

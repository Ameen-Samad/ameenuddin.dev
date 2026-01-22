import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { checkRateLimit } from '@/lib/rate-limit'
import guitars from '@/data/demo-guitars'

// Pre-computed text representations for each guitar (for embedding)
const guitarTexts = guitars.map((g) => ({
  id: g.id,
  text: `${g.name}. ${g.type} guitar. ${g.description} ${g.tags.join(', ')}. Features: ${g.features.join(', ')}.`,
}))

export const Route = createFileRoute('/demo/api/ai/guitars/search')({
  server: {
    handlers: {
      POST: async ({ request }) => {
  try {
    // Rate limiting
    const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
    const rateLimitResult = await checkRateLimit(
      env.RATE_LIMIT,
      `guitar-search:${clientIP}`,
      30,
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

    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query string is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ai = env.AI

    // Generate embedding for the search query
    const queryEmbedding = await ai.run('@cf/baai/bge-base-en-v1.5', {
      text: query,
    })

    if (!queryEmbedding?.data?.[0]) {
      throw new Error('Failed to generate query embedding')
    }

    // Generate embeddings for all guitars (in production, these would be pre-computed)
    const guitarEmbeddings = await Promise.all(
      guitarTexts.map(async (gt) => {
        const embedding = await ai.run('@cf/baai/bge-base-en-v1.5', {
          text: gt.text,
        })
        return {
          id: gt.id,
          embedding: embedding?.data?.[0] || [],
        }
      })
    )

    // Calculate cosine similarity
    const queryVec = queryEmbedding.data[0]
    const results = guitarEmbeddings
      .map((ge) => ({
        id: ge.id,
        similarity: cosineSimilarity(queryVec, ge.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)

    // Return top results with guitar data
    const topResults = results.slice(0, 8).map((r) => ({
      guitar: guitars.find((g) => g.id === r.id),
      similarity: r.similarity,
      relevance: getRelevanceLabel(r.similarity),
    }))

    return new Response(JSON.stringify({ results: topResults }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Semantic search error:', error)
    return new Response(
      JSON.stringify({ error: 'Search failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
      },
    },
  },
})

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dotProduct / denominator
}

function getRelevanceLabel(similarity: number): string {
  if (similarity >= 0.8) return 'Excellent match'
  if (similarity >= 0.6) return 'Good match'
  if (similarity >= 0.4) return 'Relevant'
  return 'Related'
}

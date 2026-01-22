import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit'
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
    console.log('[Guitar Search] Request received')

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      request,
      'guitar-search',
      RATE_LIMITS.SEARCH,
      env.RATE_LIMIT
    )

    if (!rateLimitResult.success) {
      console.log('[Guitar Search] Rate limit exceeded')
      return rateLimitResponse(rateLimitResult)
    }
    console.log('[Guitar Search] Rate limit check passed')

    const { query } = await request.json()
    console.log('[Guitar Search] Query:', query)

    if (!query || typeof query !== 'string') {
      console.log('[Guitar Search] Invalid query')
      return new Response(
        JSON.stringify({ error: 'Query string is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ai = env.AI

    if (!ai) {
      console.error('[Guitar Search] AI binding not available')
      return new Response(
        JSON.stringify({ error: 'AI not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log('[Guitar Search] AI binding available')

    // Generate embedding for the search query
    console.log('[Guitar Search] Generating query embedding...')
    const queryEmbedding = await ai.run('@cf/baai/bge-base-en-v1.5', {
      text: query,
    })
    console.log('[Guitar Search] Query embedding result:', queryEmbedding ? 'success' : 'null')

    if (!queryEmbedding?.data?.[0]) {
      console.error('[Guitar Search] Failed to generate query embedding:', queryEmbedding)
      throw new Error('Failed to generate query embedding')
    }
    console.log('[Guitar Search] Query embedding generated, length:', queryEmbedding.data[0].length)

    // Generate embeddings for all guitars (in production, these would be pre-computed)
    console.log('[Guitar Search] Generating embeddings for', guitarTexts.length, 'guitars...')
    const guitarEmbeddings = await Promise.all(
      guitarTexts.map(async (gt, index) => {
        try {
          const embedding = await ai.run('@cf/baai/bge-base-en-v1.5', {
            text: gt.text,
          })
          if (index === 0) {
            console.log('[Guitar Search] First guitar embedding:', embedding ? 'success' : 'null')
          }
          return {
            id: gt.id,
            embedding: embedding?.data?.[0] || [],
          }
        } catch (err) {
          console.error('[Guitar Search] Failed to generate embedding for guitar', gt.id, err)
          return {
            id: gt.id,
            embedding: [],
          }
        }
      })
    )
    console.log('[Guitar Search] Generated', guitarEmbeddings.length, 'guitar embeddings')

    // Calculate cosine similarity
    const queryVec = queryEmbedding.data[0]
    console.log('[Guitar Search] Calculating similarities...')
    const results = guitarEmbeddings
      .map((ge) => ({
        id: ge.id,
        similarity: cosineSimilarity(queryVec, ge.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
    console.log('[Guitar Search] Top 3 similarities:', results.slice(0, 3).map(r => ({ id: r.id, sim: r.similarity })))

    // Return top results with guitar data
    const topResults = results.slice(0, 8).map((r) => ({
      guitar: guitars.find((g) => g.id === r.id),
      similarity: r.similarity,
      relevance: getRelevanceLabel(r.similarity),
    }))
    console.log('[Guitar Search] Returning', topResults.length, 'results')

    return new Response(JSON.stringify({ results: topResults }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Guitar Search] ERROR:', error)
    console.error('[Guitar Search] ERROR Stack:', error instanceof Error ? error.stack : 'No stack')
    const errorMessage = error instanceof Error ? error.message : 'Search failed'
    const errorStack = error instanceof Error ? error.stack : undefined
    return new Response(
      JSON.stringify({
        error: 'Search failed',
        details: errorMessage,
        stack: errorStack,
        message: 'An error occurred while processing your search. Please try again.'
      }),
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

/**
 * Portfolio RAG (Retrieval Augmented Generation) Utilities
 *
 * Handles semantic search over portfolio documents using embeddings
 */

import type { PortfolioDocument } from './portfolio-documents'

export interface RelevantDocument {
	id: string
	type: 'skill' | 'project' | 'experience'
	title: string
	content: string
	score: number
	metadata: Record<string, any>
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between 0 and 1 (normalized)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
	let dotProduct = 0
	let magnitudeA = 0
	let magnitudeB = 0

	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i]
		magnitudeA += a[i] * a[i]
		magnitudeB += b[i] * b[i]
	}

	const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
	if (magnitude === 0) return 0

	// Normalize to 0-1 range
	return (dotProduct / magnitude + 1) / 2
}

/**
 * Generate embeddings and find relevant documents
 *
 * @param aiBinding Cloudflare AI binding
 * @param query User's search query
 * @param documents All portfolio documents
 * @param topK Number of top results to return (default: 5)
 * @param threshold Minimum similarity score (default: 0.3)
 */
export async function findRelevantDocuments(
	aiBinding: any,
	query: string,
	documents: PortfolioDocument[],
	topK = 5,
	threshold = 0.3,
): Promise<RelevantDocument[]> {
	console.log('[RAG] Generating embeddings for query + documents')

	// Generate embeddings for query and all documents
	const embeddingsResponse = await aiBinding.run('@cf/baai/bge-base-en-v1.5', {
		text: [query, ...documents.map((doc) => doc.content)],
	})

	const embeddings = embeddingsResponse.data as number[][]
	const queryEmbedding = embeddings[0]
	const docEmbeddings = embeddings.slice(1)

	// Calculate similarities
	const similarities = documents.map((doc, idx) => {
		const score = cosineSimilarity(queryEmbedding, docEmbeddings[idx])
		return { doc, score }
	})

	// Filter by threshold and get top K
	const relevant = similarities
		.filter((s) => s.score > threshold)
		.sort((a, b) => b.score - a.score)
		.slice(0, topK)

	console.log('[RAG] Found', relevant.length, 'relevant documents')

	// Map to RelevantDocument format
	return relevant.map((r) => ({
		id: r.doc.id,
		type: r.doc.type,
		title: r.doc.title,
		content: r.doc.content,
		score: r.score,
		metadata: r.doc.metadata,
	}))
}

/**
 * Format relevant documents as context for system prompt
 */
export function formatContextForPrompt(documents: RelevantDocument[]): string {
	if (documents.length === 0) return ''

	return `\n\nRelevant Portfolio Information:\n${documents
		.map(
			(doc) =>
				`<${doc.type} id="${doc.id}" relevance="${(doc.score * 100).toFixed(0)}%">\n${doc.content}\n</${doc.type}>`,
		)
		.join('\n\n')}\n\n`
}

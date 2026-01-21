/**
 * TanStack Pacer Utilities for AI Operations
 *
 * Provides debounced, throttled, rate-limited, and batched versions
 * of AI functions to prevent abuse and optimize performance.
 */

import { rateLimit, batch, queue } from "@tanstack/pacer";
import type { RateLimiter, Batcher, Queuer } from "@tanstack/pacer";
import {
	generateEmbedding,
	performSemanticSearch,
	parseNaturalLanguage,
	suggestTags,
	generateSummary,
	chatWithProject,
	getRecommendations,
} from "./cloudflare-ai";

/**
 * Client-Side Rate Limits
 *
 * These complement server-side rate limiting by preventing
 * unnecessary API calls in the first place.
 */
const RATE_LIMITS = {
	// Search/Query operations - moderate
	SEARCH: { limit: 20, window: 60000 }, // 20/min
	PARSE: { limit: 30, window: 60000 }, // 30/min

	// Embedding generation - expensive
	EMBEDDINGS: { limit: 10, window: 60000 }, // 10/min

	// LLM operations - very expensive
	SUMMARY: { limit: 3, window: 60000 }, // 3/min
	CHAT: { limit: 5, window: 60000 }, // 5/min
	TAGS: { limit: 10, window: 60000 }, // 10/min
} as const;

/**
 * Rate-Limited Embedding Generation
 *
 * Limits: 10 calls per minute
 * On reject: Queues request for later
 */
export const rateLimitedEmbedding = rateLimit(
	async (text: string) => generateEmbedding(text),
	{
		...RATE_LIMITS.EMBEDDINGS,
		onReject: (fn, limiter: RateLimiter<string, Promise<number[]>>) => {
			const remaining = limiter.getMsUntilNextWindow();
			console.warn(`Embedding rate limit exceeded. Retry in ${remaining}ms`);
			throw new Error(
				`Too many embedding requests. Please wait ${Math.ceil(remaining / 1000)} seconds.`,
			);
		},
	},
);

/**
 * Rate-Limited Semantic Search
 *
 * Limits: 20 calls per minute
 */
export const rateLimitedSearch = rateLimit(
	async (query: string, limit?: number) => performSemanticSearch(query, limit),
	{
		...RATE_LIMITS.SEARCH,
		onReject: () => {
			console.warn("Search rate limit exceeded");
			throw new Error("Too many search requests. Please slow down.");
		},
	},
);

/**
 * Rate-Limited Query Parsing
 *
 * Limits: 30 calls per minute
 */
export const rateLimitedParse = rateLimit(
	async (query: string) => parseNaturalLanguage(query),
	{
		...RATE_LIMITS.PARSE,
		onReject: () => {
			throw new Error("Too many parse requests. Please wait a moment.");
		},
	},
);

/**
 * Rate-Limited Summary Generation
 *
 * Limits: 3 calls per minute (very expensive operation)
 */
export const rateLimitedSummary = rateLimit(
	async (project: any) => generateSummary(project),
	{
		...RATE_LIMITS.SUMMARY,
		onReject: () => {
			throw new Error(
				"Summary generation is rate limited. Please wait before requesting another summary.",
			);
		},
	},
);

/**
 * Rate-Limited Chat
 *
 * Limits: 5 calls per minute
 */
export const rateLimitedChat = rateLimit(
	async (
		projectId: string,
		message: string,
		history?: Array<{ role: string; content: string }>,
	) => chatWithProject(projectId, message, history),
	{
		...RATE_LIMITS.CHAT,
		onReject: () => {
			throw new Error("Chat rate limit exceeded. Please wait a moment.");
		},
	},
);

/**
 * Rate-Limited Tag Suggestions
 *
 * Limits: 10 calls per minute
 */
export const rateLimitedTags = rateLimit(
	async (description: string) => suggestTags(description),
	{
		...RATE_LIMITS.TAGS,
		onReject: () => {
			throw new Error("Tag suggestion rate limit exceeded.");
		},
	},
);

/**
 * Rate-Limited Recommendations
 *
 * Limits: 10 calls per minute
 */
export const rateLimitedRecommendations = rateLimit(
	async (projectId: string, userInterests?: string[], limit?: number) =>
		getRecommendations(projectId, userInterests, limit),
	{
		...RATE_LIMITS.RECOMMENDATIONS,
		onReject: () => {
			throw new Error("Recommendations rate limit exceeded. Please wait.");
		},
	},
);

/**
 * Batched Embedding Generation
 *
 * Collects multiple embedding requests and processes them together
 * More efficient than individual calls
 */
export const batchedEmbeddings = batch<{
	text: string;
	resolve: (embedding: number[]) => void;
	reject: (error: Error) => void;
}>(
	async (requests) => {
		try {
			// Generate all embeddings in parallel
			const results = await Promise.allSettled(
				requests.map((req) => generateEmbedding(req.text)),
			);

			// Resolve/reject each request
			results.forEach((result, index) => {
				if (result.status === "fulfilled") {
					requests[index].resolve(result.value);
				} else {
					requests[index].reject(
						new Error(`Embedding failed: ${result.reason}`),
					);
				}
			});
		} catch (error) {
			// Reject all on batch failure
			requests.forEach((req) =>
				req.reject(
					error instanceof Error ? error : new Error("Batch embedding failed"),
				),
			);
		}
	},
	{
		maxSize: 5, // Process 5 embeddings at a time
		wait: 1000, // Or wait 1 second
	},
);

/**
 * Helper: Generate embedding with batching
 *
 * Usage: await batchGenerateEmbedding("some text")
 */
export function batchGenerateEmbedding(text: string): Promise<number[]> {
	return new Promise((resolve, reject) => {
		batchedEmbeddings({ text, resolve, reject });
	});
}

/**
 * Queued Summary Generation
 *
 * Processes summaries one at a time to avoid overloading the AI
 */
export const queuedSummary = queue<{
	project: any;
	resolve: (summary: any) => void;
	reject: (error: Error) => void;
}>(
	async (request) => {
		try {
			const summary = await generateSummary(request.project);
			request.resolve(summary);
		} catch (error) {
			request.reject(
				error instanceof Error ? error : new Error("Summary generation failed"),
			);
		}
	},
	{ wait: 2000 }, // Wait 2 seconds between summaries
);

/**
 * Helper: Generate summary with queuing
 *
 * Usage: await queueGenerateSummary(project)
 */
export function queueGenerateSummary(project: any): Promise<any> {
	return new Promise((resolve, reject) => {
		queuedSummary({ project, resolve, reject });
	});
}

/**
 * Export all utilities
 */
export const PacerAI = {
	// Rate limited
	embedding: rateLimitedEmbedding,
	search: rateLimitedSearch,
	parse: rateLimitedParse,
	summary: rateLimitedSummary,
	chat: rateLimitedChat,
	tags: rateLimitedTags,
	recommendations: rateLimitedRecommendations,

	// Batched
	batchEmbedding: batchGenerateEmbedding,

	// Queued
	queueSummary: queueGenerateSummary,
} as const;

/**
 * Example Usage:
 *
 * // Rate limited search
 * import { PacerAI } from '@/lib/pacer-ai-utils';
 *
 * try {
 *   const results = await PacerAI.search("AI projects");
 * } catch (error) {
 *   // Handle rate limit error
 *   alert(error.message);
 * }
 *
 * // Batched embeddings (more efficient)
 * const embeddings = await Promise.all([
 *   PacerAI.batchEmbedding("text 1"),
 *   PacerAI.batchEmbedding("text 2"),
 *   PacerAI.batchEmbedding("text 3"),
 * ]);
 * // ^ These will be processed together in a batch
 *
 * // Queued summaries (one at a time)
 * const summary1 = PacerAI.queueSummary(project1); // Starts immediately
 * const summary2 = PacerAI.queueSummary(project2); // Waits 2 seconds
 * const summary3 = PacerAI.queueSummary(project3); // Waits 4 seconds
 */

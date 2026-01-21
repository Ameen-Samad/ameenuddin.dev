/**
 * Example: Protected Embeddings Endpoint with Rate Limiting
 *
 * Copy this pattern to protect other AI endpoints.
 * Replace 'embeddings-protected.example.tsx' with actual endpoint filename.
 */

import { createFileRoute } from "@tanstack/react-router";
import {
	checkRateLimit,
	rateLimitResponse,
	addRateLimitHeaders,
	RATE_LIMITS,
} from "@/lib/rate-limit";

export const Route = createFileRoute("/api/workers/embeddings-protected/example")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request, context }) => {
		// Get Cloudflare environment (contains KV bindings)
		const env = context.cloudflare?.env as
			| { AI: any; RATE_LIMIT?: KVNamespace }
			| undefined;

		// ========================================
		// STEP 1: Check Rate Limit
		// ========================================
		const rateLimit = await checkRateLimit(
			request,
			"embeddings", // Endpoint identifier
			RATE_LIMITS.EMBEDDINGS, // 20 requests per minute
			env?.RATE_LIMIT, // KV namespace (undefined in local dev)
		)

		// Return 429 if limit exceeded
		if (!rateLimit.success) {
			return rateLimitResponse(rateLimit);
		}

		// ========================================
		// STEP 2: Process Request Normally
		// ========================================
		try {
			const { text } = await request.json();

			if (!text) {
				return new Response(
					JSON.stringify({ error: "Text is required" }),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				)
			}

			// Generate embedding using Cloudflare AI
			const result = await env?.AI.run("@cf/google/embeddinggemma-300m", {
				text: [text],
			})

			const response = new Response(
				JSON.stringify({
					embedding: result?.data?.[0] || [],
					cached: false,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			)

			// ========================================
			// STEP 3: Add Rate Limit Headers
			// ========================================
			return addRateLimitHeaders(response, rateLimit);
		} catch (error) {
			console.error("Embeddings error:", error);
			return new Response(
				JSON.stringify({
					error: "Internal server error",
					message:
						error instanceof Error ? error.message : "Unknown error",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			)
		}
	},
});

/**
 * How to Apply to Other Endpoints
 * ================================
 *
 * 1. Import rate limit utilities:
 *    import { checkRateLimit, rateLimitResponse, addRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
 *
 * 2. Choose appropriate limit from RATE_LIMITS:
 *    - RATE_LIMITS.SEARCH - 30/min (cheap)
 *    - RATE_LIMITS.EMBEDDINGS - 20/min
 *    - RATE_LIMITS.SUMMARY - 5/min (expensive, costs 3x)
 *    - RATE_LIMITS.CHAT - 10/min (costs 2x)
 *    - RATE_LIMITS.THREE_JS - 3/min (very expensive, costs 5x)
 *
 * 3. Add rate limit check before processing:
 *    const rateLimit = await checkRateLimit(request, 'endpoint-name', RATE_LIMITS.XXX, env?.RATE_LIMIT);
 *    if (!rateLimit.success) return rateLimitResponse(rateLimit);
 *
 * 4. Add headers to successful response:
 *    return addRateLimitHeaders(response, rateLimit);
 *
 * Done! Endpoint is now protected.
 */

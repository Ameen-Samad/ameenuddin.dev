/**
 * Rate Limiting Utility for AI Endpoints
 *
 * Protects expensive AI operations from abuse using Cloudflare KV storage.
 * Implements token bucket algorithm with per-IP and per-endpoint tracking.
 */

export interface RateLimitConfig {
	/** Maximum number of requests allowed in the time window */
	maxRequests: number;
	/** Time window in seconds */
	windowSeconds: number;
	/** Optional: Cost multiplier for expensive operations */
	cost?: number;
}

export interface RateLimitResult {
	success: boolean;
	limit: number;
	remaining: number;
	resetAt: number;
	retryAfter?: number;
}

/**
 * Rate limit tiers for different AI operations
 */
export const RATE_LIMITS = {
	// Cheap operations - more permissive
	SEARCH: { maxRequests: 30, windowSeconds: 60 }, // 30/min
	EMBEDDINGS: { maxRequests: 20, windowSeconds: 60 }, // 20/min
	TAGS: { maxRequests: 20, windowSeconds: 60 }, // 20/min
	PARSE: { maxRequests: 30, windowSeconds: 60 }, // 30/min

	// Expensive operations - more restrictive
	SUMMARY: { maxRequests: 5, windowSeconds: 60, cost: 3 }, // 5/min (costs 3x)
	CHAT: { maxRequests: 10, windowSeconds: 60, cost: 2 }, // 10/min (costs 2x)
	RECOMMENDATIONS: { maxRequests: 10, windowSeconds: 60 }, // 10/min
	THREE_JS: { maxRequests: 3, windowSeconds: 60, cost: 5 }, // 3/min (costs 5x)

	// Very expensive operations - highly restrictive
	IMAGE_GENERATION: { maxRequests: 3, windowSeconds: 86400 }, // 3/day

	// Per-IP global limit across all endpoints
	GLOBAL: { maxRequests: 100, windowSeconds: 3600 }, // 100/hour total
} as const;

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
	// Try Cloudflare headers first
	const cfIP = request.headers.get("CF-Connecting-IP");
	if (cfIP) return cfIP;

	// Fallback to X-Forwarded-For
	const forwardedFor = request.headers.get("X-Forwarded-For");
	if (forwardedFor) return forwardedFor.split(",")[0].trim();

	// Last resort: X-Real-IP
	const realIP = request.headers.get("X-Real-IP");
	if (realIP) return realIP;

	return "unknown";
}

/**
 * Generate rate limit key for KV storage
 */
function getRateLimitKey(ip: string, endpoint: string): string {
	return `ratelimit:${ip}:${endpoint}`;
}

/**
 * Check and update rate limit using KV storage
 */
export async function checkRateLimit(
	request: Request,
	endpoint: string,
	config: RateLimitConfig,
	kv?: KVNamespace<string>,
): Promise<RateLimitResult> {
	// If KV is not available (local dev), allow all requests
	if (!kv) {
		return {
			success: true,
			limit: config.maxRequests,
			remaining: config.maxRequests,
			resetAt: Date.now() + config.windowSeconds * 1000,
		};
	}

	const ip = getClientIP(request);
	const key = getRateLimitKey(ip, endpoint);
	const now = Date.now();
	const cost = config.cost || 1;

	// Get current rate limit data
	const data = await kv.get(key, "json");
	const limit = config.maxRequests;

	if (!data) {
		// First request - initialize
		const resetAt = now + config.windowSeconds * 1000;
		await kv.put(
			key,
			JSON.stringify({
				count: cost,
				resetAt,
			}),
			{ expirationTtl: config.windowSeconds },
		);

		return {
			success: true,
			limit,
			remaining: limit - cost,
			resetAt,
		};
	}

	const { count, resetAt } = data as { count: number; resetAt: number };

	// Check if window has expired
	if (now > resetAt) {
		// Reset the counter
		const newResetAt = now + config.windowSeconds * 1000;
		await kv.put(
			key,
			JSON.stringify({
				count: cost,
				resetAt: newResetAt,
			}),
			{ expirationTtl: config.windowSeconds },
		);

		return {
			success: true,
			limit,
			remaining: limit - cost,
			resetAt: newResetAt,
		};
	}

	// Check if limit exceeded
	if (count + cost > limit) {
		const retryAfter = Math.ceil((resetAt - now) / 1000);
		return {
			success: false,
			limit,
			remaining: 0,
			resetAt,
			retryAfter,
		};
	}

	// Increment counter
	await kv.put(
		key,
		JSON.stringify({
			count: count + cost,
			resetAt,
		}),
		{ expirationTtl: Math.ceil((resetAt - now) / 1000) },
	);

	return {
		success: true,
		limit,
		remaining: limit - (count + cost),
		resetAt,
	};
}

/**
 * Create rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
	const headers = new Headers({
		"Content-Type": "application/json",
		"X-RateLimit-Limit": result.limit.toString(),
		"X-RateLimit-Remaining": result.remaining.toString(),
		"X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
	});

	if (result.retryAfter) {
		headers.set("Retry-After", result.retryAfter.toString());
	}

	return new Response(
		JSON.stringify({
			error: "Rate limit exceeded",
			message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
			limit: result.limit,
			remaining: result.remaining,
			resetAt: result.resetAt,
		}),
		{
			status: 429,
			headers,
		},
	);
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
	response: Response,
	result: RateLimitResult,
): Response {
	const newResponse = new Response(response.body, response);
	newResponse.headers.set("X-RateLimit-Limit", result.limit.toString());
	newResponse.headers.set("X-RateLimit-Remaining", result.remaining.toString());
	newResponse.headers.set(
		"X-RateLimit-Reset",
		new Date(result.resetAt).toISOString(),
	);
	return newResponse;
}

# Rate Limiting for AI Endpoints

## Overview

To prevent abuse and control costs, all AI endpoints are protected with rate limiting using Cloudflare KV storage.

## Rate Limit Tiers

Different endpoints have different limits based on computational cost:

| Endpoint | Limit | Window | Cost | Reason |
|----------|-------|--------|------|--------|
| **Search** | 30 req | 1 min | 1x | Fast embedding lookup |
| **Embeddings** | 20 req | 1 min | 1x | Moderate AI cost |
| **Tags** | 20 req | 1 min | 1x | Fast classification |
| **Parse Query** | 30 req | 1 min | 1x | Lightweight NLP |
| **Summary** | 5 req | 1 min | 3x | Expensive LLM call |
| **Chat** | 10 req | 1 min | 2x | Conversational AI |
| **Recommendations** | 10 req | 1 min | 1x | Embedding + search |
| **Three.js Generation** | 3 req | 1 min | 5x | Very expensive code generation |
| **Global (per IP)** | 100 req | 1 hour | - | Total across all endpoints |

### Cost Multiplier

Some operations have a cost multiplier, meaning they consume more of your rate limit budget:
- Chat (2x): One chat request counts as 2 requests
- Summary (3x): One summary request counts as 3 requests
- Three.js Gen (5x): One code generation counts as 5 requests

## Setup

### 1. Create KV Namespace in Cloudflare Dashboard

```bash
# Using Wrangler CLI
wrangler kv:namespace create RATE_LIMIT

# This will output an ID like:
# { binding = "RATE_LIMIT", id = "abc123..." }
```

### 2. Update wrangler.jsonc

Replace `rate-limit-kv-id` with your actual KV namespace ID:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "RATE_LIMIT",
      "id": "YOUR_ACTUAL_KV_ID_HERE",  // ← Replace this
      "preview_id": "YOUR_PREVIEW_KV_ID"
    }
  ]
}
```

### 3. Deploy

```bash
pnpm run build
pnpm run deploy
```

Rate limiting will be active automatically on all protected endpoints.

## Implementation

### Using Rate Limiting in Workers

```typescript
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';

export default {
  async fetch(request: Request, env: Env) {
    // Check rate limit
    const rateLimit = await checkRateLimit(
      request,
      'embeddings',
      RATE_LIMITS.EMBEDDINGS,
      env.RATE_LIMIT
    );

    // Return 429 if limit exceeded
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // Process request normally
    const response = await generateEmbedding(request, env);

    // Add rate limit headers to response
    return addRateLimitHeaders(response, rateLimit);
  }
};
```

### Example: Protected Embeddings Endpoint

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";

export const Route = createFileRoute("/api/workers/embeddings")({
  POST: async ({ request, context }) => {
    const env = context.cloudflare?.env;

    // Rate limiting (only in production with KV)
    const rateLimit = await checkRateLimit(
      request,
      "embeddings",
      RATE_LIMITS.EMBEDDINGS,
      env?.RATE_LIMIT
    );

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    try {
      const { text } = await request.json();

      if (!text) {
        return new Response("Text is required", { status: 400 });
      }

      // Generate embedding using Cloudflare AI
      const embedding = await env.AI.run('@cf/google/embeddinggemma-300m', {
        text: [text]
      });

      const response = new Response(
        JSON.stringify({ embedding: embedding.data[0] }),
        { headers: { "Content-Type": "application/json" } }
      );

      // Add rate limit headers
      return addRateLimitHeaders(response, rateLimit);
    } catch (error) {
      console.error("Embeddings error:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },
});
```

## Response Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 2025-01-21T16:30:00Z
```

When rate limited (429 response):

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-01-21T16:30:00Z
Retry-After: 42
```

## Local Development

Rate limiting is **disabled** in local development (when `env.RATE_LIMIT` is undefined). This allows you to test freely without KV setup.

To test rate limiting locally:

```bash
# Use Wrangler dev mode with KV bindings
pnpm run dev:worker
```

## Monitoring

### Check Current Limits

```bash
# List all rate limit keys
wrangler kv:key list --namespace-id YOUR_KV_ID

# Get specific IP's limit
wrangler kv:key get "ratelimit:1.2.3.4:embeddings" --namespace-id YOUR_KV_ID
```

### Clear Rate Limits

```bash
# Clear specific IP
wrangler kv:key delete "ratelimit:1.2.3.4:embeddings" --namespace-id YOUR_KV_ID

# Clear all (use with caution!)
wrangler kv:key list --namespace-id YOUR_KV_ID | jq -r '.[] | .name' | xargs -I {} wrangler kv:key delete {} --namespace-id YOUR_KV_ID
```

## Adjusting Limits

Edit `src/lib/rate-limit.ts` to adjust limits:

```typescript
export const RATE_LIMITS = {
  EMBEDDINGS: { maxRequests: 30, windowSeconds: 60 }, // Increase to 30/min
  THREE_JS: { maxRequests: 5, windowSeconds: 60, cost: 5 }, // Increase to 5/min
  // ... etc
} as const;
```

Redeploy after changes:

```bash
pnpm run deploy
```

## Cost Estimation

### With Current Limits

Assuming maximum usage (all users hitting limits):

| Endpoint | Max Req/Hour | Model | Cost per 1M | Hourly Cost |
|----------|--------------|-------|-------------|-------------|
| Three.js Gen | 180 | Qwen 2.5 Coder 32B | $0.50 | $0.00009 |
| Chat | 600 | Llama 4 Scout 17B | $0.30 | $0.00018 |
| Summary | 300 | Llama 4 Scout 17B | $0.30 | $0.00009 |
| Embeddings | 1200 | EmbeddingGemma 300M | $0.01 | $0.000012 |
| Search | 1800 | Vector Search | $0.00 | $0.00 |

**Total hourly cost (max): ~$0.00038** (~$0.27/month with constant max usage)

### Without Rate Limiting

A single malicious actor could:
- Generate 1000 Three.js scenes = $0.50
- Generate 10,000 summaries = $3.00
- Make 100,000 chat requests = $30.00

**Total potential cost per day: $100+**

## Alternative: Cloudflare Rate Limiting (Paid Plans)

For production sites with high traffic, consider Cloudflare's built-in rate limiting:

1. **Go to**: Cloudflare Dashboard → Security → WAF → Rate limiting rules
2. **Create rule**:
   - Name: "AI Endpoints Protection"
   - Match: `http.request.uri.path contains "/api/workers/"`
   - Rate: 100 requests per minute
   - Action: Block for 60 seconds

**Pros**:
- No code required
- Enterprise-grade
- DDoS protection included

**Cons**:
- Requires paid Cloudflare plan
- Less granular control per endpoint

## Troubleshooting

### Rate Limit Not Working

1. **Check KV namespace ID** in `wrangler.jsonc`
2. **Verify deployment**: `wrangler tail` to see live logs
3. **Check env binding**: `console.log(env.RATE_LIMIT)` should not be undefined

### False Positives

If legitimate users are being rate limited:
1. Increase limits in `RATE_LIMITS` config
2. Whitelist specific IPs (add to rate limit utility)
3. Use authentication to give higher limits to logged-in users

### KV Delays

KV has eventual consistency (~60 seconds). For stricter limits, consider:
- Using Durable Objects (guaranteed consistency)
- Cloudflare Workers Analytics Engine
- Redis-compatible solutions

## Security Best Practices

1. **Monitor KV usage**: Check Cloudflare analytics regularly
2. **Alert on anomalies**: Set up Workers Analytics to detect spikes
3. **IP allowlist**: Create allowlist for known good actors
4. **Honeypot endpoints**: Create fake endpoints to catch bots
5. **CAPTCHA integration**: Add CAPTCHA for repeated violations

## Summary

✅ **Configured**:
- Rate limiting utility in `src/lib/rate-limit.ts`
- KV namespace binding in `wrangler.jsonc`
- Per-endpoint limits based on cost
- Automatic header injection
- Local dev bypass

⏳ **To Do**:
- Create KV namespace: `wrangler kv:namespace create RATE_LIMIT`
- Update `wrangler.jsonc` with actual KV ID
- Apply rate limiting to all AI endpoints
- Deploy and test

🎯 **Result**:
- Costs under control (~$0.27/month max)
- Protected against abuse
- Professional API with proper headers
- Users get clear feedback when limited

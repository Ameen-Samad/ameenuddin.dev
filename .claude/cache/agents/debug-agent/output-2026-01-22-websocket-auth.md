# Debug Report: WebSocket Connection Failure to Cloudflare AI Gateway

Generated: 2026-01-22

## Symptom

WebSocket connection to Cloudflare AI Gateway fails with HTTP 400 Bad Request instead of 101 Switching Protocols.

**Error Details:**
- URL: `wss://gateway.ai.cloudflare.com/v1/90183697cb6664ac7b540cb2b3d9b66d/ameenuddin-ai-gateway/workers-ai?model=@cf/deepgram/flux&encoding=linear16&sample_rate=16000&interim_results=true`
- Auth protocol format: `cf-aig-authorization.kzX5KQIhmoaHf_IpI7B...`
- Response: HTTP 400 (not 101)

## Investigation Steps

1. **Examined WebSocket worker code** (`/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/workers/transcription-ws.ts`)
2. **Checked wrangler configuration** (`/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/workers/wrangler-transcription.toml`)
3. **Reviewed AI Gateway setup documentation** (`/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/AI-GATEWAY-SETUP.md`)
4. **Researched Cloudflare documentation** for authentication requirements

## Evidence

### Finding 1: Incorrect Authentication Format

- **Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/workers/transcription-ws.ts:92-94`
- **Observation:** The code uses subprotocol authentication without the "Bearer " prefix:
  ```typescript
  const authProtocol = `cf-aig-authorization.${env.CLOUDFLARE_API_TOKEN}`;
  const aiWebSocket = new WebSocket(aiGatewayUrl, [authProtocol]);
  ```
- **Relevance:** According to Cloudflare documentation, when using **non-browser WebSocket clients** (like from a Cloudflare Worker), the authentication should use the **header method** with the `Bearer` prefix, not the subprotocol method.

### Finding 2: Wrong Authentication Approach for Workers Runtime

- **Location:** Cloudflare AI Gateway documentation
- **Observation:** There are TWO authentication methods:
  1. **Headers method** (for non-browser environments like Workers): `cf-aig-authorization: Bearer {token}`
  2. **Subprotocol method** (for browser-only): `cf-aig-authorization.{token}` (no Bearer prefix)

  The code is using the browser subprotocol method from within a Cloudflare Worker, which is the wrong approach.

- **Relevance:** Workers have access to custom headers, so they should use the header method.

### Finding 3: Workers WebSocket API Limitation

- **Location:** Cloudflare Workers WebSocket documentation
- **Observation:** In Cloudflare Workers, outbound WebSocket connections created via `new WebSocket(url, protocols)` support:
  - URL
  - Subprotocols array

  BUT the standard Workers WebSocket API does NOT allow passing custom headers to outbound WebSocket connections.

- **Relevance:** This is the core problem. The Worker cannot add the `cf-aig-authorization: Bearer {token}` header to an outbound WebSocket, and the subprotocol format being used may not be recognized.

### Finding 4: November 2025 Change - Automatic Authentication

- **Location:** Cloudflare AI Gateway Changelog (2025-11-14)
- **Observation:** "You can now utilize Workers AI through AI Gateway without needing to generate or pass additional authentication tokens - setup is now automatic."
- **Relevance:** When accessing AI Gateway from within a Cloudflare Worker that has the AI binding, authentication may be handled automatically. However, this may require using the Worker binding approach rather than direct WebSocket connections.

### Finding 5: Alternative URL Format for Deepgram Direct Provider

- **Location:** Cloudflare AI Gateway Deepgram provider documentation
- **Observation:** For Deepgram (native provider, not workers-ai), the URL format is:
  `wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/deepgram/`

  vs the workers-ai format:
  `wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/workers-ai?model=@cf/deepgram/flux`

- **Relevance:** The `/workers-ai` endpoint may have different authentication requirements than the `/deepgram/` endpoint.

## Root Cause Analysis

**Most Likely Cause: Authentication Format Mismatch**

The Worker is using subprotocol authentication (`cf-aig-authorization.{token}`) which is designed for browser clients. When connecting from a Cloudflare Worker to AI Gateway, the system may expect either:

1. **Header-based authentication** with `Bearer` prefix (not possible with standard Workers WebSocket API)
2. **Automatic authentication** through Worker bindings (not being used)

The 400 error suggests the AI Gateway received the request but rejected it during the WebSocket upgrade handshake, likely because:
- The subprotocol format is not recognized/valid for Workers-AI access
- The token format is incorrect (missing Bearer prefix)
- Workers-AI via AI Gateway requires a different authentication flow

**Confidence:** Medium-High

**Alternative Hypotheses:**
1. The API token may be invalid or expired
2. The AI Gateway may require additional headers (like `Authorization: Bearer {token}` in addition to `cf-aig-authorization`)
3. The Flux model parameters may have changed (though this would more likely cause a different error)

## Recommended Fix

### Option A: Use fetch() with headers (Recommended)

Cloudflare Workers can use `fetch()` with a WebSocket upgrade that allows custom headers:

**Files to modify:**
- `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/workers/transcription-ws.ts` (lines 88-94)

**Change from:**
```typescript
const authProtocol = `cf-aig-authorization.${env.CLOUDFLARE_API_TOKEN}`;
const aiWebSocket = new WebSocket(aiGatewayUrl, [authProtocol]);
```

**Change to:**
```typescript
// Use fetch with WebSocket upgrade to include proper headers
const response = await fetch(aiGatewayUrl, {
  headers: {
    'Upgrade': 'websocket',
    'cf-aig-authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
  },
});

if (!response.webSocket) {
  throw new Error(`WebSocket upgrade failed: ${response.status}`);
}

const aiWebSocket = response.webSocket;
aiWebSocket.accept();
```

### Option B: Try Subprotocol with Bearer Prefix

If Option A doesn't work, try including "Bearer " in the subprotocol value:

```typescript
const authProtocol = `cf-aig-authorization.Bearer ${env.CLOUDFLARE_API_TOKEN}`;
const aiWebSocket = new WebSocket(aiGatewayUrl, [authProtocol]);
```

### Option C: Verify API Token Permissions

Ensure the API token has the correct permissions:
- Account > Workers AI > Read
- Account > AI Gateway > Run (not just Read)

```bash
# Test the token with a simple curl request
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option D: Use the AI Binding Instead

For Workers AI access, consider using the AI binding which handles authentication automatically:

```typescript
// In wrangler.toml, add:
// [ai]
// binding = "AI"

// In the Worker, but note: this doesn't support WebSocket for Flux
// Would need to check if there's a streaming alternative
```

## Verification Steps

After implementing the fix:

1. **Deploy the updated worker:**
   ```bash
   npm run deploy:transcription
   ```

2. **Check worker logs:**
   ```bash
   wrangler tail --config workers/wrangler-transcription.toml
   ```

3. **Test the WebSocket connection:**
   ```javascript
   const ws = new WebSocket('wss://ameenuddin.dev/demo/api/ai/transcription');
   ws.onopen = () => console.log('Connected');
   ws.onerror = (e) => console.error('Error:', e);
   ```

## Prevention

1. **Document the authentication pattern:** Add comments explaining the fetch-based WebSocket approach for Workers
2. **Add error logging:** Include the HTTP status code and any response body in error messages
3. **Test authentication separately:** Create a simple test endpoint to verify the API token works

## Sources

- [Cloudflare AI Gateway Authentication](https://developers.cloudflare.com/ai-gateway/configuration/authentication/)
- [Cloudflare AI Gateway Realtime WebSockets API](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/realtime-api/)
- [Cloudflare AI Gateway Changelog](https://developers.cloudflare.com/ai-gateway/changelog/)
- [Deepgram Flux Model Documentation](https://developers.cloudflare.com/workers-ai/models/flux/)
- [Cloudflare Blog: WebSockets support and authentication to AI Gateway](https://blog.cloudflare.com/do-it-again/)
- [Cloudflare AI Gateway Deepgram Provider](https://developers.cloudflare.com/ai-gateway/usage/providers/deepgram/)

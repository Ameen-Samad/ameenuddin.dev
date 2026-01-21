# Debug Report: WebSocket Constructor Protocol Header Invalid

Generated: 2026-01-21

## Symptom

WebSocket connection fails with error:
```
WebSocket Constructor: The protocol header token is invalid.
```

When connecting to:
```
wss://gateway.ai.cloudflare.com/v1/90183697cb6664ac7b540cb2b3d9b66d/ameenuddin-ai-gateway/workers-ai?model=@cf/deepgram/flux&encoding=linear16&sample_rate=16000&interim_results=true
```

## Investigation Steps

1. Read `workers/transcription-ws.ts` around line 115
2. Found the WebSocket constructor call
3. Analyzed the second argument being passed
4. Compared against WebSocket API specification

## Evidence

### Finding 1: Incorrect WebSocket Constructor Usage

- **Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/workers/transcription-ws.ts:115-119`
- **Observation:** The code passes an object with `headers` property as the second argument:
  ```typescript
  const aiWebSocket = new WebSocket(aiGatewayUrl, {
    headers: {
      'cf-aig-authorization': env.CLOUDFLARE_API_TOKEN,
    },
  } as any);
  ```
- **Relevance:** This is NOT valid according to the WebSocket API specification

### Finding 2: WebSocket Constructor Signature

The WebSocket constructor signature is:
```typescript
new WebSocket(url: string, protocols?: string | string[])
```

The second argument (`protocols`) must be:
- A string (single subprotocol)
- An array of strings (multiple subprotocols)
- NOT an object with headers

When you pass `{ headers: {...} }`, JavaScript converts this object to a string `"[object Object]"` which is then parsed as a protocol token. The string `"[object Object]"` contains invalid characters for a WebSocket protocol header (spaces, brackets).

### Finding 3: WebSocket Protocol Header Rules (RFC 6455)

Per RFC 6455 Section 4.3, the `Sec-WebSocket-Protocol` header field:
- Must contain only valid token characters
- Invalid characters: spaces, brackets `[]`, commas, etc.
- `"[object Object]"` violates these rules

## Root Cause Analysis

**Root Cause:** The code attempts to pass HTTP headers to a WebSocket constructor using a non-standard object syntax that doesn't exist in the WebSocket API.

**Why it fails:**
1. The standard WebSocket API does not support a `headers` option
2. When an object is passed as the second argument, it's coerced to string `"[object Object]"`
3. This invalid protocol string triggers the "protocol header token is invalid" error

**Confidence:** High

**Alternative hypotheses:** None - this is a clear API misuse.

## Recommended Fix

**Files to modify:**
- `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/workers/transcription-ws.ts` (lines 115-119)

### Option 1: Use Cloudflare's `fetch()` with WebSocket Upgrade

In Cloudflare Workers, use the `fetch()` API to make WebSocket connections with custom headers:

```typescript
// Replace lines 115-119 with:
const aiGatewayResponse = await fetch(aiGatewayUrl.replace('wss://', 'https://'), {
  headers: {
    'Upgrade': 'websocket',
    'cf-aig-authorization': env.CLOUDFLARE_API_TOKEN,
  },
});

const aiWebSocket = aiGatewayResponse.webSocket;
if (!aiWebSocket) {
  throw new Error('Failed to establish WebSocket connection to AI Gateway');
}
aiWebSocket.accept();
```

### Option 2: Use URL-based Authentication (if supported by AI Gateway)

If Cloudflare AI Gateway supports token in URL:
```typescript
const aiGatewayUrl = `wss://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.CLOUDFLARE_GATEWAY_ID}/workers-ai?model=@cf/deepgram/flux&encoding=linear16&sample_rate=16000&interim_results=true&token=${env.CLOUDFLARE_API_TOKEN}`;

const aiWebSocket = new WebSocket(aiGatewayUrl);
```

### Option 3: Use Subprotocol for Token (non-standard but sometimes used)

Some services accept auth via subprotocol:
```typescript
const aiWebSocket = new WebSocket(aiGatewayUrl, [env.CLOUDFLARE_API_TOKEN]);
```

**Recommended:** Option 1 is the correct Cloudflare Workers pattern for WebSocket connections with custom headers.

## Steps to Implement Fix

1. Replace the WebSocket constructor (lines 115-119) with the `fetch()` pattern
2. Update the WebSocket event handlers to use the `aiWebSocket` returned from `fetch()`
3. Ensure proper error handling if `webSocket` is undefined in response
4. Test locally with `wrangler dev`
5. Deploy with `npm run deploy:ws`

## Prevention

1. **Do not use `as any`** - TypeScript would have caught this error if the type assertion wasn't used
2. **Read Cloudflare Workers WebSocket docs** - The Workers runtime has a specific pattern for outbound WebSocket connections
3. **Use typed APIs** - Remove `as any` casts and let TypeScript validate constructor arguments

## References

- [RFC 6455 - WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [Cloudflare Workers WebSocket Documentation](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [MDN WebSocket Constructor](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket)

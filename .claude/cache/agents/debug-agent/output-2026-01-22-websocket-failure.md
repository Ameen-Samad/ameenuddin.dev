# Debug Report: WebSocket Connection Failures (Error 1006)
Generated: 2026-01-22

## Symptom

WebSocket connections to both endpoints fail with error code 1006 (abnormal closure):
- `wss://ameenuddin.dev/demo/api/ai/transcription` (speech-to-text)
- `wss://ameenuddin.dev/demo/api/ai/tts-stream` (text-to-speech)

When testing with `wscat`, the actual error revealed is:
```
error: Unexpected server response: 500
```

## Investigation Steps

1. **Checked worker files** - Found both `workers/transcription-ws.ts` and `workers/tts-ws.ts` exist and have proper WebSocket upgrade handling.

2. **Checked wrangler configurations** - Both `workers/wrangler-transcription.toml` and `workers/wrangler-tts.toml` have correct routes configured.

3. **Verified routing is working** - Non-WebSocket requests return the expected 400 response with usage info (the worker IS being reached).

4. **Tested WebSocket upgrade** - Returns HTTP 500, not 101 (upgrade), indicating server-side failure during setup.

5. **Checked secrets configuration** - Found the **root cause**.

## Evidence

### Finding 1: Missing Secrets
- **Location:** Cloudflare Workers secret store
- **Observation:** `npx wrangler secret list` returns empty `[]` for both workers
- **Relevance:** The `CLOUDFLARE_API_TOKEN` secret is required but not configured

### Finding 2: Code Validation Check
- **Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/workers/transcription-ws.ts:87-99`
- **Observation:** Code checks for required env variables and returns 500 if missing:
```typescript
if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_GATEWAY_ID || !env.CLOUDFLARE_API_TOKEN) {
  return new Response(
    JSON.stringify({
      error: 'Configuration error',
      details: 'Required environment variables not set. See AI-GATEWAY-SETUP.md',
      required: ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_GATEWAY_ID', 'CLOUDFLARE_API_TOKEN'],
    }),
    { status: 500, ... },
  );
}
```
- **Relevance:** This is the exact code path that returns 500 when secrets are missing

### Finding 3: Environment Variables vs Secrets
- **Location:** `workers/wrangler-transcription.toml:14-18`
- **Observation:** Only non-sensitive vars are in wrangler.toml:
```toml
[vars]
CLOUDFLARE_ACCOUNT_ID = "90183697cb6664ac7b540cb2b3d9b66d"
CLOUDFLARE_GATEWAY_ID = "ameenuddin-ai-gateway"
# CLOUDFLARE_API_TOKEN must be set via wrangler secret
```
- **Relevance:** The API token must be set separately as a secret

### Finding 4: Documentation Confirms Setup Required
- **Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/WEBSOCKET-DEPLOYMENT.md:82-90`
- **Observation:** Setup instructions clearly state:
```bash
# For transcription worker
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml

# For TTS worker
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-tts.toml
```
- **Relevance:** This step was not completed during deployment

## Root Cause Analysis

The `CLOUDFLARE_API_TOKEN` secret has not been set for either WebSocket worker. Without this token, the workers cannot authenticate with Cloudflare AI Gateway, causing the WebSocket upgrade to fail with a 500 error. The browser interprets this as error 1006 (abnormal closure) because the upgrade never completes.

**Confidence:** HIGH

**Why error 1006 specifically:**
- Error 1006 = "Abnormal Closure" in WebSocket protocol
- Browser gets HTTP 500 instead of HTTP 101 (Switching Protocols)
- Without a proper upgrade response, the connection closes abnormally

## Recommended Fix

**Files to modify:** None (configuration only)

**Steps:**

1. Get a Cloudflare API token with Workers AI permissions from:
   https://dash.cloudflare.com/profile/api-tokens

2. Set the secret for the transcription worker:
```bash
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml
# Paste the API token when prompted
```

3. Set the secret for the TTS worker:
```bash
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-tts.toml
# Paste the API token when prompted
```

4. Verify secrets are set:
```bash
npx wrangler secret list --config workers/wrangler-transcription.toml
npx wrangler secret list --config workers/wrangler-tts.toml
# Both should now show CLOUDFLARE_API_TOKEN
```

5. Test the WebSocket connections:
```bash
npx wscat -c wss://ameenuddin.dev/demo/api/ai/transcription
# Should receive: {"type":"connected","message":"Connected to Deepgram Flux",...}
```

## Prevention

1. **Add deployment checklist** - Include secret verification in CI/CD pipeline
2. **Deployment script update** - Consider adding a `deploy:ws:check` script that validates secrets before deployment
3. **Better error response** - The 500 error could include more detail for debugging (though not the actual missing secret name for security)

## Alternative Hypotheses (Ruled Out)

| Hypothesis | Why Ruled Out |
|------------|---------------|
| Route conflict with main app | Routes are specific paths, not caught by `/*` pattern; worker IS being reached |
| WebSocket upgrade code bug | Code follows correct Cloudflare WebSocketPair pattern; returns proper 101 response when env check passes |
| AI Gateway misconfiguration | Cannot test without token, but env vars `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_GATEWAY_ID` are set in wrangler.toml |

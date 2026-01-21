# Debug Report: WebSocket Connection Failing for Transcription API

Generated: 2026-01-21

## Symptom

WebSocket connection to `wss://ameenuddin.dev/demo/api/ai/transcription` fails. The client receives a connection error when attempting to establish a WebSocket connection for real-time voice transcription.

## Investigation Steps

1. **Reviewed wrangler.jsonc** - Confirmed AI binding is properly configured
2. **Located transcription endpoint** - Found at `src/routes/demo/api.ai.transcription.ts`
3. **Analyzed WebSocket implementation** - Uses Cloudflare's `WebSocketPair` pattern
4. **Compared with working API routes** - Found structural consistency with other `server: { handlers: {} }` routes
5. **Researched TanStack Start + WebSocket support** - Discovered critical framework limitation

## Evidence

### Finding 1: AI Binding Configuration is Correct
- **Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/wrangler.jsonc` (lines 21-23)
- **Observation:** AI binding properly configured:
  ```json
  "ai": {
    "binding": "AI"
  }
  ```
- **Relevance:** AI binding is NOT the root cause - it's correctly configured

### Finding 2: WebSocket Handler Implementation Looks Correct
- **Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/src/routes/demo/api.ai.transcription.ts` (lines 96-223)
- **Observation:** Implementation follows standard Cloudflare Workers WebSocket pattern:
  - Checks for `Upgrade: websocket` header (line 44)
  - Creates `WebSocketPair` (line 98)
  - Returns `Response(null, { status: 101, webSocket: client })` (lines 220-223)
- **Relevance:** The code pattern is correct for pure Cloudflare Workers, but...

### Finding 3: TanStack Start Does NOT Support WebSocket Upgrade in Server Route Handlers
- **Location:** GitHub Discussion [#4576](https://github.com/TanStack/router/discussions/4576)
- **Observation:** Multiple users report WebSocket support is unclear/missing in TanStack Start. Key quotes:
  - "I cannot find much around websockets on the documentation of any part of the stack"
  - "how do you implement websocket in a tanstack start app right now?"
- **Relevance:** **THIS IS THE ROOT CAUSE** - TanStack Start's server route handlers (`server: { handlers: { GET: ... } }`) do not properly pass through WebSocket upgrade responses

### Finding 4: TanStack Start Uses Vite Dev Server + Nitro for Production
- **Location:** [WebSocket Adapter Discussion](https://gist.github.com/darkobits/4b2073742af7d89707e216915fae7e9d)
- **Observation:** Post-Vinxi, TanStack Start:
  - Uses Vite's dev server directly for local development
  - Uses Nitro for building production deployment artifacts
  - Neither Vite dev server nor Nitro's standard handlers support WebSocket upgrade passthrough by default
- **Relevance:** The 101 Switching Protocols response gets intercepted/transformed by the framework layer

### Finding 5: Build Directory is Empty
- **Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/dist/server/`
- **Observation:** Directory exists but contains no files
- **Relevance:** Confirms no recent production build; issue exists in both dev and production

## Root Cause Analysis

**Root Cause:** TanStack Start's server route handler abstraction (`server: { handlers: { GET: ... } }`) does not support returning WebSocket upgrade responses (status 101 with `webSocket` property).

When the handler returns `new Response(null, { status: 101, webSocket: client })`:
1. The Vite dev server (in development) or Nitro (in production) intercepts this response
2. The special `webSocket` property is not recognized/passed through
3. The 101 status may be transformed or the connection is not properly upgraded

**Confidence:** High

**Alternative Hypotheses:**
1. ~~AI binding not available~~ - Ruled out: Properly configured in wrangler.jsonc
2. ~~Incorrect WebSocket URL~~ - Ruled out: URL generation is correct (`wss://` + host + path)
3. ~~Route not registered~~ - Ruled out: Present in routeTree.gen.ts

## Recommended Fix

### Option A: Create a Separate Cloudflare Worker for WebSocket (RECOMMENDED)

Create a dedicated Worker that bypasses TanStack Start entirely for the WebSocket endpoint.

**Files to create:**
- `workers/transcription-ws.ts` - Standalone WebSocket Worker
- Update `wrangler.jsonc` with route-specific config

**Steps:**
1. Create a separate Worker file that handles WebSocket directly
2. Deploy as a route-specific Worker to `/demo/api/ai/transcription`
3. Update client to connect to the dedicated WebSocket endpoint

### Option B: Use Durable Objects for WebSocket

Cloudflare's recommended approach for WebSockets on Workers.

**Steps:**
1. Create a Durable Object class with WebSocket handling
2. Configure in wrangler.jsonc as `durable_objects` binding
3. Route WebSocket connections through the Durable Object

### Option C: Wait for TanStack Start WebSocket Support

Monitor [GitHub Discussion #4576](https://github.com/TanStack/router/discussions/4576) for official support.

**Not recommended** for production use cases with immediate requirements.

### Option D: Use an Alternative Real-Time Approach

Replace WebSocket with Server-Sent Events (SSE) for transcription results.

**Files to modify:**
- `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/src/routes/demo/api.ai.transcription.ts` - Convert to POST + SSE
- `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/src/routes/demo/ai-voice.tsx` - Use fetch + ReadableStream

**Note:** This requires a different audio streaming approach since SSE is unidirectional.

## Immediate Workaround

For development testing, you can use the Worker dev mode which bypasses some of TanStack's middleware:

```bash
npm run dev:worker  # Uses wrangler dev with built artifacts
```

However, this may still not support WebSocket upgrades through TanStack Start's routing.

## Prevention

1. **Document framework limitations** - Add a note in CLAUDE.md about TanStack Start's current WebSocket limitations
2. **Use dedicated Workers for WebSockets** - Keep real-time features separate from the main application
3. **Monitor TanStack Start roadmap** - Watch for WebSocket support in future releases

## Sources

- [TanStack Start Cloudflare Docs](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [GitHub: WebSocket Support Discussion #4576](https://github.com/TanStack/router/discussions/4576)
- [GitHub: Custom Server Support #3777](https://github.com/TanStack/router/discussions/3777)
- [Cloudflare WebSockets API](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [Using WebSockets in Workers](https://developers.cloudflare.com/workers/examples/websockets/)

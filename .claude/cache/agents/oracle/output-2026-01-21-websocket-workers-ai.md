# Research Report: Cloudflare Workers AI WebSocket Support for Deepgram Models
Generated: 2026-01-21

## Summary

WebSocket connections to Cloudflare Workers AI Deepgram models (Flux, Nova-3, Aura-1, Aura-2) **require AI Gateway** - there is no documented way to use WebSockets directly with the `env.AI` binding. The simplest approach is connecting to `wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/workers-ai?model=@cf/deepgram/...` with authentication via the `cf-aig-authorization` header.

## Questions Answered

### Q1: Can we use WebSockets directly with the Workers AI binding (env.AI) without AI Gateway?

**Answer:** No. The `env.AI.run()` binding is REST/HTTP-based only. WebSocket connections to Workers AI models must go through AI Gateway.

**Source:** [Workers AI Bindings Documentation](https://developers.cloudflare.com/workers-ai/configuration/bindings/)

**Confidence:** High - No documentation exists for direct WebSocket binding; all WebSocket examples use AI Gateway URLs.

### Q2: What is the documented way to use Deepgram Flux and Aura models with WebSockets?

**Answer:** Connect to the AI Gateway WebSocket endpoint with model parameters:

**For Flux (STT with voice activity detection - WebSocket ONLY):**
```
wss://gateway.ai.cloudflare.com/v1/<account_id>/<gateway>/workers-ai?model=@cf/deepgram/flux&encoding=linear16&sample_rate=16000
```

**For Aura-1 (TTS):**
```
wss://gateway.ai.cloudflare.com/v1/<account_id>/<gateway>/workers-ai?model=@cf/deepgram/aura-1
```

**For Nova-3 (STT):**
```
wss://gateway.ai.cloudflare.com/v1/<account_id>/<gateway>/workers-ai?model=@cf/deepgram/nova-3&encoding=linear16&sample_rate=16000&interim_results=true
```

**Source:** [Realtime WebSockets API Documentation](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/realtime-api/)

**Confidence:** High - Official documentation with code examples.

### Q3: Is AI Gateway required for WebSocket connections to Workers AI models, or is it optional?

**Answer:** AI Gateway is **required** for WebSocket connections. The standard `env.AI` binding only supports HTTP/REST calls via `env.AI.run()`. There is no alternative WebSocket endpoint like `wss://websocket.ai.cloudflare.com` documented.

**Source:** [AI Gateway WebSockets API](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/)

**Confidence:** High - All official examples and documentation route WebSockets through AI Gateway.

### Q4: Are there examples of using WebSockets with Workers AI without going through AI Gateway?

**Answer:** No documented examples exist for bypassing AI Gateway. All official code samples use `wss://gateway.ai.cloudflare.com/...` URLs.

**Source:** Multiple Cloudflare documentation pages and blog posts

**Confidence:** High - Exhaustive search found no alternative approach.

## Detailed Findings

### Finding 1: AI Gateway is the WebSocket Entry Point

**Source:** [AI Gateway WebSockets API](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/)

**Key Points:**
- AI Gateway offers two WebSocket API types: Realtime (for native WebSocket providers) and Non-Realtime (wrapper for REST APIs)
- Workers AI Deepgram models use the Realtime API
- URL format: `wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/workers-ai?model=...`

**Code Example (STT with Nova-3):**
```javascript
import WebSocket from "ws";
import mic from "mic";

const ws = new WebSocket(
  "wss://gateway.ai.cloudflare.com/v1/<account_id>/<gateway>/workers-ai?model=@cf/deepgram/nova-3&encoding=linear16&sample_rate=16000&interim_results=true",
  {
    headers: {
      "cf-aig-authorization": process.env.CLOUDFLARE_API_KEY,
    },
  },
);

ws.onopen = () => {
  console.log("Connected to STT WebSocket");
  // Start streaming microphone audio
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.channel?.alternatives?.[0]?.transcript) {
    console.log("Transcript:", data.channel.alternatives[0].transcript);
  }
};
```

### Finding 2: Deepgram Flux is WebSocket-ONLY

**Source:** [Flux Model Documentation](https://developers.cloudflare.com/workers-ai/models/flux/), [Changelog](https://developers.cloudflare.com/changelog/2025-10-02-deepgram-flux/)

**Key Points:**
- Flux is a speech recognition model with voice activity detection
- It requires live bi-directional streaming and CANNOT be used via HTTP/REST
- Must use WebSocket connection for any Flux usage
- Supports end-of-turn detection with confidence thresholds (0.3-0.9)

**Parameters:**
- `encoding`: Only `linear16` (raw signed little-endian 16-bit PCM)
- `sample_rate`: Audio sample rate in Hz (e.g., 16000)
- `eager_eot_confidence`: End-of-turn confidence threshold

### Finding 3: Aura TTS WebSocket Example

**Source:** [Realtime WebSockets API](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/realtime-api/)

**Code Example (TTS with Aura-1):**
```javascript
import WebSocket from "ws";
import readline from "readline";
import Speaker from "speaker";

const ws = new WebSocket(
  "wss://gateway.ai.cloudflare.com/v1/<account_id>/<gateway>/workers-ai?model=@cf/deepgram/aura-1",
  {
    headers: {
      "cf-aig-authorization": process.env.CLOUDFLARE_API_KEY,
    },
  },
);

let currentSpeaker = null;

ws.onopen = () => {
  console.log("Connected to Deepgram TTS WebSocket");
};

ws.onmessage = (event) => {
  // Handle audio binary data or JSON metadata
  if (event.data instanceof Buffer) {
    // Raw audio data - pipe to speaker
    if (!currentSpeaker) {
      currentSpeaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 24000,
      });
    }
    currentSpeaker.write(event.data);
  } else {
    // JSON metadata
    const message = JSON.parse(event.data);
    if (message.type === "Flushed") {
      // Audio generation complete
    }
  }
};

// Send text to convert
function speak(text) {
  ws.send(JSON.stringify({ type: "Speak", text }));
  ws.send(JSON.stringify({ type: "Flush" }));
}
```

### Finding 4: Authentication Methods

**Source:** [AI Gateway Authentication](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/)

**Key Points:**
- **Server-side (Node.js):** Use `cf-aig-authorization` header with Cloudflare API token
- **Browser:** Use `sec-websocket-protocol` header (browsers don't allow custom headers)
- BYOK (Bring Your Own Key) can be configured on AI Gateway dashboard

**Browser Authentication Example:**
```javascript
const ws = new WebSocket(
  "wss://gateway.ai.cloudflare.com/v1/<account_id>/<gateway>/workers-ai?model=@cf/deepgram/nova-3",
  ["cf-aig-authorization." + API_TOKEN]  // Protocol-based auth
);
```

### Finding 5: Pricing Differences

**Source:** [Nova-3 Pricing](https://developers.cloudflare.com/workers-ai/models/nova-3/)

| Transport | Price | Neurons |
|-----------|-------|---------|
| WebSocket | $0.0092/audio minute | 836.36/audio minute |
| HTTP | $0.0052/audio minute | 472.73/audio minute |

WebSocket is ~77% more expensive than HTTP, but required for real-time streaming.

### Finding 6: Available Deepgram Models on Workers AI

**Source:** [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)

| Model | Type | Transport |
|-------|------|-----------|
| @cf/deepgram/nova-3 | STT | HTTP + WebSocket |
| @cf/deepgram/flux | STT + VAD | WebSocket ONLY |
| @cf/deepgram/aura-1 | TTS | HTTP + WebSocket |
| @cf/deepgram/aura-2-en | TTS (English) | HTTP + WebSocket |
| @cf/deepgram/aura-2-es | TTS (Spanish) | HTTP + WebSocket |

## Comparison Matrix

| Approach | WebSocket Support | Setup Complexity | Use Case |
|----------|-------------------|------------------|----------|
| AI Gateway WebSocket | Yes | Create gateway in dashboard | Real-time voice agents |
| env.AI.run() binding | No (HTTP only) | Just add AI binding | Batch processing, one-shot inference |
| Direct Deepgram API | Yes | Separate API key | Bypass Workers AI pricing |

## Recommendations

### For This Codebase

1. **Use AI Gateway for WebSocket connections** - Create an AI Gateway in the Cloudflare dashboard, then connect via `wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/workers-ai?model=...`

2. **Keep HTTP for non-streaming** - Continue using `env.AI.run()` for text generation and non-realtime audio processing

3. **Consider Flux for voice agents** - If building real-time voice agents, Flux provides voice activity detection (end-of-turn) built-in

### Implementation Notes

- AI Gateway must be created in the Cloudflare dashboard before use (cannot be created via wrangler)
- Store the gateway ID in environment variables
- Browser clients need protocol-based authentication since they cannot set custom headers
- Consider the 77% price premium for WebSocket vs HTTP when estimating costs
- Flux is WebSocket-only; you cannot use it via HTTP

## Sources

1. [Realtime WebSockets API - Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/realtime-api/) - Official WebSocket documentation with code examples
2. [Workers AI Bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/) - env.AI binding documentation
3. [Flux Model Documentation](https://developers.cloudflare.com/workers-ai/models/flux/) - Flux-specific parameters and usage
4. [Nova-3 Model Documentation](https://developers.cloudflare.com/workers-ai/models/nova-3/) - STT model with pricing
5. [Aura-1 Model Documentation](https://developers.cloudflare.com/workers-ai/models/aura-1/) - TTS model details
6. [Deepgram Flux Changelog](https://developers.cloudflare.com/changelog/2025-10-02-deepgram-flux/) - Flux announcement
7. [Cloudflare Realtime Voice AI Blog](https://blog.cloudflare.com/cloudflare-realtime-voice-ai/) - Architecture overview for voice agents
8. [Workers AI Partner Models Blog](https://blog.cloudflare.com/workers-ai-partner-models/) - Deepgram partnership announcement

## Open Questions

- Is there an undocumented direct WebSocket endpoint (e.g., `wss://websocket.ai.cloudflare.com`) that bypasses AI Gateway? (No evidence found)
- Will future versions of the AI binding support WebSocket connections directly? (No roadmap information found)

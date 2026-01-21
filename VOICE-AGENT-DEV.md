# Voice Agent Development Guide

## The Problem

TanStack Start **does not support WebSocket upgrades** in its server route handlers. The voice agent requires real-time WebSocket connections for audio streaming.

## The Solution

Run TWO separate services in development:

1. **Main App** (TanStack Start) - Serves the UI
2. **WebSocket Worker** - Handles voice transcription

---

## Development Setup

### Single Command (Recommended)
```bash
bun run dev
# or
npm run dev
```

This starts **all services concurrently**:
- **APP** (cyan): Main app on `http://localhost:3000`
- **WS-TRANS** (green): Transcription WebSocket worker on `http://localhost:8787`
- **WS-TTS** (magenta): TTS WebSocket worker on `http://localhost:8788`

### Individual Services (Optional)
If you only need specific services:

```bash
# Main app only
npm run dev:app

# Transcription worker only
npm run dev:transcription

# TTS worker only
npm run dev:tts
```

---

## How It Works

### Development Mode
```
Voice Agent UI (localhost:3000)
    ↓ (WebSocket)
WebSocket Worker (localhost:8787)
    ↓ (WebSocket)
Cloudflare AI Gateway
    ↓
Deepgram Flux Model
```

### Production Mode
```
Voice Agent UI (ameenuddin.dev)
    ↓ (WebSocket)
Same Domain - WebSocket Worker Route (ameenuddin.dev/demo/api/ai/transcription)
    ↓ (WebSocket)
Cloudflare AI Gateway
    ↓
Deepgram Flux Model
```

---

## Testing the Voice Agent

1. **Start all services:**
   ```bash
   bun run dev
   ```
   Wait for all three services to start (you'll see colored output for APP, WS-TRANS, WS-TTS)

2. **Open the voice agent:**
   - Navigate to: `http://localhost:3000/demo/ai-voice`

3. **Connect and test:**
   - Click "Connect" button
   - Should show: "Connected (@cf/deepgram/flux)"
   - Click the microphone button
   - Allow microphone access
   - Speak into your microphone
   - See transcriptions appear in real-time

---

## Environment Variables

The WebSocket worker requires:

```bash
# Set in workers/wrangler-transcription.toml
CLOUDFLARE_ACCOUNT_ID = "90183697cb6664ac7b540cb2b3d9b66d"
CLOUDFLARE_GATEWAY_ID = "ameenuddin-ai-gateway"
```

**Secret (required):**
```bash
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml
```

---

## Troubleshooting

### "WebSocket closed: 1006"
**Cause:** WebSocket worker not running

**Fix:**
```bash
# Make sure you're running the full dev command
bun run dev

# If already running, check that WS-TRANS service started successfully in the output
```

### "Connection lost unexpectedly"
**Cause:** AI Gateway token not set

**Fix:**
```bash
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml
# Paste your Cloudflare API token when prompted
```

### "This endpoint requires a WebSocket connection"
**Cause:** Trying to connect to the wrong endpoint

**Fix:**
- Development: Connect to `ws://localhost:8787/demo/api/ai/transcription`
- Production: Connect to `wss://ameenuddin.dev/demo/api/ai/transcription`

The UI now handles this automatically based on hostname.

---

## Production Deployment

### Deploy Main App
```bash
npm run deploy
```

### Deploy WebSocket Worker
```bash
npm run deploy:transcription
```

Or deploy both:
```bash
npm run deploy:all
```

In production, both services run on the same domain (`ameenuddin.dev`) through Cloudflare routing.

---

## Architecture Notes

- **Why separate workers?** TanStack Start server handlers can't upgrade HTTP connections to WebSocket
- **Port 8787:** Default Wrangler dev server port
- **Auto-detection:** The UI automatically detects dev vs production and connects to the correct URL
- **No CORS issues:** In production, same domain. In dev, WebSocket doesn't enforce CORS the same way.

---

## See Also

- `CLAUDE.md` - TanStack Start WebSocket limitations
- `WEBSOCKET-DEPLOYMENT.md` - Production deployment guide
- `workers/transcription-ws.ts` - WebSocket worker implementation
- `workers/wrangler-transcription.toml` - Worker configuration

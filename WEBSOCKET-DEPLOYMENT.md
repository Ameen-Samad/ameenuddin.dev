# WebSocket Workers Deployment Guide

## Overview

Due to TanStack Start's current limitations with WebSocket support, real-time AI features are deployed as **separate Cloudflare Workers** using **AI Gateway**. These workers bypass TanStack Start entirely and connect directly to Cloudflare's AI Gateway.

## Architecture

```
┌─────────────────────────────────────────┐
│  Main App (TanStack Start)             │
│  ameenuddin.dev/*                       │
│  - Homepage, Demos, Projects            │
│  - API routes (POST/GET)                │
│  - SSR, Static assets                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Transcription Worker (WebSocket)       │
│  ameenuddin.dev/demo/api/ai/transcription│
│  - Speech-to-Text (Deepgram Flux)       │
│  - AI Gateway connection                │
│  - WebSocket upgrade (101)              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TTS Worker (WebSocket)                 │
│  ameenuddin.dev/demo/api/ai/tts-stream  │
│  - Text-to-Speech (Deepgram Aura-2-EN)  │
│  - AI Gateway connection                │
│  - Streaming audio output               │
└─────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `workers/transcription-ws.ts` | Speech-to-Text worker (Flux) |
| `workers/tts-ws.ts` | Text-to-Speech worker (Aura-2-EN) |
| `workers/wrangler-transcription.toml` | Transcription worker config |
| `workers/wrangler-tts.toml` | TTS worker config |
| `AI-GATEWAY-SETUP.md` | AI Gateway setup instructions |
| `.env.example` | Environment variable template |

## Prerequisites

### 1. AI Gateway Setup

**⚠️ REQUIRED: You must create an AI Gateway first!**

Follow the complete setup guide in **`AI-GATEWAY-SETUP.md`**:

1. Create AI Gateway in Cloudflare Dashboard
2. Get API Token with Workers AI permissions
3. Set environment variables

Quick summary:
```bash
# 1. Go to: https://dash.cloudflare.com/
# 2. Navigate to: AI → AI Gateway → Create Gateway
# 3. Name: ameenuddin-ai-gateway
# 4. Note the Gateway ID
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set:
```bash
CLOUDFLARE_ACCOUNT_ID=90183697cb6664ac7b540cb2b3d9b66d
CLOUDFLARE_GATEWAY_ID=your-gateway-id-here
CLOUDFLARE_API_TOKEN=your-api-token-here
```

### 3. Set Production Secrets

```bash
# For transcription worker
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml

# For TTS worker
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-tts.toml
```

Paste your API token when prompted.

---

## Deployment Commands

### Deploy All (Recommended)
```bash
npm run deploy:all
```

Deploys:
1. Main TanStack Start app
2. Transcription WebSocket worker
3. TTS WebSocket worker

### Deploy Only WebSocket Workers
```bash
npm run deploy:websockets
```

Deploys both WebSocket workers (transcription + TTS).

### Deploy Individual Workers

**Transcription worker:**
```bash
npm run deploy:transcription
```

**TTS worker:**
```bash
npm run deploy:tts
```

**Main app:**
```bash
npm run deploy
```

---

## Local Development

### Test Transcription Worker
```bash
npm run dev:transcription
```

Worker runs on `localhost:8787`.

**Test connection:**
```javascript
const ws = new WebSocket('ws://localhost:8787');

ws.onopen = () => {
  console.log('Connected to transcription worker');
  // Send audio data (Int16Array, 16kHz)
  const audioData = new Int16Array(audioBuffer);
  ws.send(audioData.buffer);
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  if (result.type === 'transcription') {
    console.log('Text:', result.data.text);
  }
};
```

### Test TTS Worker
```bash
npm run dev:tts
```

Worker runs on `localhost:8787`.

**Test connection:**
```javascript
const ws = new WebSocket('ws://localhost:8787');

ws.onopen = () => {
  console.log('Connected to TTS worker');

  // Send text to speak
  ws.send(JSON.stringify({
    type: 'Speak',
    text: 'Hello from Deepgram Aura!'
  }));

  // Flush to get audio immediately
  ws.send(JSON.stringify({ type: 'Flush' }));
};

ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    // Raw audio data (PCM, 24kHz, 16-bit)
    playAudio(event.data);
  } else {
    const msg = JSON.parse(event.data);
    console.log('Message:', msg);
  }
};
```

### Test Main App
```bash
npm run dev
```

Runs on `localhost:3000`.

**Note:** WebSocket features won't work in main app dev mode due to TanStack Start limitations. Use dedicated worker dev commands above.

---

## How It Works

### 1. AI Gateway Connection Pattern

**OLD PATTERN (Incorrect - didn't work):**
```typescript
// ❌ This doesn't work - not documented by Cloudflare
const response = await env.AI.run(
  '@cf/deepgram/flux',
  { encoding: 'linear16', sample_rate: '16000' },
  { websocket: true } // Not a real option!
);
```

**NEW PATTERN (Correct - uses AI Gateway):**
```typescript
// ✅ Correct pattern using AI Gateway
const wsUrl = `wss://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/workers-ai?model=@cf/deepgram/flux&encoding=linear16&sample_rate=16000`;

const aiWebSocket = new WebSocket(wsUrl, {
  headers: {
    'cf-aig-authorization': apiToken
  }
});
```

### 2. Worker Flow

```
Client Browser
    ↓ (WebSocket connection)
Cloudflare Worker (transcription-ws.ts)
    ↓ (WebSocket to AI Gateway)
AI Gateway (wss://gateway.ai.cloudflare.com)
    ↓ (Deepgram Flux processing)
AI Model Response
    ↓ (WebSocket back to worker)
Worker (forward to client)
    ↓ (WebSocket back to browser)
Client receives transcription
```

### 3. Audio Formats

**Transcription (Flux - Speech-to-Text):**
- **Input:** linear16 PCM (raw signed little-endian 16-bit)
- **Sample Rate:** 16kHz
- **Channels:** 1 (mono)

**TTS (Aura-2-EN - Text-to-Speech):**
- **Output:** PCM (raw signed 16-bit)
- **Sample Rate:** 24kHz
- **Channels:** 1 (mono)

---

## Troubleshooting

### "Configuration error: Required environment variables not set"

**Fix:**
1. Check `workers/wrangler-transcription.toml` has `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_GATEWAY_ID` in `[vars]` section
2. Set the secret:
   ```bash
   npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml
   ```

### "AI Gateway not found"

**Fix:**
1. Create AI Gateway in Cloudflare Dashboard (see `AI-GATEWAY-SETUP.md`)
2. Verify `CLOUDFLARE_GATEWAY_ID` in wrangler config matches your gateway ID
3. Check gateway is in the same account (`90183697cb6664ac7b540cb2b3d9b66d`)

### "Unauthorized" (401 error)

**Fix:**
1. Verify API token is valid (check Cloudflare Dashboard > My Profile > API Tokens)
2. Ensure token has permissions:
   - Workers AI (Read)
   - AI Gateway (Read)
3. Re-set the secret:
   ```bash
   npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml
   ```

### WebSocket Connection Fails

**Symptoms:**
```
WebSocket connection to 'wss://ameenuddin.dev/demo/api/ai/transcription' failed
```

**Debug steps:**
1. **Check worker is deployed:**
   ```bash
   curl https://ameenuddin.dev/demo/api/ai/transcription
   ```
   Should return JSON with usage instructions (status 400 for non-WebSocket requests).

2. **Check logs:**
   ```bash
   npx wrangler tail --config workers/wrangler-transcription.toml
   ```

3. **Verify route:**
   - Go to Cloudflare Dashboard
   - Workers & Pages → Routes
   - Should show: `ameenuddin.dev/demo/api/ai/transcription` → `ameenuddin-transcription-ws`

### "Workers AI model not found"

**Fix:**
1. Verify model name is correct:
   - Transcription: `@cf/deepgram/flux`
   - TTS: `@cf/deepgram/aura-2-en`
2. Check your account has access to Workers AI models
3. Try in Cloudflare Dashboard: AI → Workers AI → Models

---

## Monitoring

### View Worker Logs

**Transcription:**
```bash
npx wrangler tail --config workers/wrangler-transcription.toml
```

**TTS:**
```bash
npx wrangler tail --config workers/wrangler-tts.toml
```

### Check Deployment Status

**Transcription:**
```bash
npx wrangler deployments list --name ameenuddin-transcription-ws
```

**TTS:**
```bash
npx wrangler deployments list --name ameenuddin-tts-ws
```

### Test Endpoints

**Transcription:**
```bash
curl https://ameenuddin.dev/demo/api/ai/transcription
```

**TTS:**
```bash
curl https://ameenuddin.dev/demo/api/ai/tts-stream
```

Both should return JSON with usage instructions (not errors).

---

## Cost Considerations

| Resource | Free Tier | Overage Cost |
|----------|-----------|--------------|
| AI Gateway | Unlimited | Free |
| Deepgram Flux (STT) | 10,000 requests/day | $0.011 / 1K requests |
| Deepgram Aura (TTS) | 10,000 requests/day | $0.02 / 1K requests |
| WebSocket Workers | 100,000 requests/day | $0.15 / million requests |

**Estimated cost for 1,000 sessions/day:**
- AI Gateway: **Free**
- Flux transcription: **Free** (under 10K limit)
- Aura TTS: **Free** (under 10K limit)
- WebSocket workers: **Free** (under 100K limit)
- **Total: $0/month** 🎉

---

## CI/CD Deployment (GitHub Actions)

Add to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Deploy Main App
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: npm run deploy

      - name: Deploy Transcription Worker
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: npm run deploy:transcription

      - name: Deploy TTS Worker
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: npm run deploy:tts
```

---

## References

- [AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway WebSockets API](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/)
- [Deepgram Flux Model](https://developers.cloudflare.com/workers-ai/models/flux/)
- [Deepgram Aura Model](https://developers.cloudflare.com/workers-ai/models/aura/)
- [TanStack Start WebSocket Discussion](https://github.com/TanStack/router/discussions/4576)

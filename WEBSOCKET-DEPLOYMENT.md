# WebSocket Worker Deployment Guide

## Overview

Due to TanStack Start's current limitations with WebSocket support, the real-time voice transcription endpoint is deployed as a **separate Cloudflare Worker** that bypasses the main app's routing layer.

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
│  WebSocket Worker                       │
│  ameenuddin.dev/demo/api/ai/transcription│
│  - Real-time voice transcription        │
│  - WebSocket upgrade (101)              │
│  - Direct Cloudflare AI binding         │
└─────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `workers/transcription-ws.ts` | Standalone WebSocket Worker implementation |
| `workers/wrangler.toml` | Worker-specific Wrangler configuration |
| `package.json` | Deployment scripts (deploy:ws, deploy:all) |

## Deployment Commands

### Deploy Main App Only
```bash
npm run deploy
```

Builds and deploys the TanStack Start app to Cloudflare Workers.

### Deploy WebSocket Worker Only
```bash
npm run deploy:ws
```

Deploys the WebSocket worker to `/demo/api/ai/transcription`.

### Deploy Both (Recommended)
```bash
npm run deploy:all
```

Deploys both the main app and the WebSocket worker in sequence.

## First-Time Setup

### 1. Authenticate with Wrangler
```bash
npx wrangler login
```

### 2. Verify AI Binding
Ensure your Cloudflare account has access to Workers AI:
```bash
npx wrangler whoami
```

### 3. Deploy WebSocket Worker
```bash
npm run deploy:ws
```

Expected output:
```
Total Upload: 5.xx KiB / gzip: 2.xx KiB
Uploaded ameenuddin-transcription-ws (x.xx sec)
Deployed ameenuddin-transcription-ws triggers (x.xx sec)
  https://ameenuddin.dev/demo/api/ai/transcription
```

### 4. Deploy Main App
```bash
npm run deploy
```

## Local Development

### Test WebSocket Worker Locally
```bash
npm run dev:ws
```

This starts the WebSocket worker on `localhost:8787` using Wrangler dev mode.

**Test the connection:**
```javascript
const ws = new WebSocket('ws://localhost:8787');

ws.onopen = () => {
  console.log('Connected to local WebSocket worker');
};

ws.onmessage = (event) => {
  console.log('Message:', event.data);
};
```

### Run Full App Locally
```bash
npm run dev
```

The main app runs on `localhost:3000`, but **WebSocket connections will fail** because TanStack Start doesn't support WebSocket upgrades in development.

To test WebSocket functionality locally, you must use `npm run dev:ws` separately.

## Production Deployment Workflow

### Standard Deployment (via Git Push)

1. **Commit your changes:**
```bash
git add .
git commit -m "feat: update voice transcription feature"
git push
```

2. **Deploy both workers:**
```bash
npm run deploy:all
```

### CI/CD Deployment (GitHub Actions)

If you have GitHub Actions set up, add this to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

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

      - name: Deploy WebSocket Worker
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: npm run deploy:ws
```

## Troubleshooting

### WebSocket Connection Fails

**Symptom:**
```
WebSocket connection to 'wss://ameenuddin.dev/demo/api/ai/transcription' failed
```

**Check:**
1. **Worker deployed?**
   ```bash
   npx wrangler deployments list --name ameenuddin-transcription-ws
   ```

2. **Route configured?**
   ```bash
   curl https://ameenuddin.dev/demo/api/ai/transcription
   ```
   Should return JSON with usage instructions (status 400).

3. **AI binding available?**
   Check in Cloudflare dashboard: Workers & Pages > ameenuddin-transcription-ws > Settings > Variables and Secrets > AI

### "AI binding not available" Error

**Fix:**
1. Go to Cloudflare dashboard
2. Workers & Pages > ameenuddin-transcription-ws
3. Settings > Variables and Secrets
4. Add AI binding (if missing)
5. Redeploy: `npm run deploy:ws`

### Route Conflict

If the main app tries to handle `/demo/api/ai/transcription`:

1. Check `workers/wrangler.toml` route pattern:
   ```toml
   [[routes]]
   pattern = "ameenuddin.dev/demo/api/ai/transcription"
   zone_name = "ameenuddin.dev"
   ```

2. Worker routes take precedence over the main app.

3. Verify in Cloudflare dashboard:
   - Workers & Pages > Routes
   - Should show `ameenuddin.dev/demo/api/ai/transcription` → `ameenuddin-transcription-ws`

## Monitoring

### View Worker Logs
```bash
npx wrangler tail --config workers/wrangler.toml
```

### Check Deployment Status
```bash
npx wrangler deployments list --name ameenuddin-transcription-ws
```

### Test Connection
```bash
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://ameenuddin.dev/demo/api/ai/transcription
```

Expected response:
```
HTTP/2 101 Switching Protocols
upgrade: websocket
connection: Upgrade
```

## Cost Considerations

| Resource | Cost |
|----------|------|
| WebSocket Worker | $0.15 / million requests |
| Cloudflare AI (Deepgram Flux) | Free tier: 10,000 requests/day |
| Worker CPU time | $0.02 / million GB-seconds |

**Estimated cost for 1,000 voice sessions/day:**
- ~30,000 requests (connect + messages) = $0.0045
- ~1,000 AI transcriptions = Free (under limit)
- Total: **< $0.01/day**

## Future Improvements

When TanStack Start adds WebSocket support:
1. Migrate logic back to `src/routes/demo/api.ai.transcription.ts`
2. Remove `workers/` directory
3. Remove `deploy:ws` and `deploy:all` scripts
4. Monitor [GitHub Discussion #4576](https://github.com/TanStack/router/discussions/4576)

## References

- [Cloudflare Workers WebSockets](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [Cloudflare AI Deepgram Flux](https://developers.cloudflare.com/workers-ai/models/deepgram-flux/)
- [TanStack Start WebSocket Discussion](https://github.com/TanStack/router/discussions/4576)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

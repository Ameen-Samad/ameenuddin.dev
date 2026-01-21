# AI Gateway Setup Guide

## Why You Need AI Gateway

Cloudflare AI Gateway is required for WebSocket-based real-time AI models like:
- **Deepgram Flux** (Speech-to-Text)
- **Deepgram Aura** (Text-to-Speech streaming)

These models require bidirectional WebSocket communication, which isn't supported through the standard `env.AI.run()` binding.

---

## Step 1: Create AI Gateway in Cloudflare Dashboard

### 1.1 Navigate to AI Gateway

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account: **Nasrudin.salim.suden@gmail.com's Account**
3. In the left sidebar, click **AI** → **AI Gateway**
4. Click **Create Gateway**

### 1.2 Configure Gateway

- **Gateway Name**: `ameenuddin-ai-gateway` (or any name you prefer)
- **Gateway ID**: Will be auto-generated (e.g., `my-gateway`)
- Click **Create Gateway**

### 1.3 Note Your Credentials

After creating the gateway, you'll see:
```
wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/workers-ai
```

**Your values:**
- `account_id`: `90183697cb6664ac7b540cb2b3d9b66d`
- `gateway_id`: (copy from the dashboard - will be something like `ameenuddin-ai-gateway`)

---

## Step 2: Get Cloudflare API Token

### 2.1 Create API Token

1. In Cloudflare Dashboard, click your profile icon (top right)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use template: **Edit Cloudflare Workers**
5. Or create custom token with permissions:
   - **Account** → **Workers AI** → **Read**
   - **Account** → **AI Gateway** → **Read**
6. Click **Continue to summary** → **Create Token**
7. **Copy the token** (you'll only see it once!)

### 2.2 Save Token Securely

**⚠️ NEVER commit API tokens to git!**

Add to `.env.local` (already in .gitignore):
```bash
CLOUDFLARE_ACCOUNT_ID=90183697cb6664ac7b540cb2b3d9b66d
CLOUDFLARE_GATEWAY_ID=ameenuddin-ai-gateway
CLOUDFLARE_API_TOKEN=your-api-token-here
```

---

## Step 3: Configure Workers with Environment Variables

### 3.1 Add Secrets to Workers

For production deployment, add secrets to your workers:

```bash
# For transcription worker
cd /Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-transcription.toml

# For TTS worker
npx wrangler secret put CLOUDFLARE_API_TOKEN --config workers/wrangler-tts.toml
```

When prompted, paste your API token.

### 3.2 Update wrangler.toml Files

The account ID and gateway ID will be in the wrangler.toml:

```toml
[vars]
CLOUDFLARE_ACCOUNT_ID = "90183697cb6664ac7b540cb2b3d9b66d"
CLOUDFLARE_GATEWAY_ID = "ameenuddin-ai-gateway"
```

---

## Step 4: Test the Setup

### 4.1 Test Locally

```bash
# Start transcription worker
npm run dev:transcription

# In another terminal, test the WebSocket
node test-websocket.js
```

### 4.2 Test in Production

After deployment:
```bash
npm run deploy:all
```

Test the WebSocket endpoint:
```bash
curl https://ameenuddin.dev/demo/api/ai/transcription
```

Should return JSON with usage instructions (not an error).

---

## Troubleshooting

### "Gateway not found" Error

**Symptom:**
```json
{"error": "AI Gateway not found"}
```

**Fix:**
1. Verify gateway exists in Cloudflare Dashboard
2. Check `CLOUDFLARE_GATEWAY_ID` matches the gateway ID from dashboard
3. Ensure gateway is in the same account as your Worker

### "Unauthorized" Error

**Symptom:**
```json
{"error": "Unauthorized", "status": 401}
```

**Fix:**
1. Verify API token is valid (not expired)
2. Check token has correct permissions (Workers AI Read, AI Gateway Read)
3. Ensure `cf-aig-authorization` header is being sent correctly

### WebSocket Connection Fails

**Symptom:**
```
WebSocket connection to 'wss://...' failed
```

**Fix:**
1. Check browser console for detailed error
2. Verify URL format: `wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/workers-ai?model=...`
3. Test with curl to isolate client vs server issue

---

## Cost Considerations

| Resource | Free Tier | Overage Cost |
|----------|-----------|--------------|
| AI Gateway | Unlimited requests | Free |
| Workers AI (Flux) | 10,000 requests/day | $0.011 / 1K requests |
| Workers AI (Aura) | 10,000 requests/day | $0.02 / 1K requests |

**Estimated cost for 1,000 voice sessions/day:**
- AI Gateway: **Free**
- Flux transcription: **Free** (under 10K limit)
- Aura TTS: **Free** (under 10K limit)
- Total: **$0/month** 🎉

---

## References

- [AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway WebSockets](https://developers.cloudflare.com/ai-gateway/usage/websockets-api/)
- [Deepgram Flux Model](https://developers.cloudflare.com/workers-ai/models/flux/)
- [Deepgram Aura Model](https://developers.cloudflare.com/workers-ai/models/aura/)
- [API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

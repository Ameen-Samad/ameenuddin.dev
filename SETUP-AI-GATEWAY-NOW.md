# ⚠️ ACTION REQUIRED: Create AI Gateway

## Current Status

✅ **Code is fixed and ready** - WebSocket connection pattern is now correct
❌ **AI Gateway doesn't exist yet** - Getting error code 2001

## What You Need to Do Right Now

The code is trying to connect to `ameenuddin-ai-gateway` but it doesn't exist in your Cloudflare account yet.

### Step 1: Create AI Gateway (2 minutes)

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. **Select your account**: Nasrudin.salim.suden@gmail.com's Account
3. **Navigate**: Click **AI** in left sidebar → **AI Gateway**
4. **Create Gateway**:
   - Click **"Create Gateway"** button
   - **Gateway Name**: `ameenuddin-ai-gateway`
   - Click **"Create Gateway"**
5. **Verify**: You should see the gateway listed with a Gateway ID

### Step 2: Verify API Token Has Correct Permissions

Your API token needs these permissions:
- **Account** → **Workers AI** → **Read**
- **Account** → **AI Gateway** → **Read**

If your token doesn't have AI Gateway permission:
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find your token or create a new one
3. Add **AI Gateway → Read** permission
4. Update `workers/.dev.vars` with the new token

### Step 3: Test Locally (After Gateway is Created)

```bash
# Start the worker
npm run dev:transcription

# In another terminal, test the connection
node test-transcription-ws.js
```

You should see:
```
✅ WebSocket connection opened
📤 Sent test audio chunk
📨 Received message: { type: 'connected', model: '@cf/deepgram/flux', ... }
✅ Successfully connected to Deepgram Flux
✅ Test passed! Closing connection...
```

### Step 4: Deploy to Production

```bash
npm run deploy:transcription
npm run deploy:tts
```

## What Was Fixed

The code now uses the correct WebSocket pattern for Cloudflare Workers:

**Before (broken):**
```typescript
const response = await fetch(aiGatewayUrl, { headers: { ... } });
const ws = response.webSocket; // undefined - fetch doesn't work with wss://
```

**After (correct):**
```typescript
const ws = new WebSocket(aiGatewayUrl, [`cf-aig-authorization.${token}`]);
```

This matches the browser authentication pattern and is how Cloudflare Workers make outbound WebSocket connections.

## Need Help?

If you see any errors after creating the gateway, check:
1. Gateway name matches exactly: `ameenuddin-ai-gateway`
2. API token has AI Gateway permissions
3. Token is set in `workers/.dev.vars`

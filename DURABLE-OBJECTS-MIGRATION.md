# Durable Objects Migration for WebSocket Transcription

## Overview

The real-time speech transcription has been migrated from a simple WebSocket Worker to use **Cloudflare Durable Objects** for more stable, persistent WebSocket connections.

## Why Durable Objects?

### Problems with Regular Workers
- ❌ **CPU time limits** - Workers have execution time constraints
- ❌ **Connection instability** - Connections can be terminated during scaling events
- ❌ **No state persistence** - State is lost across requests
- ❌ **Frequent disconnections** - Especially under load or during Worker cold starts

### Benefits of Durable Objects
- ✅ **Persistent connections** - WebSockets stay open indefinitely
- ✅ **State preservation** - State survives across Worker invocations
- ✅ **Better stability** - Dedicated instances per session
- ✅ **Automatic reconnection** - Cloudflare handles connection persistence
- ✅ **Lower latency** - Consistent routing to the same instance

## Architecture Changes

### Before (Regular Worker)
```
Client WebSocket
    ↓
Worker (stateless, can terminate)
    ↓
Deepgram Flux AI Model
```

### After (Durable Objects)
```
Client WebSocket
    ↓
Worker (routing layer)
    ↓
Durable Object Instance (persistent, stateful)
    ↓
Deepgram Flux AI Model
```

## Implementation Details

### 1. Durable Object Class (`TranscriptionDurableObject`)

**Location**: `workers/transcription-ws.ts`

**Key Features**:
- Manages WebSocket pairs (client ↔ server)
- Forwards audio from client to AI model
- Forwards transcription results from AI to client
- Handles connection lifecycle (open, close, error)
- Maintains session state

**Code Structure**:
```typescript
export class TranscriptionDurableObject implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private sessions: Set<WebSocket>;

  async fetch(request: Request): Response {
    // 1. Validate WebSocket upgrade
    // 2. Create WebSocket pair
    // 3. Connect to AI model
    // 4. Set up bidirectional forwarding
    // 5. Return client WebSocket
  }

  private setupMessageForwarding(clientWs, aiWs) {
    // Forward audio: client → AI
    // Forward transcriptions: AI → client
    // Handle disconnections and errors
  }
}
```

### 2. Worker Entry Point

**Purpose**: Routes requests to the appropriate Durable Object instance

**Session Management**:
- Uses `crypto.randomUUID()` to generate unique session IDs
- Can be customized to use query parameters: `?session=your-id`
- Each session gets its own Durable Object instance

**Code**:
```typescript
export default {
  async fetch(request, env, ctx) {
    const doId = url.searchParams.get("session") || crypto.randomUUID();
    const id = env.TRANSCRIPTION_DO.idFromName(doId);
    const stub = env.TRANSCRIPTION_DO.get(id);
    return await stub.fetch(request);
  }
}
```

### 3. Wrangler Configuration

**Location**: `workers/wrangler-transcription.toml`

**New Sections**:
```toml
# Durable Objects binding
[[durable_objects.bindings]]
name = "TRANSCRIPTION_DO"
class_name = "TranscriptionDurableObject"
script_name = "ameenuddin-transcription-ws"

# Migration (required for initial deployment)
[[migrations]]
tag = "v1"
new_classes = ["TranscriptionDurableObject"]
```

## Deployment

### First-Time Deployment

```bash
# Deploy with Durable Objects migration
npm run deploy:transcription
```

The first deployment will:
1. Create the Durable Object class
2. Set up the binding
3. Apply the migration (creates the DO namespace)

### Subsequent Deployments

```bash
# Standard deployment (no migration needed)
npm run deploy:transcription
```

### Verify Deployment

```bash
# Check worker logs
npx wrangler tail --config workers/wrangler-transcription.toml

# Test connection
curl https://ameenuddin.dev/demo/api/ai/transcription
```

## Client-Side Changes

### No Code Changes Required! 🎉

The client-side code in `src/routes/demo/ai-voice.tsx` **does not need any changes**. The WebSocket connection remains the same:

```typescript
const ws = new WebSocket('wss://ameenuddin.dev/demo/api/ai/transcription');
```

### Optional: Session Management

You can optionally pass a session ID to reuse the same Durable Object:

```typescript
const sessionId = 'user-123-session-456';
const ws = new WebSocket(
  `wss://ameenuddin.dev/demo/api/ai/transcription?session=${sessionId}`
);
```

**When to use sessions**:
- ✅ Reconnecting after temporary disconnection (preserves state)
- ✅ Multiple tabs for the same user (share transcription history)
- ✅ Session resumption after network issues

**When to use random IDs** (default):
- ✅ Each new recording session should be independent
- ✅ Privacy - don't share state across sessions
- ✅ Simpler implementation

## Testing

### Local Development

```bash
# Start the worker with Durable Objects
npm run dev:transcription
```

**Test with WebSocket client**:
```javascript
const ws = new WebSocket('ws://localhost:8787');

ws.onopen = () => {
  console.log('Connected to Durable Object');
  // Send audio data...
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log('Transcription:', result);
};

ws.onerror = (error) => {
  console.error('Connection error:', error);
};

ws.onclose = (event) => {
  console.log('Disconnected:', event.code, event.reason);
};
```

### Connection Stability Test

To verify improved stability, test:

1. **Long-running sessions** (5+ minutes)
2. **Rapid reconnections** (disconnect/reconnect quickly)
3. **Concurrent sessions** (multiple browser tabs)
4. **Network interruptions** (simulate poor network)

**Expected Results**:
- ✅ Connections stay open for extended periods
- ✅ Reconnections are fast and reliable
- ✅ No unexpected disconnections
- ✅ Graceful error handling

## Monitoring

### Cloudflare Dashboard

1. Go to **Workers & Pages** → **Durable Objects**
2. Select `TranscriptionDurableObject`
3. View:
   - Active instances
   - Request counts
   - Storage usage
   - Error rates

### Logs

```bash
# Watch real-time logs
npx wrangler tail --config workers/wrangler-transcription.toml

# Look for:
[TranscriptionDO] Client connected
[TranscriptionDO] Client disconnected: 1000 Normal closure
[TranscriptionDO] AI disconnected: 1000 AI connection closed
```

### Metrics to Track

| Metric | Good | Bad |
|--------|------|-----|
| Connection duration | 5+ minutes | <30 seconds |
| Disconnection rate | <5% | >20% |
| Error rate | <1% | >5% |
| Reconnection time | <500ms | >2s |

## Cost Considerations

### Durable Objects Pricing

| Resource | Free Tier | Overage Cost |
|----------|-----------|--------------|
| Requests | 1M requests/month | $0.15 / million |
| Duration | 400,000 GB-s/month | $12.50 / million GB-s |
| Storage | 1 GB | $0.20 / GB-month |

**Estimated Cost for 1,000 sessions/day**:
- Requests: **Free** (under 1M/month)
- Duration: ~30 seconds avg = ~900,000 GB-s = **Free**
- Storage: Minimal (no persistence) = **Free**
- **Total: $0/month** 🎉

### Compared to Regular Workers

Durable Objects are slightly more expensive than regular Workers, but:
- ✅ **Better user experience** (stable connections)
- ✅ **Lower support costs** (fewer connection issues)
- ✅ **Reduced debugging time** (more predictable behavior)
- ✅ **Still within free tier** for typical usage

## Troubleshooting

### "Durable Object not found"

**Cause**: Migration hasn't been applied

**Fix**:
1. Ensure `wrangler-transcription.toml` has the migration section
2. Redeploy: `npm run deploy:transcription`
3. Check dashboard: Workers & Pages → Durable Objects

### Connection still disconnecting

**Possible causes**:
1. **Client-side timeout** - Check browser console for errors
2. **AI model timeout** - Deepgram Flux may have limits
3. **Network issues** - Test with stable connection
4. **Audio processing errors** - Verify audio format (16kHz, Int16 PCM)

**Debug steps**:
```bash
# Check logs
npx wrangler tail --config workers/wrangler-transcription.toml

# Look for error patterns
grep -i "error\|disconnect" logs.txt
```

### "Class not found" error

**Cause**: Durable Object class isn't exported

**Fix**: Ensure `transcription-ws.ts` has:
```typescript
export class TranscriptionDurableObject implements DurableObject {
  // ...
}
```

## Rollback Plan

If issues arise, you can revert to the previous implementation:

```bash
# 1. Restore backup
git checkout HEAD~1 workers/transcription-ws.ts

# 2. Remove Durable Object config
git checkout HEAD~1 workers/wrangler-transcription.toml

# 3. Redeploy
npm run deploy:transcription
```

**Note**: This will lose the benefits of Durable Objects (stable connections).

## Next Steps

### Optional Enhancements

1. **State persistence** - Store transcription history in Durable Object storage
2. **Session resumption** - Allow clients to reconnect to existing sessions
3. **Multi-user rooms** - Share transcriptions across multiple clients
4. **Analytics** - Track connection duration, error rates, usage patterns

### Example: Persist Transcription History

```typescript
export class TranscriptionDurableObject implements DurableObject {
  async fetch(request: Request): Response {
    // Load history from storage
    const history = await this.state.storage.get('transcriptions') || [];

    // On new transcription
    aiWs.addEventListener('message', (event) => {
      const result = JSON.parse(event.data);
      history.push(result);
      await this.state.storage.put('transcriptions', history);
      clientWs.send(event.data);
    });
  }
}
```

## References

- [Cloudflare Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- [WebSocket in Durable Objects](https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation/)
- [Deepgram Flux Model](https://developers.cloudflare.com/workers-ai/models/flux/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

## Summary

✅ **Migration Complete**: WebSocket transcription now uses Durable Objects
✅ **No Client Changes**: Existing code works without modifications
✅ **Better Stability**: Persistent connections reduce disconnections
✅ **Still Free**: Within Cloudflare's free tier for typical usage
✅ **Easy Deployment**: `npm run deploy:transcription`

The WebSocket connection should now be significantly more stable! 🚀

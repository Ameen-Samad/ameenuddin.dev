# Security Audit: API Keys and Environment Variables

## 🚨 CRITICAL ISSUES FOUND

### Issue 1: Wrong API Pattern in `/api/generate-three` and `/api/chat`

**Files:**
- `src/routes/api/generate-three.tsx`
- `src/routes/api/chat.tsx`

**Problem:**
```typescript
// ❌ WRONG: Using REST API with Bearer token
const response = await fetch(
  "https://api.cloudflare.com/client/v4/accounts/REPLACE_WITH_ACCOUNT_ID/ai/run/@cf/qwen/qwen2.5-coder-32b-instruct",
  {
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
    }
  }
);
```

**Why This is Dangerous:**
1. ❌ `process.env` doesn't exist in Cloudflare Workers
2. ❌ Even if it did, API keys could leak to client bundle
3. ❌ Using wrong API (REST instead of Workers AI binding)
4. ❌ Hardcoded account ID placeholder

**Correct Pattern:**
```typescript
// ✅ CORRECT: Use Workers AI binding
export const Route = createFileRoute("/api/generate-three")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const ai = context.cloudflare?.env.AI;

        if (!ai) {
          return json({ error: "AI not available" }, { status: 500 });
        }

        const response = await ai.run(
          "@cf/qwen/qwen2.5-coder-32b-instruct",
          {
            messages: [...],
            stream: true
          }
        );

        return new Response(response);
      }
    }
  }
});
```

### Issue 2: Demo Files Use `process.env.OPENAI_API_KEY`

**Files:**
- `src/routes/demo/api.ai.image.ts`
- `src/routes/demo/api.ai.transcription.ts`
- `src/routes/demo/api.ai.tts.ts`

**Status:** ⚠️ ACCEPTABLE FOR DEMOS

These are demo files showing how to integrate with OpenAI. As long as:
1. They're not actually deployed/used in production
2. They're clearly marked as examples
3. The actual app uses Cloudflare Workers AI

## Security Best Practices

### ✅ DO: Use Cloudflare Bindings

```typescript
export const Route = createFileRoute("/api/example")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Access bindings from context
        const ai = context.cloudflare?.env.AI;
        const db = context.cloudflare?.env.DB;
        const kv = context.cloudflare?.env.PROJECT_CACHE;

        // Use them safely (server-side only)
        const result = await ai.run("@cf/model", {...});
        return json(result);
      }
    }
  }
});
```

### ❌ DON'T: Use process.env in Routes

```typescript
// ❌ NEVER DO THIS
export async function action({ request }: { request: Request }) {
  const apiKey = process.env.API_KEY; // Won't work in Workers
  const response = await fetch("...", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
}
```

### ❌ DON'T: Make REST API Calls to Cloudflare

```typescript
// ❌ WRONG: Using Cloudflare REST API
await fetch("https://api.cloudflare.com/client/v4/accounts/.../ai/run/...", {
  headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}` }
});

// ✅ RIGHT: Use Workers AI binding
await context.cloudflare.env.AI.run("@cf/model", {...});
```

## Environment Variables vs Bindings

| Type | Where | Access | Security |
|------|-------|--------|----------|
| **Bindings** | Cloudflare Dashboard | `context.cloudflare.env.*` | ✅ Server-only, never leaked |
| **process.env** | Local dev only | `process.env.*` | ❌ Doesn't work in Workers |
| **import.meta.env** | Vite config | `import.meta.env.*` | ⚠️ Can leak to client if not prefixed with `VITE_` |

## Correct Architecture

```
┌─────────────────────────────────────────┐
│         CLIENT (Browser)                │
│  - No API keys                          │
│  - Makes requests to /api/* routes     │
│  - Public environment vars only         │
└─────────────────────────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────┐
│    SERVER (Cloudflare Pages Function)  │
│  - Access via context.cloudflare.env   │
│  - AI binding                           │
│  - D1 binding                           │
│  - KV bindings                          │
│  - All secrets server-side only        │
└─────────────────────────────────────────┘
```

## Audit Checklist

- [ ] Replace `/api/generate-three` to use AI binding
- [ ] Replace `/api/chat` to use AI binding
- [ ] Verify no `process.env.*` in production routes
- [ ] Ensure all sensitive operations use `context.cloudflare.env`
- [ ] Check client bundle doesn't include API keys
- [ ] Test that bindings work in production

## Next Steps

1. **Fix generate-three.tsx** - Use `context.cloudflare.env.AI`
2. **Fix chat.tsx** - Use `context.cloudflare.env.AI`
3. **Remove demo files** - Or clearly mark as non-production
4. **Test bindings** - Verify AI, D1, KV work in production
5. **Deploy** - Push to Cloudflare Pages after fixes

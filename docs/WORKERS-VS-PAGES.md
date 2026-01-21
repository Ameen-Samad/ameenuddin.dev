# Cloudflare Workers vs Pages: What's the Difference?

## Current Setup: You're Using **Cloudflare Pages**

Your screenshots show you're in the Cloudflare Pages dashboard, not Workers.

## Key Differences

| Feature | Workers | Pages |
|---------|---------|-------|
| **Purpose** | Pure serverless functions | Static sites + serverless |
| **Entry Point** | `main` in `wrangler.jsonc` | `_worker.js` in output dir |
| **Deploy Command** | `wrangler deploy` | `wrangler pages deploy` |
| **Static Assets** | Manual routing | Automatic serving |
| **Git Integration** | No | Yes (auto-deploy on push) |
| **Best For** | APIs, Workers-only apps | Full-stack apps with SSR |

## Why You Need `_worker.js` (Not `main`)

For **Cloudflare Pages**:
- Static files go in `dist/client/`
- Server logic needs `dist/client/_worker.js`
- Bindings configured in Pages dashboard

For **Cloudflare Workers** (alternative):
- Set `main = "dist/server/server.js"` in `wrangler.jsonc`
- Deploy with `wrangler deploy` (not `wrangler pages deploy`)
- Bindings configured in `wrangler.jsonc`

## Your Current (Correct) Setup

✅ **Cloudflare Pages** (what you're using):
```jsonc
// wrangler.jsonc - Just for local dev and metadata
{
  "name": "ameenuddin",
  "ai": { "binding": "AI" },
  "kv_namespaces": [...],
  "d1_databases": [...]
  // NO "main" field needed
}
```

```bash
# Build creates _worker.js automatically
bun run build

# Deploy to Pages
wrangler pages deploy ./dist/client --project-name=ameenuddin
```

## Alternative: Switch to Workers

If you want to use Workers instead:

```jsonc
// wrangler.jsonc
{
  "name": "ameenuddin",
  "main": "dist/server/server.js",  // Entry point
  "compatibility_date": "2025-09-02",
  "ai": { "binding": "AI" },
  "kv_namespaces": [...],
  "d1_databases": [...],

  // Serve static assets
  "assets": {
    "directory": "./dist/client"
  }
}
```

```bash
# Build (no _worker.js needed)
vite build

# Deploy to Workers (not Pages)
wrangler deploy
```

## Recommendation: Stick with Pages

**Keep using Cloudflare Pages** because:
1. ✅ Better for full-stack apps (static + SSR)
2. ✅ Auto-deploy from Git
3. ✅ Better static asset handling
4. ✅ Preview deployments for PRs
5. ✅ TanStack Start is designed for Pages

## Why Your Current Deploy Fails

From your screenshots, the issues are:

1. ❌ **No bindings configured** in Pages dashboard
   - Need to add AI, KV, D1 bindings in Settings > Functions

2. ❌ **D1 database ID is "local"**
   - Need production database ID from `wrangler d1 create`

3. ✅ **_worker.js is now generated** (after my fix)
   - Your build now creates this automatically

## Next Steps

1. **Create production D1 database**:
   ```bash
   wrangler d1 create ameenuddin-dev-db
   # Copy the database_id from output
   ```

2. **Update wrangler.jsonc** with real database ID

3. **Add bindings in Pages dashboard**:
   - Go to your Pages project > Settings > Functions > Bindings
   - Add: AI, PROJECT_CACHE (KV), RATE_LIMIT (KV), DB (D1)

4. **Deploy**:
   ```bash
   git push origin main  # Auto-deploys via Git
   # OR
   bun run deploy  # Manual CLI deploy
   ```

## Summary

**Don't add `main` to wrangler.jsonc** - you're using Pages, not Workers. The `_worker.js` approach is correct for Pages and is now working after my fix.

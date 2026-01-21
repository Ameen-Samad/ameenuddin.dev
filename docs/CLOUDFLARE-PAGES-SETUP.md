# Cloudflare Pages Deployment Guide

## Issues Found

1. ❌ **Wrong deploy command** in Cloudflare Pages dashboard
2. ❌ **No bindings configured** in Cloudflare Pages
3. ❌ **D1 database ID is "local"** (needs production ID)

## Fix Instructions

### 1. Create Production D1 Database

First, create a production D1 database:

```bash
# Create the database
wrangler d1 create ameenuddin-dev-db

# Output will show:
# [[d1_databases]]
# binding = "DB"
# database_name = "ameenuddin-dev-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** from the output.

### 2. Update wrangler.jsonc

Replace the D1 database ID in `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ameenuddin-dev-db",
      "database_id": "PASTE_YOUR_DATABASE_ID_HERE"  // Replace "local" with actual ID
    }
  ]
}
```

### 3. Fix Cloudflare Pages Build Configuration

In your Cloudflare Pages dashboard (Settings > Builds):

**Current (Wrong):**
- Deploy command: `npx wrangler deploy`

**Correct:**
- Build command: `bun run build` ✅ (already correct)
- Deploy command: **Leave empty** (Cloudflare Pages auto-deploys from `dist/client`)
- Build output directory: `dist/client`
- Root directory: `/`

**Why?**
- `wrangler deploy` is for Workers, not Pages
- Pages automatically deploys the output directory
- TanStack Start outputs to `dist/client` for Pages

### 4. Add Bindings in Cloudflare Pages Dashboard

Go to **Settings > Functions > Bindings** and add:

#### 4.1 Workers AI Binding
- Type: **Workers AI**
- Variable name: `AI`

#### 4.2 KV Namespace (PROJECT_CACHE)
- Type: **KV Namespace**
- Variable name: `PROJECT_CACHE`
- KV namespace: Select existing `3b6fc452a52e4906be204952436b588b` or create new

#### 4.3 KV Namespace (RATE_LIMIT) - Optional
You can reuse the same KV namespace:
- Type: **KV Namespace**
- Variable name: `RATE_LIMIT`
- KV namespace: Same as PROJECT_CACHE `3b6fc452a52e4906be204952436b588b`

#### 4.4 D1 Database
- Type: **D1 Database**
- Variable name: `DB`
- D1 database: Select `ameenuddin-dev-db` (the one you created)

### 5. Deploy Options

#### Option A: Git Push (Recommended)
Just push to GitHub - Cloudflare Pages will auto-deploy:

```bash
git push origin main
```

#### Option B: Manual CLI Deploy
```bash
bun run build
wrangler pages deploy ./dist/client --project-name=ameenuddin
```

**Note:** CLI deploy won't use dashboard bindings. For bindings to work, use Git push or add them via CLI flags.

## Verification

After deployment, check:

1. **Bindings tab**: Should show AI, PROJECT_CACHE, RATE_LIMIT, and DB
2. **Deployments tab**: Should show successful deployment
3. **Visit site**: Test AI features to verify bindings work

## Common Issues

### Issue: "AI is not defined"
**Cause:** Workers AI binding not configured
**Fix:** Add AI binding in Functions > Bindings

### Issue: "KV namespace not found"
**Cause:** KV binding not configured
**Fix:** Add KV bindings in Functions > Bindings

### Issue: "D1 database not found"
**Cause:** D1 binding not configured or wrong database ID
**Fix:**
1. Verify database exists: `wrangler d1 list`
2. Update `wrangler.jsonc` with correct ID
3. Add D1 binding in Functions > Bindings

### Issue: "404 on all routes"
**Cause:** Wrong output directory
**Fix:** Set build output to `dist/client`, not `dist`

## Architecture

TanStack Start on Cloudflare Pages uses:
- **Client assets**: `dist/client/` → Pages static hosting
- **Server functions**: `dist/server/server.js` → Pages Functions (Edge)
- **Bindings**: Accessed via `context.cloudflare.env` in server code

Bindings configured in Pages dashboard are automatically available to Pages Functions without extra configuration.

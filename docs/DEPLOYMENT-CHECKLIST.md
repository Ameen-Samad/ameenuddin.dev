# Cloudflare Pages Deployment Checklist

## ✅ What's Been Fixed

### 1. Build System
- ✅ Fixed Phaser import errors (`import * as Phaser`)
- ✅ Post-build script creates `_worker.js` for Pages
- ✅ Database ID updated to production (`48111cfa-50d2-4899-88d2-55d00c21d36e`)

### 2. Security (CRITICAL)
- ✅ Removed `process.env.CLOUDFLARE_API_KEY` usage
- ✅ Replaced REST API calls with Workers AI bindings
- ✅ All server-side code now uses `context.cloudflare.env.*`
- ✅ No API keys exposed to client bundle

### 3. Documentation
- ✅ `SECURITY-AUDIT.md` - Security patterns and fixes
- ✅ `CLOUDFLARE-BUILD-FIX.md` - Memory limit solution
- ✅ `CLOUDFLARE-PAGES-SETUP.md` - Step-by-step setup
- ✅ `WORKERS-VS-PAGES.md` - Architecture explanation

## 🚀 Deployment Steps

### Step 1: Add Environment Variable (REQUIRED)

**Why:** Your tetris route bundle (5.3MB) causes heap out of memory during build.

**Where:** Cloudflare Pages dashboard > Settings > Environment variables

**Add this:**
- Variable name: `NODE_OPTIONS`
- Value: `--max-old-space-size=4096`
- Scope: **Production** and **Preview**

This gives Node.js 4GB memory instead of default 512MB.

### Step 2: Add Bindings in Pages Dashboard (REQUIRED)

**Where:** Cloudflare Pages dashboard > Settings > Functions > Bindings

**Add these 4 bindings:**

#### 1. Workers AI ⚡
- Type: **Workers AI**
- Variable name: `AI`

#### 2. KV Namespace - PROJECT_CACHE 📦
- Type: **KV Namespace**
- Variable name: `PROJECT_CACHE`
- KV namespace ID: `3b6fc452a52e4906be204952436b588b`

#### 3. KV Namespace - RATE_LIMIT ⏱️
- Type: **KV Namespace**
- Variable name: `RATE_LIMIT`
- KV namespace ID: `3b6fc452a52e4906be204952436b588b` (same as above)

#### 4. D1 Database 🗄️
- Type: **D1 Database**
- Variable name: `DB`
- Database: Select `ameenuddin-dev-db` (ID: `48111cfa-50d2-4899-88d2-55d00c21d36e`)

### Step 3: Deploy

**Option A - Git Push (Recommended):**
```bash
git push origin main
```

Cloudflare Pages will automatically:
1. Build using `bun run build`
2. Deploy `dist/client/` directory
3. Use `dist/client/_worker.js` for server-side rendering
4. Apply all bindings from dashboard

**Option B - Manual CLI:**
```bash
bun run deploy
```

### Step 4: Verify Deployment

1. **Check Bindings:** Pages dashboard > Bindings tab should show 4 bindings
2. **Test AI Features:** Try the Three.js generator, chat, or recommendations
3. **Check Browser Console:** Verify no "AI not available" errors
4. **Test Tetris:** Verify D1 leaderboard works

## 🔍 Verification Commands

### Local Testing (Before Deploy)
```bash
# Test build works
bun run build

# Check _worker.js was created
ls -lh dist/client/_worker.js

# Should show: ~40KB file
```

### After Deployment
```bash
# Check deployment status
wrangler pages deployment list --project-name=ameenuddin | head -10

# Test API endpoint
curl https://your-site.pages.dev/api/leaderboard
```

## 🛠️ Troubleshooting

### Issue: "AI not available" error
**Cause:** AI binding not configured
**Fix:** Add Workers AI binding in Functions > Bindings

### Issue: Build fails with heap out of memory
**Cause:** Tetris bundle (5.3MB) exhausts Node memory
**Fix:** Add `NODE_OPTIONS=--max-old-space-size=4096` environment variable

### Issue: "DB not available" error
**Cause:** D1 binding not configured or wrong database ID
**Fix:**
1. Verify database exists: `wrangler d1 list`
2. Add D1 binding in dashboard with correct database

### Issue: Routes return 404
**Cause:** Wrong build output directory
**Fix:** Build output should be `dist/client` (already configured ✅)

## 📊 Current Architecture

```
┌─────────────────────────────────┐
│    Browser (Client)             │
│  - Static assets from dist/client
│  - No API keys                  │
└─────────────────────────────────┘
          │ HTTPS
          ▼
┌─────────────────────────────────┐
│ Cloudflare Pages Function       │
│ (_worker.js)                    │
│  - Server-side rendering        │
│  - API routes (/api/*)          │
│  - Access to bindings:          │
│    • AI (Workers AI)            │
│    • DB (D1 Database)           │
│    • KV (Key-Value)             │
└─────────────────────────────────┘
```

## 🎯 What Happens When You Deploy

1. **Git push triggers build:**
   - Cloudflare clones your repo
   - Runs `bun run build`
   - Creates `dist/client/` with assets + `_worker.js`

2. **Deployment:**
   - Static files served from edge
   - API routes handled by `_worker.js`
   - Bindings injected into `context.cloudflare.env`

3. **Runtime:**
   - User requests → Cloudflare edge
   - Static pages served instantly
   - API calls → `_worker.js` with full binding access
   - AI, D1, KV available server-side only

## ✅ Final Checklist

Before deploying, verify:

- [ ] `NODE_OPTIONS` environment variable added
- [ ] AI binding configured
- [ ] PROJECT_CACHE KV binding configured
- [ ] RATE_LIMIT KV binding configured
- [ ] D1 database binding configured
- [ ] `wrangler.jsonc` has correct database ID
- [ ] Local build succeeds (`bun run build`)
- [ ] `dist/client/_worker.js` exists after build

After deploying, verify:

- [ ] Deployment succeeded (check dashboard)
- [ ] Site loads without errors
- [ ] AI features work (Three.js, chat)
- [ ] Database features work (Tetris leaderboard)
- [ ] No console errors about missing bindings

## 📚 Further Reading

- `docs/SECURITY-AUDIT.md` - Security best practices
- `docs/CLOUDFLARE-PAGES-SETUP.md` - Detailed setup guide
- `docs/WORKERS-VS-PAGES.md` - Architecture deep dive
- `docs/CLOUDFLARE-BUILD-FIX.md` - Memory issues and solutions

## 🚨 Important Security Notes

1. **NEVER commit API keys to git**
2. **NEVER use `process.env` for secrets in Workers**
3. **ALWAYS use `context.cloudflare.env` for bindings**
4. **ALWAYS verify code is server-side only** (check `server: { handlers: {...} }`)

Your deployment is now secure and properly configured! 🎉

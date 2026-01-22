# TanStack Start + Wrangler Dev Workflow Explained

## ❓ Why Do We Need `bun build` First?

You're right to question this! Here's why the build step is necessary with TanStack Start:

### The Problem
TanStack Start is a **full-stack React framework** that generates:
1. **Client bundle** → `dist/client/` (static assets)
2. **Server bundle** → `dist/server/` (Cloudflare Worker code)
3. **Wrangler config** → `dist/server/wrangler.json` (auto-generated from `wrangler.jsonc`)

**Wrangler needs the generated `dist/server/wrangler.json` to run your worker.**

### The Build Process

```bash
bun build
```

**What happens:**
1. `prebuild` → `bun install --frozen-lockfile`
2. `build` → `vite build` (TanStack Start's build)
   - Generates `dist/client/` (static assets)
   - Generates `dist/server/` (worker code)
   - Creates `dist/server/wrangler.json` from `wrangler.jsonc`
3. `postbuild` → Runs your custom scripts:
   - `merge-wrangler-routes.js` - Merges route configs
   - `clean-wrangler-config.js` - Cleans up config

**Without this build, `dist/server/wrangler.json` doesn't exist!**

---

## ✅ Correct Workflow (Updated for Bun)

### Development Commands

```bash
# Standard dev (build once, then run)
bun dev

# Watch mode (auto-rebuild on changes)  
bun dev:watch
```

### What They Do

#### `bun dev` (Recommended)
```bash
bun build && bun --concurrent dev:main dev:transcription dev:tts
```

1. **Build** - Generates `dist/server/wrangler.json`
2. **Run 3 workers concurrently** using bun's native `--concurrent`:
   - `wrangler dev --config dist/server/wrangler.json --port 3000`
   - `wrangler dev --config workers/wrangler-transcription.toml --port 8787`
   - `wrangler dev --config workers/wrangler-tts.toml --port 8788`

**Use when:** Starting fresh or after pulling changes

---

#### `bun dev:watch` (For Active Development)
```bash
bun --concurrent build:watch dev:main dev:transcription dev:tts
```

1. **Watch build** - Rebuilds on code changes
2. **Run 3 workers concurrently**
3. **Auto-reload** when build completes

**Use when:** Actively writing code and want hot reload

---

## 🔄 Why Not Just `wrangler dev`?

You might think: "Can't wrangler dev handle the build?"

**No, because:**
1. TanStack Start uses **Vite** for building (not Wrangler's build)
2. Your `wrangler.jsonc` is a **template** - the real config is generated during build
3. The `postbuild` scripts modify the config (routes, etc.)

**This is specific to TanStack Start**, not a limitation of Wrangler.

---

## 🆚 Comparison with Pure Wrangler

### Pure Wrangler Project (simpler)
```bash
wrangler dev  # Just works! Wrangler handles everything
```

### TanStack Start + Wrangler (our setup)
```bash
bun build     # Generate dist/ and wrangler.json
wrangler dev  # Now wrangler can run
```

**Why?** TanStack Start is a meta-framework on top of Wrangler.

---

## 🎯 Key Improvements Made

### Old (Using npm + bunx)
```json
"dev": "npm run build && bunx wrangler dev ..."
```
- ❌ Mixed package managers
- ❌ Verbose `npm run`
- ❌ `bunx` downloads wrangler each time

### New (Pure Bun)
```json
"dev": "bun build && bun --concurrent dev:main dev:transcription dev:tts"
```
- ✅ Pure bun (faster)
- ✅ Native concurrency (no need for `concurrently` package)
- ✅ Direct `wrangler` command (already installed)
- ✅ Simpler and cleaner

---

## 📊 The Three Workers

| Worker | Port | Config | Purpose |
|--------|------|--------|---------|
| **Main** | 3000 | `dist/server/wrangler.json` | TanStack Start app (generated) |
| **Transcription** | 8787 | `workers/wrangler-transcription.toml` | WebSocket voice-to-text |
| **TTS** | 8788 | `workers/wrangler-tts.toml` | WebSocket text-to-speech |

**Only the main worker needs the build step** (TanStack Start).
The WebSocket workers are standalone and don't need building.

---

## 🧪 Testing the Setup

```bash
# Start development
bun dev

# You should see:
# [1] ⎔ Starting local server...  (Main - port 3000)
# [2] ⎔ Starting local server...  (Transcription - port 8787)
# [3] ⎔ Starting local server...  (TTS - port 8788)

# Open browser
open http://localhost:3000
```

---

## 💡 Alternative: Skip Build for WebSocket Workers Only

If you're ONLY working on the WebSocket workers (not the main app):

```bash
# Run just transcription worker
bun dev:transcription

# Run just TTS worker  
bun dev:tts

# No build needed!
```

But for the main app (TanStack Start), the build is always required.

---

## ✅ Summary

**Q: Do we need `bun build` first?**
**A: Yes**, because TanStack Start generates the wrangler config during build.

**Q: Can we use pure wrangler commands?**  
**A: Almost!** We use `wrangler dev` directly, but need to build first to generate the config.

**Q: Why not use npm?**
**A: We shouldn't!** You're right - we should use `bun` for everything (now fixed).

**The workflow is correct** - build first, then wrangler dev. That's how TanStack Start + Cloudflare Workers works! 🚀

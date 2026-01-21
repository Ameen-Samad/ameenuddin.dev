# Cloudflare Build: Heap Out of Memory Fix

## The Problem

You're seeing this error during Cloudflare Pages build:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Root Cause:** The Tetris game bundle is **5.3 MB** (includes Phaser.js game engine + WASM), which exhausts Node.js memory during build.

## Solution: Increase Node Memory Limit

### Option A: Environment Variable in Cloudflare Dashboard (Recommended)

1. Go to your Cloudflare Pages project
2. Navigate to **Settings > Environment variables**
3. Add for **Production** and **Preview**:
   - **Variable name:** `NODE_OPTIONS`
   - **Value:** `--max-old-space-size=4096`

This gives Node.js 4GB of memory instead of the default ~512MB.

### Option B: Update Build Command

In Cloudflare Pages **Settings > Builds and deployments**:

Change build command from:
```bash
bun run build
```

To:
```bash
NODE_OPTIONS="--max-old-space-size=4096" bun run build
```

## Why This Happens

The tetris route (`src/routes/tetris.tsx`) imports:
- **Phaser.js** - 2.8MB game engine
- **WASM module** - 1.5MB compiled Rust code
- **All code generation syntax highlighters** - 1MB

Total: **5.3MB** in a single route!

## Alternative Solution: Lazy Load Tetris

If you want to optimize further, make tetris load on-demand:

### 1. Update `src/routes/tetris.tsx`

```tsx
// Before (eager loading)
import * as Phaser from "phaser";
import { TetrisGame as TetrisGameService } from "@/services/tetris-game";

// After (lazy loading)
const loadTetris = async () => {
  const [Phaser, { TetrisGame }] = await Promise.all([
    import("phaser"),
    import("@/services/tetris-game")
  ]);
  return { Phaser, TetrisGame };
};

// In component
useEffect(() => {
  loadTetris().then(({ Phaser, TetrisGame }) => {
    // Initialize game
  });
}, []);
```

This makes the initial bundle smaller and loads Phaser only when needed.

## Verification

After applying the fix:

1. **Trigger new deployment** (push to Git or manual deploy)
2. **Check build logs** - Should complete without memory errors
3. **Build time** - Should take ~40-60 seconds (normal for large bundle)

## Current Build Stats

```
✓ Client build: 24.2s
✓ Server build: 43.5s
✓ Total: ~68s

Largest chunks:
- tetris-DdrDmfsV.js: 5.3 MB (Phaser + WASM)
- router-BQ5nGxvE.js: 2.0 MB (TanStack Router)
- mermaid-VLURNSYL.js: 1.1 MB (Diagram rendering)
```

## Recommendation

**Use Option A** (NODE_OPTIONS environment variable) - It's the simplest fix and doesn't require code changes.

After deployment works, consider lazy-loading tetris to improve initial page load speed for users.

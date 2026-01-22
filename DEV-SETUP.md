# Development Setup - Fixed ✅

## 🎯 Problem Solved

Your package.json has been updated to properly run all Cloudflare Workers that your frontend needs to connect to.

---

## 🚀 How to Run Development

### Option 1: Standard Development (Recommended)

```bash
npm run dev
```

**What this does:**
1. Builds your app once
2. Starts 3 Wrangler dev servers in parallel:
   - **MAIN** (port 3000) - Your TanStack Start app with all routes and APIs
   - **WS-TRANS** (port 8787) - WebSocket transcription worker
   - **WS-TTS** (port 8788) - WebSocket text-to-speech worker

**Use this when:**
- Starting fresh development
- You want a stable, reliable dev environment
- You're not actively changing code

---

### Option 2: Watch Mode (For Active Development)

```bash
npm run dev:watch
```

**What this does:**
1. Watches for code changes and rebuilds automatically
2. Runs all 3 workers with live reload
3. Updates in real-time as you code

**Use this when:**
- Actively writing code
- You want hot reloading
- You're making frequent changes

---

## 📡 Worker Ports & Connections

### Main App (TanStack Start)
- **Port:** 3000
- **URL:** http://localhost:3000
- **Purpose:** Main frontend + API routes
- **Bindings:** AI, D1 (DB), KV (PROJECT_CACHE, RATE_LIMIT)

### Transcription WebSocket Worker
- **Port:** 8787
- **URL:** ws://localhost:8787
- **Purpose:** Voice transcription via WebSocket
- **Route:** `/demo/api/ai/transcription`

### TTS WebSocket Worker
- **Port:** 8788  
- **URL:** ws://localhost:8788
- **Purpose:** Text-to-speech via WebSocket
- **Route:** `/demo/api/ai/tts`

---

## 🔧 Key Improvements Made

### Before (❌ Problematic)
```json
"dev": "concurrently -n \"BUILD,MAIN,WS-TRANS,WS-TTS\" ..."
```
- Ran continuous build process
- Restarted workers on every rebuild
- Unstable development experience
- Hard to debug

### After (✅ Fixed)
```json
"dev": "bun run build && concurrently -n \"MAIN,WS-TRANS,WS-TTS\" ..."
```
- Builds once at startup
- Runs all workers in parallel
- Stable and predictable
- Added `--persist` flag for local state

---

## 🎨 Visual Terminal Output

When you run `npm run dev`, you'll see:

```
[MAIN]     ⎔ Starting local server...
[WS-TRANS] ⎔ Starting local server...  
[WS-TTS]   ⎔ Starting local server...

[MAIN]     Ready on http://localhost:3000
[WS-TRANS] Ready on http://localhost:8787
[WS-TTS]   Ready on http://localhost:8788
```

Each worker has a colored label for easy identification:
- **MAIN** - Cyan
- **WS-TRANS** - Green  
- **WS-TTS** - Magenta

---

## 🧪 Testing the Setup

### 1. Start Development
```bash
npm run dev
```

### 2. Check Main App
Open: http://localhost:3000

### 3. Test Voice Transcription
Navigate to: http://localhost:3000/demo/ai-voice
- Should connect to ws://localhost:8787

### 4. Test Text-to-Speech  
Navigate to: http://localhost:3000/demo/ai-tts
- Should connect to ws://localhost:8788

### 5. Test Portfolio Chat (New!)
Navigate to: http://localhost:3000/demo/ai-portfolio
- Should show RAG-powered chat with project cards

---

## 🐛 Troubleshooting

### Workers won't start
```bash
# Kill any existing wrangler processes
pkill -f wrangler

# Clear Wrangler cache
rm -rf ~/.wrangler

# Try again
npm run dev
```

### Port already in use
```bash
# Find what's using the port
lsof -i :3000
lsof -i :8787
lsof -i :8788

# Kill the process
kill -9 <PID>
```

### Build errors
```bash
# Clear build cache
rm -rf dist/
rm -rf .wrangler/

# Rebuild
npm run build
npm run dev
```

### WebSocket connection fails
1. Make sure all 3 workers are running (check terminal output)
2. Check browser console for connection errors
3. Verify ports 8787 and 8788 are accessible
4. Try refreshing the page

---

## 📚 Additional Commands

### Individual Worker Development

```bash
# Run only the main app
npm run dev:main

# Run only transcription worker
npm run dev:transcription

# Run only TTS worker  
npm run dev:tts
```

### Deployment

```bash
# Deploy main app
npm run deploy

# Deploy WebSocket workers
npm run deploy:websockets

# Deploy everything
npm run deploy:all
```

---

## ✅ What's Now Working

1. ✅ All workers start in parallel
2. ✅ Each worker has its own port
3. ✅ Persistent local state (`--persist` flag)
4. ✅ Remote AI/D1/KV bindings (`--remote` flag)
5. ✅ Colored terminal output for easy debugging
6. ✅ Stable development environment
7. ✅ Frontend can connect to all workers

---

## 🎯 Next Steps

1. Run `npm run dev`
2. Open http://localhost:3000
3. Test the new Portfolio Chat at `/demo/ai-portfolio`
4. Test voice features at `/demo/ai-voice`
5. Start building!

Everything is now properly wired up and ready to use! 🚀

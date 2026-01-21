# 3D Builder Implementation Analysis
Generated: 2026-01-21

## Summary
The 3D builder is implemented but has a critical execution flow issue. Generated Three.js code is **displayed as text** but **not executed/rendered** as functional 3D scenes. The code attempts dynamic module import but fails silently.

---

## Architecture Overview

```
User Input (prompt)
      ↓
[Builder Component] (/builder)
      ↓
POST /api/generate-three
      ↓
[Cloudflare Workers AI]
  @cf/qwen/qwen2.5-coder-32b-instruct
      ↓
[Generated Three.js Code]
      ↓
[ViewerPanel Component]
      ↓
❌ PROBLEM: Blob import fails
      ↓
Code shown as text, not rendered
```

---

## File Structure

| File | Purpose | Lines |
|------|---------|-------|
| `src/routes/builder.tsx` | Main builder UI component | 492 |
| `src/routes/api/generate-three.tsx` | AI code generation endpoint | 174 |

### Dependencies Installed
```json
"@react-three/drei": "^10.7.7",
"@react-three/fiber": "^9.5.0", 
"three": "^0.182.0"
```

---

## Component Breakdown

### 1. Builder Component (Main Container)

**Location:** `src/routes/builder.tsx:39-174`

**State Management:**
```typescript
const [prompt, setPrompt] = useState("");           // User input
const [isGenerating, setIsGenerating] = useState(false);
const [currentCode, setCurrentCode] = useState<string | null>(null);
const [history, setHistory] = useState<Generation[]>([]);
const canvasRef = useRef<HTMLCanvasElement>(null);
```

**Flow:**
1. User enters prompt in `BuilderPanel`
2. `handleGenerate()` (line 53) calls `/api/generate-three`
3. Receives code string, stores in `currentCode` and `history`
4. Passes code to `ViewerPanel` for rendering

**Storage:**
- Uses localStorage with key `"builder-history"`
- Stores: `{ id, prompt, code, timestamp }`

---

### 2. ViewerPanel Component (3D Renderer)

**Location:** `src/routes/builder.tsx:343-492`

**Critical Code (Lines 352-378):**
```typescript
useEffect(() => {
  if (!currentCode || !canvasRef.current) return;
  
  const canvas = canvasRef.current;
  
  try {
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    
    // ❌ PROBLEM AREA: Dynamic import from Blob
    const blob = new Blob([currentCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    
    import(url)
      .then((module: any) => {
        if (module.createScene) {
          module.createScene(canvas);
          URL.revokeObjectURL(url);
        }
      })
      .catch((err) => {
        console.error("Failed to load generated scene:", err);
      });
  } catch (err) {
    console.error("Scene rendering error:", err);
  }
}, [currentCode]);
```

**Why This Fails:**
1. **Browser Security:** Browsers block `import()` from blob URLs for security
2. **ES Modules:** The generated code uses ES6 imports (`import * as THREE from ...`)
3. **CORS:** Skypack CDN imports may have CORS restrictions in blob context
4. **Silent Failure:** Errors caught but not shown to user

**Current Behavior:**
- Code is generated successfully ✓
- Code is stored in state ✓
- Code is displayed in ScrollArea (lines 482-486) ✓
- Code execution fails silently ❌
- Canvas remains blank ❌

---

## API Route Analysis

### /api/generate-three

**Location:** `src/routes/api/generate-three.tsx`

**Features:**
- ✓ Rate limiting (3 requests/minute)
- ✓ KV caching (7-day TTL)
- ✓ Hash-based cache keys
- ✓ Cloudflare Workers AI binding

**AI Model:** `@cf/qwen/qwen2.5-coder-32b-instruct`

**System Prompt (Lines 57-116):**
```
You are a Three.js expert code generator...

REQUIRED CODE STRUCTURE:
```javascript
import * as THREE from 'https://cdn.skypack.dev/three@0.182.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.182.0/examples/jsm/controls/OrbitControls.js';

export async function createScene(canvas) {
  // ... scene setup
  // ... animation loop
}
```
```

**Code Generation Flow:**
1. Check cache (line 48-55)
2. Call Workers AI (line 119-129)
3. Extract response (line 132-139)
4. Clean markdown formatting (line 142-146)
5. Ensure imports present (line 149-151)
6. Cache result (line 154-163)
7. Return JSON: `{ code: string, cached: boolean }`

**Generated Code Format:**
```javascript
import * as THREE from 'https://cdn.skypack.dev/three@0.182.0';
import { OrbitControls } from '...';

export async function createScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(...);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  
  // User-requested geometry
  // Lighting
  // Animation loop
  
  return { scene, camera, renderer };
}
```

---

## Root Cause Analysis

### Why Generated Code Isn't Rendering

| Issue | Impact | Evidence |
|-------|--------|----------|
| **Blob Import Restrictions** | Critical | Browser blocks `import()` from blob:// URLs |
| **ES Module Context** | Critical | Dynamic imports require proper module context |
| **CDN Import Chain** | High | Skypack imports may fail in blob scope |
| **Silent Error Handling** | Medium | Errors caught but not surfaced to UI |
| **No Fallback** | Medium | No alternative execution strategy |

### Current Execution Attempt (Doesn't Work)

```typescript
// ❌ This pattern fails in browsers
const blob = new Blob([code], { type: "application/javascript" });
const url = URL.createObjectURL(blob);
import(url)  // BLOCKED by browser security
```

### What Happens Instead

1. User clicks "Generate"
2. API returns working Three.js code ✓
3. Code stored in `currentCode` state ✓
4. `useEffect` triggers in ViewerPanel
5. Blob created from code string
6. `import(url)` called
7. **Browser blocks import** ❌
8. Error caught and logged (console only)
9. Canvas stays blank
10. Code shown in ScrollArea overlay (lines 482-486)

---

## Installed but Unused

The project has these packages installed but **NOT used** by the builder:

```json
"@react-three/fiber": "^9.5.0"   // React wrapper for Three.js
"@react-three/drei": "^10.7.7"   // Helper components for R3F
"three": "^0.182.0"              // Three.js library
```

**Why They're Not Used:**
- Builder uses AI to generate vanilla Three.js code
- Generated code imports from Skypack CDN, not npm packages
- No React Three Fiber components in builder.tsx

---

## Example Generated Code (Expected Format)

```javascript
import * as THREE from 'https://cdn.skypack.dev/three@0.182.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.182.0/examples/jsm/controls/OrbitControls.js';

export async function createScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height);

  // Create red sphere with metallic finish
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.8,
    roughness: 0.2
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  camera.position.z = 5;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.01;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer };
}
```

---

## UI Components

### BuilderPanel (Lines 176-340)
- Textarea for prompt input
- Example prompts (5 hardcoded)
- History list with replay/delete
- Clear history button

### ViewerPanel (Lines 343-492)
- Canvas element (600px height)
- Empty state overlay
- Loading state overlay
- Code display overlay (ScrollArea with syntax highlighting)

---

## Conventions Discovered

### Naming
- Files: kebab-case (`builder.tsx`)
- Components: PascalCase (`BuilderPanel`, `ViewerPanel`)
- Functions: camelCase (`handleGenerate`, `handleReplay`)

### State Management
- React hooks (useState, useEffect, useRef)
- LocalStorage for persistence
- No global state (Zustand/Context)

### Styling
- Mantine UI components
- Inline styles with rgba colors
- Framer Motion for animations
- Dark theme (#0a0a0a background)

### API Patterns
- TanStack Router file routes
- Server handlers in route config
- Cloudflare Workers AI binding via `env.AI`
- Rate limiting + KV caching

---

## Key Issues Summary

### 1. Execution Failure (Critical)
**Problem:** Generated code not executed, canvas stays blank

**Why:**
```typescript
// Browser blocks this
import(blobUrl)  
```

**Evidence:**
- Console errors (caught silently)
- Canvas element exists but empty
- Code displayed as text instead

### 2. No Error Visibility (High)
**Problem:** Users don't see why rendering failed

**Current:**
```typescript
.catch((err) => {
  console.error("Failed to load generated scene:", err);  // Only in console
});
```

**Impact:** User sees blank canvas with no explanation

### 3. Unused Dependencies (Low)
**Problem:** React Three Fiber installed but not used

**Opportunity:** Could use R3F instead of vanilla Three.js

---

## Alternative Approaches Not Used

### Option 1: React Three Fiber
```typescript
// Could use this instead of generated vanilla Three.js
import { Canvas } from '@react-three/fiber';

<Canvas>
  <mesh>
    <sphereGeometry />
    <meshStandardMaterial color="red" />
  </mesh>
</Canvas>
```

### Option 2: Function Constructor
```typescript
// Eval alternative (still risky)
const fn = new Function('canvas', generatedCode);
fn(canvas);
```

### Option 3: iframe Sandbox
```typescript
// Isolate execution context
const iframe = document.createElement('iframe');
iframe.srcdoc = `<script type="module">${code}</script>`;
```

---

## Open Questions

1. Why choose AI-generated vanilla Three.js over React Three Fiber?
   - More flexible for AI? 
   - Learning exercise?
   - CDN imports preferred?

2. Was blob import ever tested in production?
   - Works in Node but not browsers
   - Security restrictions known?

3. Should generated code be executed server-side?
   - Pre-render static scenes?
   - Return canvas data URL?

---

## Related Files

### Navigation/Config
- `src/lib/navigation-data.tsx` - Demo link to /builder
- `src/components/DemosSection.tsx` - Builder card display
- `src/lib/projects-data.tsx` - Project metadata

### Generated
- `src/routeTree.gen.ts` - Auto-generated route tree

---

## Next Steps (Recommendations)

### Short-term Fix
1. Replace blob import with Function constructor or iframe
2. Add error UI when rendering fails
3. Show loading indicators during execution

### Long-term Refactor
1. Switch to React Three Fiber for better React integration
2. Use installed `three` package instead of Skypack CDN
3. Pre-validate generated code before execution
4. Add TypeScript checking for generated code

### Enhancement Ideas
1. Real-time preview while typing
2. Edit generated code in UI
3. Export as standalone HTML file
4. Share generated scenes via URL

---

## Performance Notes

### Rate Limiting
- 3 requests per minute (expensive AI operation)
- Protected by `RATE_LIMITS.THREE_JS`

### Caching
- 7-day TTL in Cloudflare KV
- Cache key: `three:${sha256(prompt)}`
- Reduces redundant AI calls

### Code Generation Time
- Depends on Workers AI latency
- Max 3000 tokens
- Temperature 0.7 (balanced creativity)

---

## Security Considerations

### Current Issues
1. **Code Execution:** Attempts to execute untrusted AI-generated code
2. **No Validation:** Code not checked before execution attempt
3. **CDN Imports:** Relies on external Skypack CDN

### Mitigations Present
- Rate limiting prevents abuse
- Server-side AI (not exposed to client)
- Cache reduces AI calls

### Mitigations Missing
- No code sandboxing
- No output validation
- No size limits on generated code

---

## Conclusion

The 3D builder is **architecturally sound** but has a **critical execution bug**. The AI successfully generates valid Three.js code, but the browser's security model prevents dynamic blob imports. The code is displayed as text but never runs, leaving the canvas blank.

**Root Cause:** Browser security blocking `import()` from blob URLs

**User Experience:** User sees their prompt, generated code, but no 3D scene

**Fix Required:** Replace blob import strategy with a browser-compatible execution method (iframe sandbox, Function constructor, or switch to React Three Fiber)

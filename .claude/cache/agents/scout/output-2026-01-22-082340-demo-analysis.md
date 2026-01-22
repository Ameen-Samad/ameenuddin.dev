# Codebase Report: Demo Files Analysis
Generated: $(date +"%Y-%m-%d %H:%M:%S")

## Summary
Found 18 demo route files in `src/routes/demo/`, plus a guitar demo in `src/routes/demo/guitars/`. The guitar demo exists but has broken routing (references `/example/guitars/` instead of `/demo/guitars/`). Most demos are registered in DemosSection.tsx but sidebar navigation has mismatched paths for some demos.

---

## Demo Files Inventory

### Main Demo Routes (src/routes/demo/)
All `.tsx` files (excluding backups):

1. ✅ `ai-chat.tsx` - AI chat with streaming
2. ✅ `ai-image.tsx` - Image generation (Stable Diffusion)
3. ✅ `ai-structured.tsx` - Structured output with Zod
4. ✅ `ai-tts.tsx` - Text-to-speech (Deepgram)
5. ✅ `ai-voice.tsx` - Real-time voice transcription (WebSocket)
6. ✅ `form.address.tsx` - Complex address form
7. ✅ `form.simple.tsx` - Simple form validation
8. ✅ `pacer.tsx` - TanStack Pacer (debounce, throttle, rate limit)
9. ✅ `start.api-request.tsx` - API request handling
10. ✅ `start.server-funcs.tsx` - Server functions
11. ✅ `start.ssr.data-only.tsx` - Data-only SSR mode
12. ✅ `start.ssr.full-ssr.tsx` - Full SSR mode
13. ✅ `start.ssr.index.tsx` - SSR overview
14. ✅ `start.ssr.spa-mode.tsx` - SPA mode
15. ✅ `store.tsx` - TanStack Store (reactive state)
16. ✅ `table.tsx` - TanStack Table (sorting, filtering)
17. ✅ `tanstack-query.tsx` - TanStack Query (CRUD with caching)
18. ✅ `trpc-todo.tsx` - tRPC with type-safe API

### Guitar Demo (src/routes/demo/guitars/)
- ❌ `index.tsx` - Guitar listing (BROKEN ROUTING)
- ❌ `$guitarId.tsx` - Guitar detail page (BROKEN ROUTING)

**Issue**: Routes defined as `/demo/guitars/` but Links use `/example/guitars/` (line 20 in index.tsx, line 23 in $guitarId.tsx)

---

## DemosSection.tsx Registration

**Location**: `src/components/DemosSection.tsx`

**Purpose**: Homepage demo cards with "What I Learned" sections

**Registered Demos** (22 total):
1. ✅ `ai-voice` → `/demo/ai-voice`
2. ✅ `chatbot` → `/chatbot` (separate route)
3. ✅ `tetris` → `/tetris` (separate route)
4. ✅ `builder` → `/builder` (separate route)
5. ✅ `ai-image` → `/demo/ai-image`
6. ✅ `ai-tts` → `/demo/ai-tts`
7. ✅ `ai-chat` → `/demo/ai-chat`
8. ✅ `ai-structured` → `/demo/ai-structured`
9. ✅ `tanstack-query` → `/demo/tanstack-query`
10. ✅ `store` → `/demo/store`
11. ✅ `pacer` → `/demo/pacer`
12. ✅ `table` → `/demo/table`
13. ✅ `trpc-todo` → `/demo/trpc-todo`
14. ✅ `form-simple` → `/demo/form.simple`
15. ✅ `form-address` → `/demo/form/address`
16. ✅ `start-ssr-index` → `/demo/start.ssr.index`
17. ✅ `start-ssr-full` → `/demo/start.ssr.full-ssr`
18. ✅ `start-ssr-data` → `/demo/start.ssr.data-only`
19. ✅ `start-ssr-spa` → `/demo/start.ssr.spa-mode`
20. ✅ `start-server-funcs` → `/demo/start.server-funcs`
21. ✅ `start-api-request` → `/demo/start.api-request`
22. ❌ **Guitar demo NOT listed**

---

## Sidebar Navigation Configuration

**Location**: `src/lib/navigation-data.tsx`

**Structure**: Hierarchical menu in Sidebar/MobileNav components

### AI Demos Section
- ✅ Voice Agent → `/demo/ai-voice`
- ✅ Chatbot with RAG → `/chatbot`
- ✅ Tetris AI Agent → `/tetris`
- ✅ 3D Builder → `/builder`
- ✅ Image Generation → `/demo/ai-image`
- ✅ Text-to-Speech → `/demo/ai-tts`
- ✅ AI Chat → `/demo/ai-chat`
- ✅ Structured Output → `/demo/ai-structured`

### TanStack Demos Section
- ✅ Query → `/demo/tanstack-query`
- ✅ Store → `/demo/store`
- ✅ Table → `/demo/table`
- ✅ tRPC Todo → `/demo/trpc-todo`
- ⚠️ Form (Simple) → `/demo/form/simple` (MISMATCH: file is `form.simple.tsx`)
- ⚠️ Form (Address) → `/demo/form/address` (MATCHES: route)

### Start SSR Demos Section
- ⚠️ SSR Overview → `/demo/start/ssr` (MISMATCH: file is `start.ssr.index.tsx`)
- ⚠️ Full SSR → `/demo/start/ssr/full-ssr` (MISMATCH: file is `start.ssr.full-ssr.tsx`)
- ⚠️ Data-Only SSR → `/demo/start/ssr/data-only` (MISMATCH: file is `start.ssr.data-only.tsx`)
- ⚠️ SPA Mode → `/demo/start/ssr/spa-mode` (MISMATCH: file is `start.ssr.spa-mode.tsx`)
- ⚠️ Server Functions → `/demo/start/server-funcs` (MISMATCH: file is `start.server-funcs.tsx`)
- ⚠️ API Routes → `/demo/start/api-request` (MISMATCH: file is `start.api-request.tsx`)

### Missing from Sidebar
- ❌ Pacer demo (`/demo/pacer`)
- ❌ Guitar demo (`/demo/guitars/`)

---

## Routing Conventions

**TanStack Router file-based routing**:

| File Pattern | Generated Route |
|--------------|-----------------|
| `demo/ai-voice.tsx` | `/demo/ai-voice` |
| `demo/form.simple.tsx` | `/demo/form.simple` (NOT `/demo/form/simple`) |
| `demo/start.ssr.index.tsx` | `/demo/start.ssr.index` (NOT `/demo/start/ssr`) |
| `demo/form.address.tsx` | `/demo/form.address` (NOT `/demo/form/address`) |
| `demo/guitars/index.tsx` | `/demo/guitars` |
| `demo/guitars/$guitarId.tsx` | `/demo/guitars/:guitarId` |

**Critical**: TanStack Router uses `.` for file naming, creates nested routes only with directories.

---

## Issues Found

### 1. Guitar Demo - Broken Internal Links
**Status**: ❌ NOT WORKING

**Location**: 
- `src/routes/demo/guitars/index.tsx:20`
- `src/routes/demo/guitars/$guitarId.tsx:23`

**Problem**:
```tsx
// Current (WRONG)
<Link to="/example/guitars/$guitarId" params={{ guitarId: guitar.id.toString() }}>

// Should be
<Link to="/demo/guitars/$guitarId" params={{ guitarId: guitar.id.toString() }}>
```

**Files to fix**:
- Line 20 in `src/routes/demo/guitars/index.tsx`
- Line 23 in `src/routes/demo/guitars/$guitarId.tsx`

### 2. Sidebar Navigation Path Mismatches
**Status**: ⚠️ NEEDS VERIFICATION

**Affected Routes** (sidebar uses `/` but files use `.`):

| Sidebar Path | File | Actual Route |
|--------------|------|--------------|
| `/demo/form/simple` | `form.simple.tsx` | `/demo/form.simple` |
| `/demo/start/ssr` | `start.ssr.index.tsx` | `/demo/start.ssr.index` |
| `/demo/start/ssr/full-ssr` | `start.ssr.full-ssr.tsx` | `/demo/start.ssr.full-ssr` |
| `/demo/start/ssr/data-only` | `start.ssr.data-only.tsx` | `/demo/start.ssr.data-only` |
| `/demo/start/ssr/spa-mode` | `start.ssr.spa-mode.tsx` | `/demo/start.ssr.spa-mode` |
| `/demo/start/server-funcs` | `start.server-funcs.tsx` | `/demo/start.server-funcs` |
| `/demo/start/api-request` | `start.api-request.tsx` | `/demo/start.api-request` |

**Note**: Need to test if TanStack Router has special handling for these patterns.

### 3. Missing from Sidebar
- ❌ Pacer demo (registered in DemosSection but not in sidebar navigation)
- ❌ Guitar demo (not in DemosSection or sidebar)

### 4. Guitar Demo Not Featured
**Status**: ❌ NOT IN DEMOSSECTION

**Problem**: Guitar demo exists at `src/routes/demo/guitars/` but:
- NOT listed in `DemosSection.tsx` (homepage cards)
- NOT in sidebar navigation (`navigation-data.tsx`)
- Has broken internal links (uses `/example/` instead of `/demo/`)

---

## What Makes a Demo "Complete"

Based on analysis of existing demos:

### 1. Route Implementation ✅
- File in `src/routes/demo/*.tsx`
- Valid TanStack Router route definition
- Working component with demo functionality

### 2. DemosSection Registration ✅
- Entry in `src/components/DemosSection.tsx`
- Includes:
  - Title, description, icon
  - Badge, color scheme
  - Features list
  - "What I Learned" learnings array
  - Technical highlights
  - Git evidence (code location)

### 3. Sidebar Navigation ✅
- Entry in `src/lib/navigation-data.tsx`
- Correct path matching actual route
- Nested under appropriate section (AI Demos, TanStack Demos, etc.)

### 4. Supporting Components (if needed)
- Demo-specific components in `src/components/`
- API routes in `src/routes/demo/api*.ts`
- Data files in `src/data/`

---

## Guitar Demo Current State

**Files**:
- ✅ Route: `src/routes/demo/guitars/index.tsx`
- ✅ Route: `src/routes/demo/guitars/$guitarId.tsx`
- ✅ Data: `src/data/demo-guitars.ts`

**Status**:
- ❌ Broken internal routing (uses `/example/guitars/` instead of `/demo/guitars/`)
- ❌ NOT in DemosSection.tsx
- ❌ NOT in sidebar navigation
- ❌ NOT featured on homepage

**To Make Complete**:
1. Fix internal links (2 files, 2 lines)
2. Add entry to `DemosSection.tsx` with learnings
3. Add to sidebar navigation (TanStack Demos or separate section)
4. Test routing works end-to-end

---

## Recommendations

### Immediate Fixes
1. Fix guitar demo routing (`/example/` → `/demo/`)
2. Verify sidebar path mismatches (test if navigation works despite `.` vs `/` difference)

### Feature Additions
1. Add guitar demo to DemosSection.tsx with:
   - Learning story about TanStack Router params
   - Dynamic routing showcase
   - Type-safe navigation
2. Add guitar demo to sidebar navigation
3. Add Pacer demo to sidebar (currently only in DemosSection)

### Path Convention Clarification
Decide on routing convention:
- **Option A**: Keep `.` in filenames, use `.` in paths (matches file system)
- **Option B**: Restructure to use directories (e.g., `form/simple/index.tsx`)
- **Current**: Mixed approach causing confusion

---

## File Reference

| File | Purpose | Line Count |
|------|---------|------------|
| `src/components/DemosSection.tsx` | Homepage demo cards | ~820 lines |
| `src/lib/navigation-data.tsx` | Sidebar navigation | ~230 lines |
| `src/routes/demo/*.tsx` | Demo implementations | 18 files |
| `src/routes/demo/guitars/*.tsx` | Guitar demo | 2 files (broken) |
| `src/data/demo-guitars.ts` | Guitar data | Unknown |


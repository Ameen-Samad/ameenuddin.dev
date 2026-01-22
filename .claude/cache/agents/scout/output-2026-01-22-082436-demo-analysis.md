# Codebase Report: Demo Files Analysis
Generated: 2026-01-22

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
- ⚠️ Form (Address) → `/demo/form/address` (OK: uses directory routing)

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

## Guitar Demo Current State

**Files**:
- ✅ Route: `src/routes/demo/guitars/index.tsx` (56 lines)
- ✅ Route: `src/routes/demo/guitars/$guitarId.tsx` (52 lines)
- ✅ Data: `src/data/demo-guitars.ts` (82 lines, 6 guitars)

**Functionality**:
- Guitar listing page with cards
- Dynamic detail pages with guitar info
- Image display and pricing
- Data includes: Fender Stratocaster, Gibson Les Paul, PRS Custom 24, Ibanez RG, ESP Eclipse, Schecter Hellraiser

**Issues**:
1. ❌ Broken internal routing (uses `/example/guitars/` instead of `/demo/guitars/`)
   - Line 20 in `index.tsx`: `<Link to="/example/guitars/$guitarId">`
   - Line 23 in `$guitarId.tsx`: `<Link to="/example/guitars">`
2. ❌ NOT in DemosSection.tsx (homepage cards)
3. ❌ NOT in sidebar navigation
4. ❌ NOT discoverable by users

---

## What Makes a Demo "Complete"

Based on analysis of 22 existing demos:

### 1. Route Implementation ✅
- File in `src/routes/demo/*.tsx`
- Valid TanStack Router route definition with `createFileRoute()`
- Working component with demo functionality
- API routes if needed (`src/routes/demo/api*.ts`)

### 2. DemosSection Registration ✅
**Required** for homepage visibility.

Entry in `src/components/DemosSection.tsx` includes:
- `id`: Unique identifier
- `title`: Display name
- `description`: Short description
- `icon`: Lucide React icon component
- `path`: Route path (must match actual route)
- `badge`: Category badge (e.g., "Live AI", "TanStack")
- `color`: Hex color for theming
- `features`: Array of feature tags (3-4 items)
- `learnings`: Array of learning points (3-5 items)
- `technicalHighlights`: Optional deeper insights (2-4 items)
- `gitEvidence`: Code location reference

### 3. Sidebar Navigation ✅
**Required** for site navigation.

Entry in `src/lib/navigation-data.tsx`:
- Nested under appropriate section (AI Demos, TanStack Demos, etc.)
- Correct path matching actual route
- Icon and label
- Must be in `navItems` array

### 4. Supporting Files (if needed)
- Demo-specific components in `src/components/demo-*.tsx`
- API routes in `src/routes/demo/api*.ts`
- Data files in `src/data/demo-*.ts`
- CSS files in `src/routes/demo/*.css`

---

## Issues Found

### 1. Guitar Demo - Broken Internal Links
**Status**: ❌ CRITICAL - NOT WORKING

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

**Fix Required**:
```diff
# In src/routes/demo/guitars/index.tsx line 20
- to="/example/guitars/$guitarId"
+ to="/demo/guitars/$guitarId"

# In src/routes/demo/guitars/$guitarId.tsx line 23
- to="/example/guitars"
+ to="/demo/guitars"
```

### 2. Sidebar Navigation Path Mismatches
**Status**: ⚠️ NEEDS VERIFICATION

TanStack Router file-based routing may handle these differently:

| Sidebar Path | File Name | Expected Route |
|--------------|-----------|----------------|
| `/demo/form/simple` | `form.simple.tsx` | `/demo/form.simple` or `/demo/form/simple`? |
| `/demo/start/ssr` | `start.ssr.index.tsx` | `/demo/start.ssr.index` or `/demo/start/ssr`? |

**Action**: Test if routes work despite naming differences. TanStack Router may have special `.` handling.

### 3. Missing from Sidebar Navigation
- ❌ Pacer demo exists in DemosSection but NOT in sidebar
- ❌ Guitar demo NOT anywhere

### 4. Guitar Demo Not Featured
**Status**: ❌ NOT DISCOVERABLE

The guitar demo has full implementation but is completely hidden:
- NOT in homepage DemosSection cards
- NOT in sidebar navigation
- No way for users to find it except direct URL

---

## Recommendations

### Immediate Fixes (High Priority)

1. **Fix Guitar Demo Routing** (5 min)
   - Change `/example/guitars/` to `/demo/guitars/` in 2 files
   - Test navigation works end-to-end

2. **Add Pacer to Sidebar** (2 min)
   - Add entry to TanStack Demos section in `navigation-data.tsx`

### Feature Additions (Medium Priority)

3. **Add Guitar Demo to DemosSection** (15 min)
   - Write "What I Learned" content about:
     - TanStack Router dynamic params
     - Type-safe route parameters
     - Loader data fetching
     - 404 handling
   - Choose icon (Guitar or Folder)
   - Pick color scheme
   - Add to demos array

4. **Add Guitar Demo to Sidebar** (5 min)
   - Create new "Example Demos" section OR
   - Add to TanStack Demos as "Router Example"

### Path Convention Fix (Low Priority)

5. **Verify Route Mismatches**
   - Test if sidebar paths work despite `.` vs `/` difference
   - Document TanStack Router's file naming conventions
   - Fix any broken links

---

## File Locations Reference

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `src/components/DemosSection.tsx` | Homepage demo cards | ~820 | Complete |
| `src/lib/navigation-data.tsx` | Sidebar navigation | ~230 | Missing 2 demos |
| `src/routes/demo/guitars/index.tsx` | Guitar listing | 56 | Broken routing |
| `src/routes/demo/guitars/$guitarId.tsx` | Guitar detail | 52 | Broken routing |
| `src/data/demo-guitars.ts` | Guitar data | 82 | Complete |
| `src/routes/demo/*.tsx` | Demo implementations | 18 files | All complete |

---

## Summary Statistics

- **Total demos implemented**: 20 (18 single-file + 2 guitar pages)
- **Demos in DemosSection**: 22 (includes non-demo routes like /chatbot, /tetris, /builder)
- **Demos in sidebar**: 20 (missing Pacer and Guitar)
- **Incomplete demos**: 1 (Guitar - broken routing + not featured)
- **Critical issues**: 2 broken links in guitar demo
- **Medium issues**: 2 demos missing from sidebar
- **Low issues**: 7 potential path mismatches (needs verification)


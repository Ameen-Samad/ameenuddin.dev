# Implementation Plan: AI Guitar Concierge

## Overview
Transform the basic guitar demo into a comprehensive AI-powered shopping experience.

**Spec**: `thoughts/shared/specs/2026-01-22-guitar-concierge-spec.md`
**Session**: `build-20260122-guitar-demo`

## Phase 1: Foundation & Core Fixes (15 min)

### Task 1.1: Fix Broken Routing
- [ ] `src/routes/demo/guitars/index.tsx`: Change `/example/guitars/` to `/demo/guitars/`
- [ ] `src/routes/demo/guitars/$guitarId.tsx`: Change `/example/guitars` to `/demo/guitars`

### Task 1.2: Enhance Guitar Data Model
- [ ] `src/data/demo-guitars.ts`: Add `type`, `tags`, `features` fields to each guitar
- [ ] Add TypeScript interface updates

### Task 1.3: Create Directory Structure
```bash
mkdir -p src/routes/demo/guitars/_components
mkdir -p src/stores
```

## Phase 2: Shopping Cart with TanStack Store (30 min)

### Task 2.1: Create Cart Store
- [ ] `src/stores/cart-store.ts`: TanStack Store with:
  - State: items array
  - Actions: addItem, removeItem, updateQuantity, clearCart
  - Computed: total, itemCount
  - localStorage persistence

### Task 2.2: Create Cart Components
- [ ] `src/routes/demo/guitars/_components/CartIcon.tsx`: Header icon with badge
- [ ] `src/routes/demo/guitars/_components/CartDrawer.tsx`: Slide-out cart panel
- [ ] `src/routes/demo/guitars/_components/CartItem.tsx`: Individual cart item row

### Task 2.3: Integrate Cart
- [ ] Add CartIcon to guitar index page header
- [ ] Add "Add to Cart" buttons to guitar cards
- [ ] Add "Add to Cart" button to detail page

## Phase 3: Guitar Grid with TanStack Table & Filters (45 min)

### Task 3.1: Create Filter Components
- [ ] `src/routes/demo/guitars/_components/GuitarFilters.tsx`:
  - Price range slider/inputs
  - Type multi-select (acoustic/electric/ukulele)
  - Clear filters button

### Task 3.2: Create Enhanced Grid
- [ ] `src/routes/demo/guitars/_components/GuitarGrid.tsx`:
  - TanStack Table with sorting
  - Client-side filtering
  - Responsive grid layout
  - Debounced search with Pacer

### Task 3.3: Create Guitar Card
- [ ] `src/routes/demo/guitars/_components/GuitarCard.tsx`:
  - Image, name, price
  - Type badge
  - Add to Cart button
  - Add to Compare button

### Task 3.4: Update Index Page
- [ ] Refactor `src/routes/demo/guitars/index.tsx` to use new components

## Phase 4: AI Chat Interface (45 min)

### Task 4.1: Create Chat API Endpoint
- [ ] `src/routes/demo/api/ai.guitars.chat.ts`:
  - POST handler with streaming
  - System prompt: Expert music shop owner
  - Tool definitions: getGuitars, recommendGuitar
  - Rate limiting

### Task 4.2: Create Chat Components
- [ ] `src/routes/demo/guitars/_components/GuitarChat.tsx`:
  - Message list (user/assistant)
  - Input field with send button
  - Streaming response display
  - Tool result rendering (guitar cards)
  - Collapsible panel

### Task 4.3: Create Chat Message Components
- [ ] `src/routes/demo/guitars/_components/ChatMessage.tsx`: Single message
- [ ] `src/routes/demo/guitars/_components/ChatRecommendation.tsx`: Guitar card in chat

### Task 4.4: Integrate Chat
- [ ] Add GuitarChat to index page (right panel)

## Phase 5: Semantic Search with Embeddings (30 min)

### Task 5.1: Pre-compute Guitar Embeddings
- [ ] Create script or server function to generate embeddings
- [ ] Store embeddings in `demo-guitars.ts` or separate file

### Task 5.2: Create Search API Endpoint
- [ ] `src/routes/demo/api/ai.guitars.embed.ts`:
  - POST handler for query embedding
  - Cosine similarity calculation
  - Return ranked results

### Task 5.3: Create Search Component
- [ ] `src/routes/demo/guitars/_components/SemanticSearch.tsx`:
  - Search input with placeholder
  - Debounced with Pacer
  - Loading state
  - Results display with relevance

### Task 5.4: Integrate Search
- [ ] Add SemanticSearch to index page header
- [ ] Wire up to filter results

## Phase 6: Comparison Tool (30 min)

### Task 6.1: Create Compare Store
- [ ] `src/stores/compare-store.ts`: TanStack Store with:
  - State: guitarIds array (max 2)
  - Actions: addToCompare, removeFromCompare, clearCompare

### Task 6.2: Create Compare Components
- [ ] `src/routes/demo/guitars/_components/CompareBar.tsx`: Floating comparison tray
- [ ] `src/routes/demo/guitars/_components/CompareView.tsx`: Side-by-side view

### Task 6.3: Create Compare Page
- [ ] `src/routes/demo/guitars/compare.tsx`:
  - Load selected guitars
  - Display CompareView
  - AI-generated insights

### Task 6.4: Create Compare API Endpoint
- [ ] `src/routes/demo/api/ai.guitars.compare.ts`:
  - POST handler for comparison insights
  - Generate "Why choose this" for each

### Task 6.5: Integrate Comparison
- [ ] Add "Compare" buttons to GuitarCard
- [ ] Add CompareBar to index page

## Phase 7: Polish & Integration (20 min)

### Task 7.1: Update Detail Page
- [ ] `src/routes/demo/guitars/$guitarId.tsx`:
  - Add to Cart button (functional)
  - Add to Compare button
  - Back link (fixed routing)

### Task 7.2: Add to DemosSection
- [ ] `src/components/DemosSection.tsx`: Add guitar demo card with:
  - Title: "AI Guitar Concierge"
  - Description
  - "What I Learned" items

### Task 7.3: Add to Sidebar Navigation
- [ ] `src/lib/navigation-data.tsx`: Add entry for guitar demo

### Task 7.4: Final Testing
- [ ] Test all user flows
- [ ] Verify responsive design
- [ ] Check all links work

## Verification Checklist

- [ ] All routing uses `/demo/guitars/` (not `/example/`)
- [ ] AI chat works with streaming responses
- [ ] Semantic search returns relevant results
- [ ] Cart persists across page refreshes
- [ ] Cart persists across browser close/reopen
- [ ] Comparison tool works for 2 guitars
- [ ] Filters and sorting work correctly
- [ ] Mobile responsive
- [ ] Listed in DemosSection
- [ ] Listed in sidebar navigation

## Dependencies

- TanStack Store (already installed)
- TanStack Table (already installed)
- TanStack Pacer (already installed)
- Cloudflare AI bindings (already configured)

## Estimated Time

- Phase 1: 15 min
- Phase 2: 30 min
- Phase 3: 45 min
- Phase 4: 45 min
- Phase 5: 30 min
- Phase 6: 30 min
- Phase 7: 20 min
- **Total**: ~3.5 hours

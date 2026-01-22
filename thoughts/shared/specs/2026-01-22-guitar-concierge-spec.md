# AI Guitar Concierge - Specification

## Executive Summary

A comprehensive AI-powered guitar shopping experience that showcases full-stack AI integration and e-commerce patterns. Users can chat with an expert AI concierge for personalized recommendations, search by vibe/style/use-case using semantic embeddings, manage a persistent shopping cart, compare guitars side-by-side, and browse with advanced filtering.

## Problem Statement

The current guitar demo is a basic static listing with broken routing (`/example/` instead of `/demo/`). It doesn't showcase any meaningful technical skills to potential employers. This upgrade transforms it into a portfolio-worthy demonstration of:
- AI integration (chat, tool calling, embeddings, semantic search)
- Modern React patterns (TanStack ecosystem)
- E-commerce fundamentals (cart, search, filtering, comparison)
- Full-stack capabilities (SSR, API routes, state management)

## Success Criteria

1. **AI Chat**: Users can describe what they want in natural language and receive relevant recommendations
2. **Semantic Search**: Queries like "warm vintage tone" return appropriate guitars
3. **Shopping Cart**: Fully functional cart with add/remove/quantity, persists across sessions
4. **Comparison Tool**: Side-by-side comparison of 2 guitars with AI-generated insights
5. **Filtering**: Sort/filter by price, type (acoustic/electric), features
6. **Professional UI**: Polished, responsive, demonstrates attention to detail

## User Personas

### Primary: Potential Employer / Technical Reviewer
- **Goal**: Evaluate candidate's technical skills
- **Looks for**: Clean code, modern patterns, AI integration, attention to detail
- **Technical level**: High - will inspect code and architecture

### Secondary: Casual Visitor
- **Goal**: Explore the demo, have fun
- **Looks for**: Working features, good UX, interesting AI interactions

## User Journey

### Flow 1: AI-Assisted Discovery
1. User lands on `/demo/guitars`
2. Sees featured guitars grid + prominent AI chat interface
3. Opens chat: "I'm looking for a guitar with warm vintage tones for jazz"
4. AI (expert music shop owner persona) asks clarifying questions
5. AI uses `recommendGuitar` tool to display recommendation with buy button
6. User adds to cart directly from chat recommendation

### Flow 2: Search-Based Discovery
1. User uses semantic search bar: "chill acoustic vibes"
2. System generates embedding, compares to guitar embeddings
3. Results ranked by semantic similarity
4. User clicks through to guitar detail page
5. Adds to cart

### Flow 3: Browse & Filter
1. User browses guitar grid
2. Applies filters: Price $500-$700, Type: Electric
3. Sorts by price ascending
4. Clicks guitar to view details
5. Uses "Compare" button to add to comparison

### Flow 4: Comparison
1. User has 2 guitars in comparison tray
2. Clicks "Compare" to see side-by-side view
3. AI generates personalized "Why choose this one" for each
4. User decides and adds winner to cart

### Flow 5: Cart Management
1. User clicks cart icon (shows item count)
2. Views cart drawer/page with all items
3. Adjusts quantities, removes items
4. Sees total price
5. (Checkout button present but non-functional - demo only)

## Functional Requirements

### Must Have (P0)

#### 1. Fix Broken Routing
- Change all `/example/guitars/` to `/demo/guitars/`
- Ensure all internal links work

#### 2. AI Chat Interface
- Chat panel (collapsible or always visible)
- Expert music shop owner persona in system prompt
- Support for tool calling:
  - `getGuitars`: Fetch all guitars
  - `recommendGuitar`: Display guitar recommendation card in chat
- Streaming responses for better UX
- Rate limiting (client-side with Pacer)

#### 3. Semantic Search
- Search bar with placeholder: "Search by feel, style, or use..."
- Generate embeddings for search query via Cloudflare AI
- Pre-computed embeddings for all guitar descriptions (stored in data file)
- Cosine similarity ranking
- Display results with relevance indicator

#### 4. Shopping Cart (TanStack Store)
- Global cart state using TanStack Store
- Cart icon with item count in header
- Add to cart from:
  - Guitar grid
  - Guitar detail page
  - AI recommendation in chat
- Cart drawer/sidebar with:
  - Item list with images
  - Quantity adjustment (+/-)
  - Remove item button
  - Subtotal per item
  - Grand total
- Persist to localStorage
- Restore on page load

#### 5. Guitar Grid with Filtering (TanStack Table)
- Sortable columns: Name, Price
- Filter by:
  - Price range (slider or min/max inputs)
  - Type: Acoustic / Electric / Ukulele (multi-select)
- Search within results (debounced with Pacer)
- Responsive grid layout

#### 6. Guitar Comparison Tool
- "Add to Compare" button on each guitar card
- Comparison tray showing selected guitars (max 2)
- Compare page/modal with side-by-side:
  - Images
  - Names
  - Prices
  - Descriptions
  - AI-generated "Why choose this" for each

#### 7. Guitar Detail Page
- Large image
- Full description
- Price
- Add to Cart button
- Add to Compare button
- "Back to all guitars" link (fixed routing)

#### 8. DemosSection Integration
- Add card with:
  - Title: "AI Guitar Concierge"
  - Description: AI-powered shopping experience
  - "What I Learned" story about AI integration

### Should Have (P1)

#### 9. Enhanced Guitar Data
- Add `type` field: "acoustic" | "electric" | "ukulele"
- Add `tags` array for semantic matching: ["vintage", "warm", "jazz", "rock", etc.]
- Add `features` array for comparison

#### 10. AI-Generated Comparison Insights
- When comparing, call AI to generate:
  - "Best for: [use case]"
  - "Sound profile: [description]"
  - "Why choose this one"

### Nice to Have (P2)

#### 11. Recently Viewed
- Track last 3-5 viewed guitars
- Show in sidebar or footer

#### 12. "Similar Guitars" on Detail Page
- Based on semantic similarity
- "You might also like..."

## Technical Architecture

### Data Model

```typescript
interface Guitar {
  id: number;
  name: string;
  image: string;
  description: string;
  shortDescription: string;
  price: number;
  type: "acoustic" | "electric" | "ukulele"; // NEW
  tags: string[]; // NEW: ["vintage", "warm", "jazz"]
  features: string[]; // NEW: ["LED lights", "Custom pickups"]
  embedding?: number[]; // Pre-computed for semantic search
}

interface CartItem {
  guitarId: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (guitarId: number) => void;
  removeItem: (guitarId: number) => void;
  updateQuantity: (guitarId: number, quantity: number) => void;
  clearCart: () => void;
  total: number; // computed
}

interface CompareState {
  guitarIds: number[]; // max 2
  addToCompare: (guitarId: number) => void;
  removeFromCompare: (guitarId: number) => void;
  clearCompare: () => void;
}
```

### System Components

```
src/routes/demo/guitars/
├── index.tsx           # Main page: grid + chat + search
├── $guitarId.tsx       # Detail page
├── compare.tsx         # Comparison page (NEW)
├── _components/
│   ├── GuitarChat.tsx      # AI chat interface
│   ├── GuitarGrid.tsx      # TanStack Table grid
│   ├── GuitarCard.tsx      # Individual card
│   ├── GuitarFilters.tsx   # Filter controls
│   ├── SemanticSearch.tsx  # Search bar with embeddings
│   ├── CartDrawer.tsx      # Cart sidebar
│   ├── CartIcon.tsx        # Header cart icon with count
│   ├── CompareBar.tsx      # Comparison tray
│   └── CompareView.tsx     # Side-by-side comparison

src/stores/
├── cart-store.ts       # TanStack Store for cart
└── compare-store.ts    # TanStack Store for comparison

src/routes/demo/api/
├── ai.guitars.chat.ts      # AI chat endpoint
├── ai.guitars.embed.ts     # Embedding generation
└── ai.guitars.compare.ts   # AI comparison insights

src/data/
└── demo-guitars.ts     # Guitar data with embeddings

src/lib/
└── demo-guitar-tools.ts # AI tool definitions (existing)
```

### Integrations

- **Cloudflare AI**: Text generation (chat), embeddings (semantic search)
- **TanStack Store**: Cart and comparison state
- **TanStack Table**: Guitar grid with sorting/filtering
- **TanStack Query**: Data fetching with caching
- **TanStack Pacer**: Debouncing search, rate limiting AI calls
- **localStorage**: Cart persistence

### Security Model

- Rate limiting on AI endpoints (existing pattern in codebase)
- No user authentication required (demo)
- No sensitive data stored

## Non-Functional Requirements

- **Performance**:
  - Semantic search < 500ms
  - Chat response streaming starts < 1s
  - Grid filtering instant (client-side)
- **Responsiveness**: Works on mobile, tablet, desktop
- **Accessibility**: Proper ARIA labels, keyboard navigation

## Out of Scope

- Actual checkout/payment processing
- User accounts/authentication
- Order history
- Inventory management
- Admin panel
- Real guitar data (keep the fun fictional guitars)

## Open Questions for Implementation

1. Should the chat be a drawer, modal, or inline panel?
   → **Decision**: Start with collapsible inline panel on right side

2. Should comparison be a separate page or modal?
   → **Decision**: Separate page at `/demo/guitars/compare`

3. Where to show cart - drawer or separate page?
   → **Decision**: Drawer (slide out from right)

## Appendix: AI Prompts

### Chat System Prompt
```
You are an expert music shop owner with 30 years of experience. You're knowledgeable, passionate about guitars, and love helping customers find their perfect instrument.

When a customer describes what they're looking for, ask clarifying questions about:
- Their playing style and experience level
- Preferred music genres
- Budget considerations
- Whether they prefer acoustic or electric

Use the getGuitars tool to see available inventory, then use recommendGuitar to show your recommendation. Always explain WHY you're recommending a particular guitar based on what they told you.

Keep responses conversational but concise. You're helpful, not pushy.
```

### Comparison Insight Prompt
```
Compare these two guitars for a customer:

Guitar A: {name}, {description}, ${price}
Guitar B: {name}, {description}, ${price}

For each guitar, provide:
1. Best suited for: [1-2 use cases]
2. Sound profile: [2-3 words]
3. Why choose this one: [1 sentence]

Be specific and helpful. This helps the customer decide.
```

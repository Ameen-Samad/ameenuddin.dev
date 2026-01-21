# Research Report: TanStack Ecosystem - Complete Package List (2025-2026)
Generated: 2026-01-21

## Summary

TanStack has evolved from a data-fetching library (React Query) into a comprehensive frontend ecosystem with 15+ official packages. The ecosystem now spans data management, routing, forms, tables, virtualization, AI integration, and a full-stack framework (TanStack Start). All libraries follow a framework-agnostic core design with adapters for React, Vue, Solid, Svelte, Angular, and vanilla JS.

## Official TanStack Packages

### Core/Production-Ready Libraries

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| **TanStack Query** | 5.90.16 | Stable | Asynchronous state management, server-state utilities, and data fetching with caching, background updates, and stale-while-revalidate patterns |
| **TanStack Router** | 1.132.x | Stable | Client-first, server-capable, fully type-safe router with first-class search params and seamless integration with data fetching libraries |
| **TanStack Table** | 8.21.3 | Stable | Headless UI for building powerful tables & datagrids with sorting, filtering, grouping, aggregation, and row selection |
| **TanStack Form** | 1.27.7 | Stable (v1) | Headless, performant, and type-safe form state management with validation adapters (Zod, Valibot, Yup, ArkType) |
| **TanStack Virtual** | 3.13.18 | Stable | Virtualize massive scrollable DOM lists at 60FPS while retaining 100% control over markup and styles |
| **TanStack Store** | 0.8.0 | Alpha | Framework-agnostic, type-safe reactive store that powers the core of TanStack libraries |
| **TanStack Start** | 1.x | Stable (v1) | Full-stack framework built on TanStack Router and Vite with SSR, streaming hydration, and server functions |

### Newer Libraries (2025-2026 Releases)

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| **TanStack DB** | 0.5.x | Beta | Reactive client-side database with typed collections, live queries, optimistic mutations, and differential dataflow engine |
| **TanStack AI** | Alpha | Alpha | Framework-agnostic AI toolkit with unified interface across multiple providers (OpenAI, etc.), positioned as alternative to Vercel AI SDK |
| **TanStack Pacer** | 0.4.x | Beta | Utilities for debouncing, throttling, rate limiting, queuing, and batching with concurrency control |
| **TanStack DevTools** | 0.7.x | Alpha | Centralized panel that houses all TanStack library devtools with extensible plugin system |

### Utility/Supporting Libraries

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| **TanStack Ranger** | 0.0.4 | Alpha | Headless utilities for building range and multi-range sliders |
| **TanStack Time** | WIP | Pre-release | Headless utilities for building time and calendar components (uses Temporal API polyfill) |
| **TanStack Config** | - | Stable | Opinionated tooling to lint, build, test, version, and publish JS/TS packages |
| **TanStack MCP** | 0.10.0-alpha.16 | Alpha | Model Context Protocol server to connect AI assistants to TanStack documentation |
| **create-tsrouter-app** | - | Stable | CLI tool to scaffold TanStack Router-based SPA applications (drop-in replacement for create-react-app) |

## Detailed Package Information

### TanStack Query
**NPM:** `@tanstack/react-query` (also vue-query, solid-query, svelte-query, angular-query)
**Source:** [TanStack Query](https://tanstack.com/query/latest)

The flagship package. Handles server state with:
- Automatic caching and cache invalidation
- Background refetching
- Stale-while-revalidate patterns
- Pagination and infinite queries
- DevTools included

### TanStack Router
**NPM:** `@tanstack/react-router`, `@tanstack/router-plugin`
**Source:** [TanStack Router](https://tanstack.com/router/latest)

Features:
- 100% type-safe route definitions
- First-class URL search params as state
- File-based or code-based routing
- Loaders and actions for data loading
- Integrates with TanStack Query, SWR, Apollo

### TanStack Table
**NPM:** `@tanstack/react-table` (also vue-table, solid-table, svelte-table)
**Source:** [TanStack Table](https://tanstack.com/table/latest)

Headless table with:
- Sorting, filtering, pagination
- Column pinning, resizing, visibility
- Row selection and expansion
- Aggregation and grouping
- Server-side data support

### TanStack Form
**NPM:** `@tanstack/react-form` (also vue-form, solid-form, angular-form, lit-form, svelte-form)
**Source:** [TanStack Form](https://tanstack.com/form/latest)

Released v1 on March 3, 2025. Features:
- First-class TypeScript with excellent inference
- Field-level and form-level validation
- Async validation support
- Schema adapters: Zod, Valibot, Yup, ArkType
- Meta-framework adapters: Next.js, Remix, TanStack Start

### TanStack Virtual
**NPM:** `@tanstack/react-virtual` (also vue-virtual, solid-virtual, svelte-virtual, lit-virtual)
**Source:** [TanStack Virtual](https://tanstack.com/virtual/latest)

Virtualization for:
- Lists (vertical/horizontal)
- Grids
- Variable-size items
- Dynamic measurement
- Smooth scrolling at 60FPS

### TanStack Start (NEW - v1 in 2025)
**NPM:** `@tanstack/react-start`
**Source:** [TanStack Start](https://tanstack.com/start/latest)

Full-stack React/Solid framework:
- Built on TanStack Router + Vite
- Server-side rendering (SSR)
- Streaming hydration
- Server functions (RPC-style)
- Type-safe APIs end-to-end
- Universal deployment (Node, Edge, Serverless)

### TanStack DB (NEW - Beta 2025)
**NPM:** `@tanstack/db`, `@tanstack/react-db`
**Source:** [TanStack DB](https://github.com/TanStack/db)

Client-side reactive database:
- Typed collections as normalized stores
- Live queries with incremental updates
- Differential dataflow engine (sub-ms updates)
- Optimistic mutations with automatic rollback
- Real-time sync adapters
- Built on TanStack Query

### TanStack AI (NEW - Alpha Dec 2025)
**NPM:** `@tanstack/ai`, `@tanstack/ai-react`, `@tanstack/ai-openai`
**Source:** [TanStack AI](https://github.com/TanStack/ai)

Framework-agnostic AI toolkit:
- Unified interface across AI providers
- Type-safe isomorphic tools
- No vendor lock-in (pure open source)
- Direct provider connections (no middleman)
- Alternative to Vercel AI SDK

### TanStack Pacer (NEW - Beta)
**NPM:** `@tanstack/pacer`, `@tanstack/react-pacer`
**Source:** [TanStack Pacer](https://tanstack.com/pacer/latest)

Execution timing utilities:
- Debouncing and throttling
- Rate limiting
- Queue management (LIFO/FIFO)
- Batching
- Concurrency control
- Pause/resume/cancel support
- Also available: `@tanstack/pacer-lite` (minimal overhead version)

### TanStack Store
**NPM:** `@tanstack/store`, `@tanstack/react-store`
**Source:** [TanStack Store](https://tanstack.com/store/latest)

Reactive state management:
- Immutable-reactive data store
- Powers TanStack library internals
- Framework adapters for React, Vue, Solid, Angular, Preact

## Package Compatibility Matrix

| Use Case | Primary Package | Commonly Paired With |
|----------|-----------------|---------------------|
| Data fetching | Query | Router, Form |
| Routing | Router | Query, Start |
| Tables/Datagrids | Table | Query, Virtual |
| Forms | Form | Query |
| Long lists | Virtual | Query, Table |
| Full-stack app | Start | Query, Router, Form |
| Real-time/local-first | DB | Query |
| AI features | AI | Query |
| Timing control | Pacer | Query |

## Recommended Combinations

### SPA with Data Management
```
@tanstack/react-query + @tanstack/react-router + @tanstack/react-table
```

### Full-Stack Application
```
@tanstack/react-start + @tanstack/react-query + @tanstack/react-form
```

### Complex Forms with Tables
```
@tanstack/react-form + @tanstack/react-table + @tanstack/react-query
```

### High-Performance Lists/Tables
```
@tanstack/react-virtual + @tanstack/react-table + @tanstack/react-query
```

### Local-First / Real-Time App
```
@tanstack/react-db + @tanstack/react-query + @tanstack/react-start
```

## New in 2025-2026

1. **TanStack Start v1** (November 2025) - Full-stack framework reaching production status
2. **TanStack DB Beta** (August 2025) - Reactive client-side database with optimistic mutations
3. **TanStack AI Alpha** (December 2025) - Framework-agnostic AI toolkit
4. **TanStack Form v1** (March 2025) - Stable release with comprehensive validation adapters
5. **TanStack Pacer** (2025) - New utility library for timing control
6. **TanStack DevTools** - Centralized devtools panel for all TanStack libraries
7. **TanStack MCP** - Model Context Protocol integration for AI assistants

## Framework Support Matrix

| Package | React | Vue | Solid | Svelte | Angular | Lit | Vanilla |
|---------|-------|-----|-------|--------|---------|-----|---------|
| Query | Yes | Yes | Yes | Yes | Yes | - | Yes |
| Router | Yes | - | Yes | - | - | - | - |
| Table | Yes | Yes | Yes | Yes | - | - | Yes |
| Form | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Virtual | Yes | Yes | Yes | Yes | - | Yes | Yes |
| Store | Yes | Yes | Yes | - | Yes | - | Yes |
| Start | Yes | - | Yes | - | - | - | - |
| DB | Yes | Yes | Yes | Yes | - | - | Yes |
| AI | Yes | Yes | Yes | - | - | - | Yes |
| Pacer | Yes | Yes | Yes | - | - | - | Yes |

## Sources

1. [TanStack Official Website](https://tanstack.com/)
2. [TanStack All Libraries](https://tanstack.com/libraries)
3. [TanStack GitHub Organization](https://github.com/tanstack)
4. [TanStack in 2026: Complete Guide - CodeWithSeb](https://www.codewithseb.com/blog/tanstack-ecosystem-complete-guide-2026)
5. [TanStack Start v1 Announcement - InfoQ](https://www.infoq.com/news/2025/11/tanstack-start-v1/)
6. [TanStack DB Beta Announcement - InfoQ](https://www.infoq.com/news/2025/08/tanstack-db-beta/)
7. [TanStack AI SDK Release - InfoQ](https://www.infoq.com/news/2026/01/tanstack-ai-sdk/)
8. [TanStack Form v1 Announcement](https://tanstack.com/blog/announcing-tanstack-form-v1)
9. [@tanstack/react-query npm](https://www.npmjs.com/package/@tanstack/react-query)
10. [@tanstack/react-table npm](https://www.npmjs.com/package/@tanstack/react-table)
11. [@tanstack/react-form npm](https://www.npmjs.com/package/@tanstack/react-form)
12. [@tanstack/react-virtual npm](https://www.npmjs.com/package/@tanstack/react-virtual)
13. [TanStack Pacer Docs](https://tanstack.com/pacer/latest)
14. [TanStack Time GitHub](https://github.com/TanStack/time)
15. [TanStack DevTools](https://tanstack.com/devtools/latest)
16. [How to Build Modern React Apps with TanStack Suite 2025 - DEV](https://dev.to/andrewbaisden/how-to-build-modern-react-apps-with-the-tanstack-suite-in-2025-5fed)

## Open Questions

- TanStack Time is still in development - no npm package published yet
- TanStack Ranger has not been updated in 2 years (v0.0.4)
- TanStack Store remains in alpha despite being foundational to other libraries

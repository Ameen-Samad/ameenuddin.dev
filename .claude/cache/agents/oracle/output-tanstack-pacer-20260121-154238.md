# Research Report: TanStack Pacer v0.17+ API Documentation
Generated: 2026-01-21

## Summary

TanStack Pacer is a lightweight, framework-agnostic library for debouncing, throttling, rate limiting, queuing, and batching. It provides both core utilities (`@tanstack/pacer`) and React-specific hooks (`@tanstack/react-pacer`). The library is fully type-safe, tree-shakeable, and offers multiple layers of abstraction from simple functions to full class-based APIs.

## Questions Answered

### Q1: How to use debounce() - syntax, parameters, examples
**Answer:** The `debounce` function delays execution until after a period of inactivity. Import from `@tanstack/pacer` or `@tanstack/react-pacer/debouncer`.
**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/debounce
**Confidence:** High

### Q2: How to use throttle() - syntax, parameters, examples
**Answer:** The `throttle` function ensures execution at most once within a specified time window. Supports leading/trailing edge execution.
**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/throttle
**Confidence:** High

### Q3: Does rateLimit() exist? How does it work?
**Answer:** Yes, `rateLimit()` exists. It limits function executions within a time window (e.g., 5 calls per minute). Best used for hard API limits rather than UI updates.
**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/rateLimit
**Confidence:** High

### Q4: How to use queue() and batch()
**Answer:** Both exist. `queue()` processes items sequentially with configurable wait times and priority. `batch()` collects items and processes them as groups based on size or time.
**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/queue
**Confidence:** High

### Q5: React hooks available
**Answer:** Full suite of hooks: `useDebouncer`, `useDebouncedCallback`, `useDebouncedValue`, `useDebouncedState`, `useThrottler`, `useThrottledCallback`, `useThrottledValue`, `useThrottledState`, `useRateLimiter`, `useRateLimitedCallback`, `useQueuer`, `useBatcher`, and async variants.
**Source:** https://tanstack.com/pacer/latest/docs/framework/react/adapter
**Confidence:** High

### Q6: Differences between @tanstack/pacer and @tanstack/react-pacer
**Answer:** `@tanstack/pacer` is the framework-agnostic core. `@tanstack/react-pacer` re-exports everything from core plus adds React-specific hooks with lifecycle integration and automatic cleanup.
**Source:** https://tanstack.com/pacer/latest/docs/overview
**Confidence:** High

---

## Detailed Findings

### 1. debounce() Function

**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/debounce

**Syntax:**
```typescript
import { debounce } from '@tanstack/pacer'

const debouncedFn = debounce(fn, options)
```

**Parameters:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wait` | number | required | Milliseconds to wait before execution |
| `leading` | boolean | false | Execute on leading edge |
| `trailing` | boolean | true | Execute on trailing edge |
| `enabled` | boolean \| () => boolean | true | Enable/disable debouncing |

**Example:**
```typescript
import { debounce } from '@tanstack/pacer'

// Basic debounce
const debouncedSearch = debounce(
  (query: string) => performSearch(query),
  { wait: 500 }
)

// With leading edge
const debouncedSave = debounce(
  (data) => saveData(data),
  { wait: 1000, leading: true, trailing: false }
)

// Calling the debounced function
debouncedSearch('react hooks')
```

**Debouncer Class (for more control):**
```typescript
import { Debouncer } from '@tanstack/pacer'

const searchDebouncer = new Debouncer(
  (searchTerm: string) => performSearch(searchTerm),
  { wait: 500 }
)

// Access state
console.log(searchDebouncer.store.state.isPending)
console.log(searchDebouncer.store.state.executionCount)

// Control methods
searchDebouncer.cancel()  // Cancel pending execution
searchDebouncer.flush()   // Execute immediately
searchDebouncer.setOptions({ wait: 1000 })  // Update options
```

**Key Notes:**
- TanStack Pacer's Debouncer does NOT have a `maxWait` option like lodash. Use throttling instead if you need spread-out executions.

---

### 2. throttle() Function

**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/throttle

**Syntax:**
```typescript
import { throttle } from '@tanstack/pacer'

const throttledFn = throttle(fn, options)
```

**Parameters:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wait` | number | required | Minimum ms between executions |
| `leading` | boolean | true | Execute on leading edge |
| `trailing` | boolean | true | Execute on trailing edge |
| `enabled` | boolean \| () => boolean | true | Enable/disable throttling |

**Example:**
```typescript
import { throttle } from '@tanstack/pacer'

// Basic throttle - max once per second
const throttledScroll = throttle(
  () => updateScrollPosition(),
  { wait: 1000 }
)

// Leading only - execute immediately, then ignore for 1s
const throttledClick = throttle(
  () => handleClick(),
  { wait: 1000, leading: true, trailing: false }
)

window.addEventListener('scroll', throttledScroll)
```

**Throttler Class:**
```typescript
import { Throttler } from '@tanstack/pacer'

const scrollThrottler = new Throttler(
  () => updateUI(),
  { wait: 100 }
)

// Access state
console.log(scrollThrottler.store.state.executionCount)
console.log(scrollThrottler.store.state.isPending)

// Control
scrollThrottler.cancel()
scrollThrottler.setOptions({ wait: 200 })
```

---

### 3. rateLimit() Function

**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/rateLimit

**Yes, rateLimit() exists.** It limits executions to N calls within a time window.

**Syntax:**
```typescript
import { rateLimit } from '@tanstack/pacer'

const rateLimitedFn = rateLimit(fn, options)
```

**Parameters:**
| Option | Type | Description |
|--------|------|-------------|
| `limit` | number \| () => number | Max executions per window |
| `window` | number | Time window in milliseconds |
| `onReject` | (fn, rateLimiter) => void | Called when rate limit exceeded |

**Example:**
```typescript
import { rateLimit } from '@tanstack/pacer'

// 5 API calls per minute
const rateLimitedApiCall = rateLimit(
  (data) => callApi(data),
  {
    limit: 5,
    window: 60000, // 1 minute
    onReject: () => console.log('Rate limit exceeded!')
  }
)

rateLimitedApiCall({ action: 'fetch' })
```

**RateLimiter Class:**
```typescript
import { RateLimiter } from '@tanstack/pacer'

const apiLimiter = new RateLimiter(
  (data) => callExternalApi(data),
  { limit: 10, window: 60000 }
)

// Check status
console.log(apiLimiter.getRemainingInWindow())  // Calls remaining
console.log(apiLimiter.getMsUntilNextWindow())  // Ms until reset

// Execute with rate limiting
apiLimiter.maybeExecute({ endpoint: '/users' })
```

**Important Note:** The docs recommend using throttling or debouncing for UI updates. Rate limiting is best for hard API limits or resource constraints.

---

### 4. queue() and batch() Functions

**Source:** https://tanstack.com/pacer/latest/docs/reference/functions/queue, https://tanstack.com/pacer/latest/docs/reference/classes/batcher

#### queue()

**Syntax:**
```typescript
import { queue } from '@tanstack/pacer'

const queuedFn = queue(fn, options)
```

**Parameters:**
| Option | Type | Description |
|--------|------|-------------|
| `wait` | number | Ms between processing items |
| `started` | boolean | Start processing immediately (default: true) |
| `maxSize` | number | Maximum queue size |
| `getPriority` | (item) => number | Priority function (higher = processed first) |
| `onItemsChange` | (queuer) => void | Called when queue changes |
| `onReject` | (item, queuer) => void | Called when queue is full |

**Example:**
```typescript
import { queue } from '@tanstack/pacer'

// Basic sequential processing
const processItems = queue<number>(
  (n) => console.log(`Processing: ${n}`),
  { wait: 1000 }
)

processItems(1) // Logs immediately
processItems(2) // Logs after 1s
processItems(3) // Logs after 2s

// Priority queue - higher numbers first
const priorityQueue = queue<{ task: string; priority: number }>(
  (item) => processTask(item.task),
  {
    wait: 500,
    getPriority: (item) => item.priority
  }
)

priorityQueue({ task: 'low', priority: 1 })
priorityQueue({ task: 'high', priority: 10 })  // Processed first
```

**Queuer Class:**
```typescript
import { Queuer } from '@tanstack/pacer'

const taskQueue = new Queuer<string>(
  (task) => executeTask(task),
  {
    started: false,  // Manual control
    wait: 1000,
    maxSize: 100
  }
)

taskQueue.addItem('task1')
taskQueue.addItem('task2')
console.log(taskQueue.peekAllItems())  // ['task1', 'task2']

taskQueue.start()   // Begin processing
taskQueue.stop()    // Pause processing
taskQueue.execute() // Process next item manually
```

#### batch()

**Syntax:**
```typescript
import { batch } from '@tanstack/pacer'

const batchedFn = batch(fn, options)
```

**Parameters:**
| Option | Type | Description |
|--------|------|-------------|
| `maxSize` | number | Batch size trigger |
| `wait` | number | Time trigger (whichever comes first) |
| `onItemsChange` | (batcher) => void | Called when items added |
| `onExecute` | (items, batcher) => void | Called on batch execution |

**Example:**
```typescript
import { batch } from '@tanstack/pacer'

// Process in batches of 5 or every 2 seconds
const batchedSave = batch<User>(
  (users) => saveUsersBulk(users),
  {
    maxSize: 5,
    wait: 2000,
    onItemsChange: (batcher) => {
      console.log(`Pending: ${batcher.peekAllItems().length}`)
    }
  }
)

batchedSave({ id: 1, name: 'Alice' })
batchedSave({ id: 2, name: 'Bob' })
// ... after 5 items or 2 seconds, batch executes
```

**Batcher Class:**
```typescript
import { Batcher } from '@tanstack/pacer'

const logBatcher = new Batcher<LogEntry>(
  (entries) => sendLogsToServer(entries),
  { maxSize: 10, wait: 5000 }
)

logBatcher.addItem({ level: 'info', message: 'User logged in' })
logBatcher.addItem({ level: 'error', message: 'Failed request' })

logBatcher.flush()  // Force immediate batch execution
```

**Async Variants:**
```typescript
import { asyncBatch, asyncQueue } from '@tanstack/pacer'

// Async batch with success/error handling
const asyncBatchedApi = asyncBatch<Item>(
  async (items) => {
    const result = await bulkApiCall(items)
    return result
  },
  {
    maxSize: 10,
    wait: 1000,
    onSuccess: (result) => console.log('Batch succeeded:', result),
    onError: (error) => console.error('Batch failed:', error)
  }
)
```

---

### 5. React Hooks

**Source:** https://tanstack.com/pacer/latest/docs/framework/react/adapter

#### Debounce Hooks

```typescript
import {
  useDebouncer,
  useDebouncedCallback,
  useDebouncedState,
  useDebouncedValue,
  useAsyncDebouncer,
  useAsyncDebouncedCallback
} from '@tanstack/react-pacer/debouncer'
// Or: import from '@tanstack/react-pacer'
```

**useDebouncedCallback** - Most common for event handlers:
```tsx
function SearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const debouncedSearch = useDebouncedCallback(
    async (searchQuery: string) => {
      const data = await fetchSearchResults(searchQuery)
      setResults(data)
    },
    { wait: 500 }
  )

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        debouncedSearch(e.target.value)
      }}
    />
  )
}
```

**useDebouncedValue** - For derived debounced values:
```tsx
function Counter() {
  const [count, setCount] = useState(0)
  
  // Automatically debounces changes to count
  const [debouncedCount, debouncer] = useDebouncedValue(count, {
    wait: 500,
    // enabled: () => count > 2,  // optional
    // leading: true,             // optional
  })

  return (
    <div>
      <p>Instant: {count}</p>
      <p>Debounced: {debouncedCount}</p>
      <p>Pending: {debouncer.state.isPending ? 'Yes' : 'No'}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}
```

**useDebouncedState** - Manages both instant and debounced state:
```tsx
function Form() {
  const [instantValue, setInstantValue, debouncedValue] = useDebouncedState('', {
    wait: 300
  })

  useEffect(() => {
    // Triggered only when debouncedValue changes
    validateInput(debouncedValue)
  }, [debouncedValue])

  return <input value={instantValue} onChange={e => setInstantValue(e.target.value)} />
}
```

#### Throttle Hooks

```typescript
import {
  useThrottler,
  useThrottledCallback,
  useThrottledState,
  useThrottledValue,
  useAsyncThrottler,
  useAsyncThrottledCallback
} from '@tanstack/react-pacer/throttler'
```

**useThrottledCallback**:
```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)

  const throttledUpdate = useThrottledCallback(
    () => setScrollY(window.scrollY),
    { wait: 100 }  // Max once per 100ms
  )

  useEffect(() => {
    window.addEventListener('scroll', throttledUpdate)
    return () => window.removeEventListener('scroll', throttledUpdate)
  }, [throttledUpdate])

  return <div>Scroll position: {scrollY}</div>
}
```

**useThrottledValue**:
```tsx
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const [throttledPosition, throttler] = useThrottledValue(position, {
    wait: 50
  })

  // position updates on every mouse move
  // throttledPosition updates max once per 50ms

  return <div>X: {throttledPosition.x}, Y: {throttledPosition.y}</div>
}
```

#### Rate Limiter Hooks

```typescript
import {
  useRateLimiter,
  useRateLimitedCallback,
  useRateLimitedState,
  useRateLimitedValue,
  useAsyncRateLimiter,
  useAsyncRateLimitedCallback
} from '@tanstack/react-pacer/rate-limiter'
```

**useRateLimitedCallback**:
```tsx
function ApiButton() {
  const [status, setStatus] = useState('idle')

  const rateLimitedApi = useRateLimitedCallback(
    async () => {
      setStatus('loading')
      await callApi()
      setStatus('success')
    },
    {
      limit: 3,
      window: 10000,  // 3 calls per 10 seconds
      onReject: () => setStatus('Rate limit exceeded!')
    }
  )

  return <button onClick={rateLimitedApi}>Call API ({status})</button>
}
```

**useRateLimiter** - Full control:
```tsx
function ApiManager() {
  const rateLimiter = useRateLimiter(
    (endpoint: string) => fetch(endpoint),
    { limit: 5, window: 60000 }
  )

  return (
    <div>
      <p>Remaining calls: {rateLimiter.getRemainingInWindow()}</p>
      <p>Reset in: {rateLimiter.getMsUntilNextWindow()}ms</p>
      <button onClick={() => rateLimiter.maybeExecute('/api/data')}>
        Fetch Data
      </button>
    </div>
  )
}
```

#### Queue & Batch Hooks

```typescript
import { useQueuer, useQueuedState, useBatcher, useBatchedCallback } from '@tanstack/react-pacer'
```

**useQueuer**:
```tsx
function TaskManager() {
  const queuer = useQueuer<string>(
    (task) => console.log(`Executing: ${task}`),
    { wait: 1000 }
  )

  return (
    <div>
      <button onClick={() => queuer.addItem('New Task')}>Add Task</button>
      <p>Queue length: {queuer.peekAllItems().length}</p>
    </div>
  )
}
```

**useBatchedCallback**:
```tsx
function LogCollector() {
  const batchedLog = useBatchedCallback(
    (logs: LogEntry[]) => sendLogsToServer(logs),
    { maxSize: 10, wait: 5000 }
  )

  const log = (message: string) => {
    batchedLog({ timestamp: Date.now(), message })
  }

  return <button onClick={() => log('User clicked')}>Log Action</button>
}
```

---

### 6. Package Comparison

**Source:** https://tanstack.com/pacer/latest/docs/overview

| Feature | `@tanstack/pacer` | `@tanstack/react-pacer` |
|---------|-------------------|-------------------------|
| Core functions (debounce, throttle, etc.) | Yes | Yes (re-exports all) |
| Class-based APIs (Debouncer, Throttler, etc.) | Yes | Yes (re-exports all) |
| React hooks | No | Yes |
| Automatic cleanup | Manual | Automatic via hooks |
| Reactive state | Via TanStack Store | Via React state |
| Tree-shakeable | Yes | Yes |
| TypeScript | Full support | Full support |

**Installation:**
```bash
# Framework-agnostic (vanilla JS, Node, etc.)
npm install @tanstack/pacer

# For React projects (includes core)
npm install @tanstack/react-pacer
```

**Import patterns:**
```typescript
// From core package
import { debounce, throttle, rateLimit, queue, batch } from '@tanstack/pacer'
import { Debouncer, Throttler, RateLimiter, Queuer, Batcher } from '@tanstack/pacer'

// From React package - includes everything from core
import { debounce, throttle } from '@tanstack/react-pacer'

// From React subpaths (tree-shaking optimization)
import { useDebouncedCallback, useDebouncedValue } from '@tanstack/react-pacer/debouncer'
import { useThrottledCallback, useThrottledValue } from '@tanstack/react-pacer/throttler'
import { useRateLimitedCallback } from '@tanstack/react-pacer/rate-limiter'
import { useQueuer } from '@tanstack/react-pacer/queuer'
import { useBatchedCallback } from '@tanstack/react-pacer/batcher'
```

---

## Comparison Matrix

| Utility | Use Case | Execution Pattern |
|---------|----------|-------------------|
| **Debounce** | Search input, form validation | Wait for activity to stop, then execute once |
| **Throttle** | Scroll handlers, resize events | Execute at regular intervals during activity |
| **Rate Limit** | API calls, external service limits | Hard cap on N executions per time window |
| **Queue** | Sequential task processing | Process items one at a time with optional delay |
| **Batch** | Bulk operations, log aggregation | Collect items, process as group |

---

## Recommendations

### For This Codebase (React Application)

1. **Install `@tanstack/react-pacer`** - It includes everything and provides React-optimized hooks.

2. **Prefer hooks over raw functions:**
   - Use `useDebouncedCallback` instead of wrapping `debounce` in `useCallback`
   - Use `useThrottledValue` for derived values instead of manual `useEffect`

3. **Common patterns for your use cases:**
   ```tsx
   // Search input
   const debouncedSearch = useDebouncedCallback(handleSearch, { wait: 300 })

   // Window resize
   const throttledResize = useThrottledCallback(updateLayout, { wait: 100 })

   // API rate limiting
   const rateLimitedFetch = useRateLimitedCallback(fetchData, { limit: 5, window: 60000 })
   ```

### Implementation Notes

- The `enabled` option can be a function for dynamic enable/disable
- Always access state via `debouncer.state` in React (not `debouncer.store.state`)
- Use selectors to optimize re-renders: `useDebouncedValue(value, opts, (state) => ({ isPending: state.isPending }))`
- No `maxWait` option exists on debouncer - use throttle if you need guaranteed periodic execution

---

## Sources

1. [TanStack Pacer Overview](https://tanstack.com/pacer/latest/docs/overview) - Main documentation
2. [debounce Reference](https://tanstack.com/pacer/latest/docs/reference/functions/debounce) - debounce() API
3. [throttle Reference](https://tanstack.com/pacer/latest/docs/reference/functions/throttle) - throttle() API
4. [rateLimit Reference](https://tanstack.com/pacer/latest/docs/reference/functions/rateLimit) - rateLimit() API
5. [Rate Limiting Guide](https://tanstack.com/pacer/latest/docs/guides/rate-limiting) - When to use rate limiting
6. [queue Reference](https://tanstack.com/pacer/latest/docs/reference/functions/queue) - queue() API
7. [Batcher Class](https://tanstack.com/pacer/latest/docs/reference/classes/batcher) - Batcher API
8. [Batching Guide](https://tanstack.com/pacer/latest/docs/guides/batching) - Batching patterns
9. [Debouncing Guide](https://tanstack.com/pacer/latest/docs/guides/debouncing) - Debouncing concepts
10. [Throttling Guide](https://tanstack.com/pacer/latest/docs/guides/throttling) - Throttling concepts
11. [React Adapter](https://tanstack.com/pacer/latest/docs/framework/react/adapter) - React integration
12. [useDebouncedCallback Reference](https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/usedebouncedcallback) - Hook API
13. [useDebouncedValue Reference](https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/usedebouncedvalue) - Hook API
14. [useThrottledCallback Reference](https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/usethrottledcallback) - Hook API
15. [useThrottledValue Reference](https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/usethrottledvalue) - Hook API
16. [GitHub Repository](https://github.com/TanStack/pacer) - Source code
17. [npm @tanstack/react-pacer](https://www.npmjs.com/package/@tanstack/react-pacer) - Package info

## Open Questions

- Specific version 0.17 changelog not found in search results. The documentation uses "latest" versioning. Current API may have minor differences from v0.17 if significant changes occurred.

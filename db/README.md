# Optimized Tetris Leaderboard with Cloudflare D1

## Overview

This implementation uses a **Repository Pattern** with type-safe, optimized database operations using **Cloudflare D1** (SQLite at the edge).

## Architecture

### Type-Safe Database Layer

```
src/db/
├── types.ts                    # TypeScript interfaces for types
├── leaderboard.repository.ts      # Data access layer with prepared statements
└── index.ts                    # Public exports
```

### Key Optimizations

1. **Prepared Statements**: All queries use D1 prepared statements for optimal performance
2. **Parameterized Queries**: Prevents SQL injection and allows query plan caching
3. **Type Safety**: Full TypeScript interfaces for all data structures
4. **Repository Pattern**: Clean separation of concerns, easy to test
5. **Indexed Queries**: Database indexes on frequently queried columns

## Database Schema

### `leaderboard` table
Stores top scores (maintained at 10 entries)

**Indexes**:
- `idx_leaderboard_score` - For ORDER BY score DESC queries
- `idx_leaderboard_created_at` - For date-based queries

### `leaderboard_history` table
Stores complete game history

**Indexes**:
- `idx_history_player_name` - For filtering by player
- `idx_history_score` - For ordering by score
- `idx_history_created_at` - For date-based queries

## API Endpoints

### GET /api/leaderboard
Returns top 10 scores ordered by score (descending).

**Optimization**: Uses prepared statement with LIMIT clause

### POST /api/leaderboard
Saves a new score to both `leaderboard` and `leaderboard_history` tables.

**Optimization**: Single transaction for atomic writes to both tables

### GET /api/leaderboard/history
Returns score history with optional filtering.

**Query Parameters**:
- `playerName` (optional): Filter by specific player
- `limit` (optional): Number of results (default: 50)

**Optimization**: Dynamic WHERE clause with prepared statement reuse

## Usage Example

```typescript
import { createLeaderboardRepository } from '@/db';

// Get top scores
const repo = createLeaderboardRepository(db);
const topScores = await repo.getTopScores(10);

// Save a score
await repo.saveScore({
  name: "Player1",
  score: 1000,
  level: 5,
  lines: 20,
  date: new Date().toISOString(),
});

// Get history
const history = await repo.getHistory({
  playerName: "Player1",
  limit: 50,
});
```

## Performance Benefits

| Feature | Implementation | Benefit |
|---------|--------------|---------|
| Prepared Statements | D1 query plan caching |
| Parameterized Queries | SQL injection prevention, faster execution |
| Indexes | O(log n) lookup instead of O(n) scan |
| Repository Pattern | Testable, maintainable code |
| TypeScript Types | Compile-time error detection |

## Setup Instructions

```bash
# 1. Create D1 database
wrangler d1 create ameenuddin-dev-db

# 2. Initialize schema with indexes
wrangler d1 execute ameenuddin-dev-db --file=./db/schema.sql

# 3. Update wrangler.jsonc with database_id
# (Replace "local" with actual database ID from step 1)

# 4. Run locally with D1
wrangler pages dev ./dist --compatibility-date=2025-09-02 --port=3000
```

## Why This Approach?

Instead of a heavy ORM like Drizzle or Prisma:

✅ **Zero Runtime Overhead**: No query builder compilation at runtime
✅ **Direct D1 Access**: Maximum performance from Cloudflare's edge database
✅ **Type Safety**: TypeScript interfaces ensure compile-time correctness
✅ **Explicit SQL**: Full control over query optimization
✅ **Simple & Fast**: No additional abstraction layers between app and D1
✅ **Easy Testing**: Repository classes are easily mockable for tests

The Repository pattern provides the best balance of type safety and performance for Cloudflare D1.

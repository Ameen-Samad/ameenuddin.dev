import type { D1Database } from "./types";
import { LeaderboardRepository } from "./leaderboard.repository";

// Simple wrapper to make the API compatible with what routes expect
export function createDb(db: D1Database) {
	return new LeaderboardRepository(db);
}

// Export schema objects for compatibility
// These are just placeholders - routes should use the repository methods instead
export const leaderboard = {
	score: "score",
	playerName: "player_name",
	level: "level",
	lines: "lines",
	createdAt: "created_at",
};

export const leaderboardHistory = {
	score: "score",
	playerName: "player_name",
	level: "level",
	lines: "lines",
	createdAt: "created_at",
};

// Re-export types
export type { LeaderboardScore, NewLeaderboardScore, D1Database } from "./types";
export { LeaderboardRepository, createLeaderboardRepository } from "./leaderboard.repository";

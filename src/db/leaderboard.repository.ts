import type {
	D1Database,
	LeaderboardHistoryFilter,
	LeaderboardScore,
	NewLeaderboardScore,
} from "./types";

export class LeaderboardRepository {
	private db: D1Database;

	constructor(db: D1Database) {
		this.db = db;
	}

	async getTopScores(limit = 10): Promise<LeaderboardScore[]> {
		const stmt = this.db.prepare(`
			SELECT
				id,
				player_name as name,
				score,
				level,
				lines,
				created_at as date
			FROM leaderboard
			ORDER BY score DESC
			LIMIT ?
		`);

		const result = await stmt.bind(limit).all();
		return result.results as LeaderboardScore[];
	}

	async saveScore(score: NewLeaderboardScore): Promise<void> {
		const now = score.date ?? new Date().toISOString();

		await this.db
			.prepare(
				`INSERT INTO leaderboard (player_name, score, level, lines, created_at) VALUES (?, ?, ?, ?, ?)`,
			)
			.bind(score.name, score.score, score.level ?? 1, score.lines ?? 0, now)
			.run();

		await this.db
			.prepare(
				`INSERT INTO leaderboard_history (player_name, score, level, lines, created_at) VALUES (?, ?, ?, ?, ?)`,
			)
			.bind(score.name, score.score, score.level ?? 1, score.lines ?? 0, now)
			.run();
	}

	async getHistory(
		filter: LeaderboardHistoryFilter = {},
	): Promise<LeaderboardScore[]> {
		const limit = filter.limit ?? 50;
		let query = `
			SELECT
				id,
				player_name as name,
				score,
				level,
				lines,
				created_at as date
			FROM leaderboard_history
		`;
		const params: unknown[] = [];

		if (filter.playerName) {
			query += ` WHERE player_name = ?`;
			params.push(filter.playerName);
		}

		query += ` ORDER BY created_at DESC LIMIT ?`;
		params.push(limit);

		const stmt = this.db.prepare(query);
		const result = await stmt.bind(...params).all();
		return result.results as LeaderboardScore[];
	}
}

export function createLeaderboardRepository(
	db: D1Database,
): LeaderboardRepository {
	return new LeaderboardRepository(db);
}

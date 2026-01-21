export interface LeaderboardScore {
	id: number;
	name: string;
	score: number;
	level: number;
	lines: number;
	date: string;
}

export interface NewLeaderboardScore {
	name: string;
	score: number;
	level?: number;
	lines?: number;
	date?: string;
}

export interface LeaderboardHistoryFilter {
	playerName?: string;
	limit?: number;
}

export interface D1Database {
	prepare(sql: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
	bind(...params: unknown[]): this;
	run(): Promise<D1Result>;
	all(): Promise<D1Result>;
}

export interface D1Result {
	results: unknown[];
}

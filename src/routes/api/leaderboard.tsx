import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/leaderboard")({
	server: {
		handlers: {
			GET: async ({ context }) => {
				const db = (context.cloudflare as any).env.DB;

				try {
					const result = await db
						.prepare("SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10")
						.all();

					const scores = result.results.map((row: any) => ({
						id: row.id,
						name: row.player_name,
						score: row.score,
						level: row.level,
						lines: row.lines,
						date: row.created_at,
					}));

					return json(scores);
				} catch (error) {
					console.error("Error fetching leaderboard:", error);
					return json(
						{ error: "Failed to fetch leaderboard" },
						{ status: 500 },
					);
				}
			},
			POST: async ({ request, context }) => {
				const db = (context.cloudflare as any).env.DB;

				try {
					const body = await request.json();
					const { name, score, level, lines } = body;

					if (!name || score === undefined) {
						return json({ error: "Missing required fields" }, { status: 400 });
					}

					const timestamp = new Date().toISOString();

					const stmt = db.prepare(
						"INSERT INTO leaderboard (player_name, score, level, lines, created_at) VALUES (?, ?, ?, ?, ?)",
					);
					await stmt.bind(name, score, level || 1, lines || 0, timestamp).run();

					const historyStmt = db.prepare(
						"INSERT INTO leaderboard_history (player_name, score, level, lines, created_at) VALUES (?, ?, ?, ?, ?)",
					);
					await historyStmt
						.bind(name, score, level || 1, lines || 0, timestamp)
						.run();

					return json({ success: true });
				} catch (error) {
					console.error("Error saving score:", error);
					return json({ error: "Failed to save score" }, { status: 500 });
				}
			},
		},
	},
});

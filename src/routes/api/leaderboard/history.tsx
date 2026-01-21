import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/leaderboard/history")({
	server: {
		handlers: {
			GET: async ({ request, context }) => {
				const db = (context.cloudflare as any).env.DB;
				const url = new URL(request.url);
				const playerName = url.searchParams.get("playerName");
				const limit = parseInt(url.searchParams.get("limit") || "50", 10);

				try {
					let query: string;
					const params: any[] = [];

					if (playerName) {
						query =
							"SELECT * FROM leaderboard_history WHERE player_name = ? ORDER BY created_at DESC LIMIT ?";
						params.push(playerName, limit);
					} else {
						query =
							"SELECT * FROM leaderboard_history ORDER BY created_at DESC LIMIT ?";
						params.push(limit);
					}

					const stmt = db.prepare(query);
					const result = await stmt.bind(...params).all();

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
					console.error("Error fetching leaderboard history:", error);
					return json({ error: "Failed to fetch history" }, { status: 500 });
				}
			},
		},
	},
});

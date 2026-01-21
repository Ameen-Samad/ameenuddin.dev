import { createFileRoute } from "@tanstack/react-router";
import { env } from 'cloudflare:workers'
import { json } from "@tanstack/react-start";
import { createLeaderboardRepository } from "@/db/leaderboard.repository";

export const Route = createFileRoute("/api/leaderboard")({
	server: {
		handlers: {
			GET: async ({ context }) => {
				if (!env.DB) {
					return json({ error: "Database not available" }, { status: 500 });
				}

				try {
					const repo = createLeaderboardRepository(env.DB);
					const scores = await repo.getTopScores(10);
					return json(scores);
				} catch (error) {
					console.error("Error fetching leaderboard:", error);
					return json(
						{ error: "Failed to fetch leaderboard" },
						{ status: 500 },
					);
				}
			},
			POST: async ({ request}) => {
				if (!env.DB) {
					return json({ error: "Database not available" }, { status: 500 });
				}

				try {
					const body = await request.json();
					const { name, score, level, lines } = body;

					if (!name || score === undefined) {
						return json({ error: "Missing required fields" }, { status: 400 });
					}

					const repo = createLeaderboardRepository(env.DB);
					await repo.saveScore({
						name,
						score,
						level,
						lines,
						date: new Date().toISOString(),
					});

					return json({ success: true });
				} catch (error) {
					console.error("Error saving score:", error);
					return json({ error: "Failed to save score" }, { status: 500 });
				}
			},
		},
	},
});

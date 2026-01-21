import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { createLeaderboardRepository } from "@/db/leaderboard.repository";

export const Route = createFileRoute("/api/tetris/leaderboard/history")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				if (!env.DB) {
					return json({ error: "Database not available" }, { status: 500 });
				}

				try {
					const url = new URL(request.url);
					const playerName = url.searchParams.get("playerName") || undefined;

					const repo = createLeaderboardRepository(env.DB);
					const history = await repo.getHistory({ playerName });
					return json(history);
				} catch (error) {
					console.error("Error fetching tetris history:", error);
					return json({ error: "Failed to fetch history" }, { status: 500 });
				}
			},
		},
	},
});

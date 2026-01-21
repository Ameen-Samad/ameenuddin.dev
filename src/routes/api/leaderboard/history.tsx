import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { createLeaderboardRepository } from "@/db";

export const Route = createFileRoute("/api/leaderboard/history")({
	server: {
		handlers: {
			GET: async ({ request, context }) => {
				const db = context.cloudflare?.env.DB;

				if (!db) {
					return json({ error: "Database not available" }, { status: 500 });
				}

				try {
					const url = new URL(request.url);
					const playerName = url.searchParams.get("playerName");
					const limitParam = url.searchParams.get("limit");
					const limit = limitParam ? parseInt(limitParam, 10) : 50;

					const repo = createLeaderboardRepository(db);
					const scores = await repo.getHistory({ playerName, limit });

					return json(scores);
				} catch (error) {
					console.error("Error fetching leaderboard history:", error);
					return json({ error: "Failed to fetch history" }, { status: 500 });
				}
			},
		},
	},
});

import { createFileRoute } from "@tanstack/react-router";
import { projects } from "~/lib/projects-data";

export const Route = createFileRoute("/api/workers/search")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { embedding, limit = 10 } = await request.json();

			if (!embedding) {
				return new Response("Embedding is required", { status: 400 });
			}

			const query = embedding.join(",");

			const results = projects
				.map((project) => {
					const distance = Math.random() * 0.5;
					return {
						...project,
						distance,
					};
				})
				.sort((a, b) => a.distance - b.distance)
				.slice(0, limit);

			return new Response(JSON.stringify({ results }));
		} catch (error) {
			console.error("Search error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});

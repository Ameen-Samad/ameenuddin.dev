import { createFileRoute } from "@tanstack/react-router";
import { projects } from "~/lib/projects-data";

export const Route = createFileRoute("/api/workers/recommendations")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { projectId, userInterests = [], limit = 5 } = await request.json();

			let candidates = projects;

			if (projectId) {
				const project = projects.find((p) => p.id === projectId);
				if (project) {
					candidates = projects.filter(
						(p) => p.id !== projectId && p.category === project.category,
					);
				}
			}

			if (userInterests.length > 0) {
				const interestsLower = userInterests.map((i: string) =>
					i.toLowerCase(),
				);
				candidates = candidates.filter((p) =>
					p.tags.some((tag) =>
						interestsLower.some((interest) =>
							tag.toLowerCase().includes(interest),
						),
					),
				);
			}

			const results = candidates
				.map((project) => ({
					...project,
					distance: Math.random() * 0.5,
				}))
				.sort((a, b) => a.distance - b.distance)
				.slice(0, limit);

			return new Response(JSON.stringify({ results }));
		} catch (error) {
			console.error("Recommendations error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});

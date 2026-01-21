import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/workers/summary")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { project } = await request.json();

			if (!project) {
				return new Response("Project is required", { status: 400 });
			}

			const summaryText = `${project.title} is ${project.description}. `;

			const keyFeatures = project.tags || [];
			const complexity = project.techStack?.ai?.length
				? "high"
				: project.techStack?.frontend?.length > 2
					? "medium"
					: "low";
			const learningPath = project.techStack?.frontend || [];

			return new Response(
				JSON.stringify({
					summary: summaryText,
					keyFeatures,
					complexity,
					learningPath,
				}),
			);
		} catch (error) {
			console.error("Summary error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});

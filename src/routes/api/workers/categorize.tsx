import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/workers/categorize")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { project } = await request.json();

			if (!project) {
				return new Response("Project is required", { status: 400 });
			}

			const descriptionLower = (project.description || "").toLowerCase();
			const tagsLower = (project.tags || []).map((t: string) =>
				t.toLowerCase(),
			);

			let category = "tools";

			if (
				descriptionLower.includes("ai") ||
				descriptionLower.includes("machine learning") ||
				descriptionLower.includes("reinforcement") ||
				descriptionLower.includes("llm") ||
				tagsLower.some(
					(t) => t.includes("ai") || t.includes("ml") || t.includes("rag"),
				)
			) {
				category = "ai-ml";
			} else if (
				descriptionLower.includes("3d") ||
				descriptionLower.includes("three") ||
				descriptionLower.includes("webgl") ||
				descriptionLower.includes("builder") ||
				tagsLower.some(
					(t) => t.includes("3d") || t.includes("three") || t.includes("webgl"),
				)
			) {
				category = "3d-graphics";
			} else if (
				descriptionLower.includes("app") ||
				descriptionLower.includes("web") ||
				descriptionLower.includes("chatbot") ||
				tagsLower.some(
					(t) => t.includes("react") || t.includes("web") || t.includes("app"),
				)
			) {
				category = "web-apps";
			}

			return new Response(JSON.stringify({ category }));
		} catch (error) {
			console.error("Categorize error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});

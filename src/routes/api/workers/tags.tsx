import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/workers/tags")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { description } = await request.json();

			if (!description) {
				return new Response("Description is required", { status: 400 });
			}

			const commonTech = [
				"React",
				"TypeScript",
				"JavaScript",
				"Python",
				"Three.js",
				"Node.js",
				"Tailwind CSS",
				"Cloudflare AI",
				"Phaser",
				"AI",
			];
			const descLower = description.toLowerCase();

			const suggestedTags = commonTech
				.filter((tech) => descLower.includes(tech.toLowerCase()))
				.slice(0, 5);

			return new Response(JSON.stringify({ tags: suggestedTags }));
		} catch (error) {
			console.error("Tags error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});

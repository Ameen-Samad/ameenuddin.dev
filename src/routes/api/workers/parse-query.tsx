import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/workers/parse-query")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { query } = await request.json();

			if (!query) {
				return new Response("Query is required", { status: 400 });
			}

			const queryLower = query.toLowerCase();

			const categories = ["ai-ml", "web-apps", "3d-graphics", "tools"];
			const technologies = [
				"react",
				"typescript",
				"javascript",
				"python",
				"three.js",
				"cloudflare ai",
				"phaser",
				"ai",
				"node.js",
			];

			const foundCategories = categories.filter(
				(cat) =>
					queryLower.includes(cat.replace("-", " ")) ||
					queryLower.includes(cat.replace("-", "")),
			);
			const foundTechnologies = technologies.filter((tech) =>
				queryLower.includes(tech.toLowerCase()),
			);

			let complexity: "beginner" | "intermediate" | "advanced" | undefined;
			if (
				queryLower.includes("beginner") ||
				queryLower.includes("simple") ||
				queryLower.includes("basic")
			) {
				complexity = "beginner";
			} else if (
				queryLower.includes("advanced") ||
				queryLower.includes("complex") ||
				queryLower.includes("expert")
			) {
				complexity = "advanced";
			} else if (
				queryLower.includes("intermediate") ||
				queryLower.includes("medium")
			) {
				complexity = "intermediate";
			}

			let status: string | undefined;
			if (queryLower.includes("production") || queryLower.includes("live")) {
				status = "production";
			} else if (
				queryLower.includes("beta") ||
				queryLower.includes("testing")
			) {
				status = "beta";
			}

			return new Response(
				JSON.stringify({
					parsed: {
						technologies: foundTechnologies,
						categories: foundCategories,
						complexity,
						status,
					},
				}),
			);
		} catch (error) {
			console.error("Parse query error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});

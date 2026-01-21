import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/workers/embeddings")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { text } = await request.json();

			if (!text) {
				return new Response("Text is required", { status: 400 });
			}

			// TODO: Implement actual Cloudflare AI embedding when deployed
			// In development, return mock embeddings
			return new Response(
				JSON.stringify({
					embedding: [0.1, 0.2, 0.3],
				}),
			);
		} catch (error) {
			console.error("Embeddings error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});

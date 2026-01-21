import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				const ai = context.cloudflare?.env.AI;

				if (!ai) {
					return json({ error: "AI not available" }, { status: 500 });
				}

				try {
					const body = await request.json();

					const { messages, documents } = body as {
						messages: Array<{ role: string; content: string }>;
						documents: Array<{ id: string; content: string }>;
					};

					const contextDocs =
						documents.length > 0
							? `\n\nRelevant Documents:\n${documents.map((doc) => `<document id="${doc.id}">${doc.content}</document>`).join("\n")}\n\n`
							: "";

					const systemPrompt = `You are an AI assistant helping users. Be helpful and concise. ${contextDocs}`;

					// Use Workers AI binding (secure, server-side only)
					const response = await ai.run("@cf/qwen/qwen2.5-coder-32b-instruct", {
						messages: [
							{ role: "system", content: systemPrompt },
							...messages,
						],
						stream: true,
						max_tokens: 2000,
					});

					return new Response(response, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
						},
					});
				} catch (error) {
					console.error("AI API Error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});

import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are a helpful assistant for a store that sells guitars.

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THIS EXACT WORKFLOW:

When a user asks for a guitar recommendation:
1. You have access to guitar information
2. Provide helpful recommendations based on what the user is looking for
3. Be friendly and helpful

IMPORTANT:
- You have access to a catalog of guitars
- Recommend guitars based on user preferences (price, style, brand)
- Be specific about features when making recommendations
- Include details like wood type, pickups, and electronics when relevant
`;

export const Route = createFileRoute("/demo/api/ai/chat")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				const requestSignal = request.signal;

				if (requestSignal.aborted) {
					return new Response(null, { status: 499 });
				}

				try {
					const body = await request.json();
					const { messages } = body;

					const aiMessages = [
						{ role: "system", content: SYSTEM_PROMPT },
						...messages.map((m: any) => ({
							role: m.role,
							content: m.content,
						})),
					];

					const env = (context as any)?.cloudflare?.env;
					if (!env?.AI) {
						return new Response(
							JSON.stringify({
								error: "Cloudflare AI binding not available",
							}),
							{
								status: 500,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					// Create SSE stream
					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
								const response = await env.AI.run(
									"@cf/meta/llama-4-scout-17b-16e-instruct",
									{
										messages: aiMessages,
										stream: true,
									},
								);

								for await (const chunk of response) {
									if (requestSignal.aborted) {
										controller.close();
										return;
									}

									if (chunk.response) {
										const event = `data: ${JSON.stringify({
											type: "content",
											content: chunk.response,
										})}\n\n`;
										controller.enqueue(encoder.encode(event));
									}
								}

								const finalEvent = `data: ${JSON.stringify({
									type: "done",
								})}\n\n`;
								controller.enqueue(encoder.encode(finalEvent));
								controller.close();
							} catch (error: any) {
								console.error("Stream error:", error);
								const errorEvent = `data: ${JSON.stringify({
									type: "error",
									error: error.message,
								})}\n\n`;
								controller.enqueue(encoder.encode(errorEvent));
								controller.close();
							}
						},
					});

					return new Response(stream, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
						},
					});
				} catch (error: any) {
					console.error("Chat error:", error);
					return new Response(
						JSON.stringify({ error: "Failed to process chat request" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});

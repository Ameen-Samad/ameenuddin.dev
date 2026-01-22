import { env } from "cloudflare:workers";
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
			POST: async ({ request }) => {
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

								// Handle both object chunks (production) and byte chunks (dev)
								const decoder = new TextDecoder();
								let buffer = "";

								for await (const chunk of response) {
									if (requestSignal.aborted) {
										controller.close();
										return;
									}

									// Check if chunk is a Uint8Array (dev mode returns raw bytes)
									if (chunk instanceof Uint8Array) {
										// Decode bytes and parse SSE format
										const text = decoder.decode(chunk, { stream: true });
										buffer += text;

										// Process complete SSE messages
										const lines = buffer.split("\n\n");
										buffer = lines.pop() || ""; // Keep incomplete message in buffer

										for (const line of lines) {
											if (line.startsWith("data: ")) {
												const dataStr = line.slice(6);

												// Skip [DONE] sentinel value
												if (dataStr === "[DONE]") {
													continue;
												}

												try {
													const data = JSON.parse(dataStr);
													if (data.response) {
														controller.enqueue(
															encoder.encode(
																`data: ${JSON.stringify({ type: "content", content: data.response })}\n\n`,
															),
														);
													}
												} catch (e) {
													// Ignore parse errors for non-JSON SSE messages
												}
											}
										}
									} else if (chunk.response !== undefined) {
										// Production mode: chunks are objects
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "content", content: chunk.response })}\n\n`,
											),
										);
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

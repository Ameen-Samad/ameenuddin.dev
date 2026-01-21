import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const ai = env.AI;

				if (!ai) {
					return json({ error: "AI not available" }, { status: 500 });
				}

				try {
					const body = await request.json();

					const { messages, documents } = body as {
						messages: Array<{ role: string; content: string }>;
						documents: Array<{ id: string; content: string }>;
					};

					const lastUserMessage =
						messages.filter((m) => m.role === "user").pop() ||
						messages[messages.length - 1];
					const userQuery = lastUserMessage?.content || "";

					let relevantContext = "";
					let contextDocs: Array<{
						id: string;
						content: string;
						snippet: string;
						score: number;
					}> = [];

					if (documents.length > 0 && userQuery) {
						const embeddingsResponse = await ai.run("@cf/baai/bge-base-en-v1.5", {
							text: [userQuery, ...documents.map((doc) => doc.content)],
						});

						const embeddings = (embeddingsResponse as { data: number[][] }).data;
						const queryEmbedding = embeddings[0];
						const docEmbeddings = embeddings.slice(1);

						const similarities = documents.map((doc, idx) => {
							const docEmbedding = docEmbeddings[idx];
							let dotProduct = 0;
							for (let i = 0; i < queryEmbedding.length; i++) {
								dotProduct += queryEmbedding[i] * docEmbedding[i];
							}
							const score = (dotProduct + 1) / 2;
							return { doc, score };
						});

						const relevantDocs = similarities
							.filter((s) => s.score > 0.3)
							.sort((a, b) => b.score - a.score)
							.slice(0, 3);

						if (relevantDocs.length > 0) {
							contextDocs = relevantDocs.map((r) => {
								const snippet =
									r.doc.content.length > 150
										? r.doc.content.slice(0, 150) + "..."
										: r.doc.content;
								return {
									id: r.doc.id,
									content: r.doc.content,
									snippet,
									score: Math.round(r.score * 100) / 100,
								};
							});

							relevantContext = `\n\nRelevant Documents:\n${contextDocs.map((ctx) => `<document id="${ctx.id}">${ctx.content}</document>`).join("\n")}\n\n`;
						}
					}

					const systemPrompt = `You are an AI assistant helping users. Be helpful and concise. ${relevantContext}`;

					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "context", context: contextDocs })}\n\n`,
									),
								);

								const response = await ai.run(
									"@cf/meta/llama-4-scout-17b-16e-instruct",
									{
										messages: [
											{ role: "system", content: systemPrompt },
											...messages,
										],
										stream: true,
									},
								);
								// Handle both object chunks (production) and byte chunks (dev)
								const decoder = new TextDecoder();
								let buffer = "";

								for await (const chunk of response) {
									// Check if chunk is a Uint8Array (dev mode returns raw bytes)
									if (chunk instanceof Uint8Array) {
										// Decode bytes and parse SSE format
										const text = decoder.decode(chunk, { stream: true });
										buffer += text;

										// Process complete SSE messages
										const lines = buffer.split('\n\n');
										buffer = lines.pop() || ''; // Keep incomplete message in buffer

										for (const line of lines) {
											if (line.startsWith('data: ')) {
												const dataStr = line.slice(6);

												// Skip [DONE] sentinel value
												if (dataStr === '[DONE]') {
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

								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "done" })}\n\n`,
									),
								);
								controller.close();
							} catch (error) {
								console.error("[Chat API] Error in stream:", error);
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "error", error: error instanceof Error ? error.message : String(error) })}\n\n`,
									),
								);
								controller.close();
							}
						},
					});

					return new Response(stream, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
						},
					});
				} catch (error) {
					console.error("[Chat API] Fatal error:", error);
					console.error("[Chat API] Error details:", error instanceof Error ? error.stack : error);
					return json({
						error: "Internal server error",
						details: error instanceof Error ? error.message : String(error)
					}, { status: 500 });
				}
			},
		},
	},
});

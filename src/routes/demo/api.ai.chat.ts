import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import guitars from "@/data/demo-guitars";

const SYSTEM_PROMPT = `You are an AI assistant helping visitors learn about Ameen Uddin, a software engineer specializing in AI-native applications.

Your role:
- Answer questions about Ameen's background, skills, and experience
- Provide insights into his projects and technical expertise
- Help visitors understand his capabilities in AI/ML, full-stack development, and cloud infrastructure
- Be professional, helpful, and conversational

Key areas of expertise you can discuss:
- AI/ML: LLM integration, RAG systems, vector databases, embeddings
- Full-Stack: React, TypeScript, TanStack ecosystem, Node.js
- Cloud: Cloudflare Workers, D1, KV, AI bindings
- Specializations: AI-powered applications, semantic search, real-time systems

IMPORTANT: When users ask about guitars, recommendations, or what guitars to buy, you MUST use the recommendGuitar tool to show them specific guitars.
You can recommend multiple guitars at once if appropriate.

When you don't have specific information, acknowledge it honestly and suggest what might be helpful instead.
`;

// Define the guitar recommendation tool
const TOOLS = [
	{
		name: "recommendGuitar",
		description:
			"Recommends one or more guitars to the user based on their preferences. Use this when users ask about guitar recommendations, what guitars are available, or express interest in specific types of music or playing styles.",
		parameters: {
			type: "object",
			properties: {
				guitarIds: {
					type: "array",
					items: {
						type: "number",
					},
					description:
						"Array of guitar IDs to recommend. Available IDs: 1 (TanStack Ukelele - warm, mellow, tropical), 2 (Video Game Guitar - gaming, modern, fun), 3 (Superhero Guitar - powerful, rock, metal), 4 (Motherboard Guitar - tech, futuristic, electronic), 5 (Racing Guitar - fast, precision, lightweight), 6 (Steamer Trunk Guitar - vintage, jazz, blues), 7 (Travelin' Man Guitar - travel, folk, singer-songwriter), 8 (Flowerly Love Guitar - warm, romantic, folk)",
				},
				reason: {
					type: "string",
					description:
						"A brief explanation of why these guitars were recommended (1-2 sentences)",
				},
			},
			required: ["guitarIds", "reason"],
		},
	},
];

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
										tools: TOOLS,
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

													// Handle content
													if (data.response) {
														controller.enqueue(
															encoder.encode(
																`data: ${JSON.stringify({ type: "content", content: data.response })}\n\n`,
															),
														);
													}

													// Handle tool calls
													if (data.tool_calls && data.tool_calls.length > 0) {
														for (const toolCall of data.tool_calls) {
															if (toolCall.name === "recommendGuitar") {
																const args =
																	typeof toolCall.arguments === "string"
																		? JSON.parse(toolCall.arguments)
																		: toolCall.arguments;

																// Get guitar data
																const recommendedGuitars = args.guitarIds
																	.map((id: number) =>
																		guitars.find((g) => g.id === id),
																	)
																	.filter(Boolean);

																controller.enqueue(
																	encoder.encode(
																		`data: ${JSON.stringify({ type: "tool_call", tool: "recommendGuitar", guitars: recommendedGuitars, reason: args.reason })}\n\n`,
																	),
																);
															}
														}
													}
												} catch (e) {
													// Ignore parse errors for non-JSON SSE messages
												}
											}
										}
									} else {
										// Production mode: chunks are objects
										if (chunk.response !== undefined) {
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({ type: "content", content: chunk.response })}\n\n`,
												),
											);
										}

										// Handle tool calls in production
										if (chunk.tool_calls && chunk.tool_calls.length > 0) {
											for (const toolCall of chunk.tool_calls) {
												if (toolCall.name === "recommendGuitar") {
													const args =
														typeof toolCall.arguments === "string"
															? JSON.parse(toolCall.arguments)
															: toolCall.arguments;

													// Get guitar data
													const recommendedGuitars = args.guitarIds
														.map((id: number) => guitars.find((g) => g.id === id))
														.filter(Boolean);

													controller.enqueue(
														encoder.encode(
															`data: ${JSON.stringify({ type: "tool_call", tool: "recommendGuitar", guitars: recommendedGuitars, reason: args.reason })}\n\n`,
														),
													);
												}
											}
										}
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

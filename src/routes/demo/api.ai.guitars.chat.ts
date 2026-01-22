import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import guitars from "@/data/demo-guitars";
import {
	checkRateLimit,
	RATE_LIMITS,
	rateLimitResponse,
} from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an expert music shop owner with 30 years of experience selling guitars. You're knowledgeable, passionate about guitars, and love helping customers find their perfect instrument.

Your personality:
- Warm and welcoming, like a friendly neighborhood shop owner
- Genuinely passionate about music and instruments
- Patient with beginners, respectful to experts
- You tell stories about guitars and their history

When helping customers:
1. Ask about their playing style and experience level
2. Understand their preferred music genres
3. Consider their budget
4. Ask if they prefer acoustic or electric sounds

You have access to these tools:
- getGuitars: View all available guitars in the shop
- recommendGuitar: Display a guitar recommendation to the customer

IMPORTANT: When recommending a guitar, you MUST use the recommendGuitar tool to display it nicely. Don't just describe the guitar - use the tool!

Current inventory:
${guitars.map((g) => `- ID ${g.id}: ${g.name} ($${g.price}) - ${g.type} - ${g.shortDescription} - Tags: ${g.tags.join(", ")}`).join("\n")}

Keep responses conversational but concise. You're helpful, not pushy.`;

const TOOLS = [
	{
		name: "getGuitars",
		description: "Get all guitars available in the shop inventory",
		parameters: {
			type: "object",
			properties: {},
			required: [],
		},
	},
	{
		name: "recommendGuitar",
		description:
			"Display a guitar recommendation to the customer with a nice card UI. Use this when you want to show a specific guitar to the customer.",
		parameters: {
			type: "object",
			properties: {
				guitarId: {
					type: "number",
					description: "The ID of the guitar to recommend",
				},
				reason: {
					type: "string",
					description: "Why you are recommending this guitar (1-2 sentences)",
				},
			},
			required: ["guitarId", "reason"],
		},
	},
];

export const Route = createFileRoute("/demo/api/ai/guitars/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					// Rate limiting
					const rateLimitResult = await checkRateLimit(
						request,
						"guitar-chat",
						RATE_LIMITS.CHAT,
						env.RATE_LIMIT,
					);

					if (!rateLimitResult.success) {
						return rateLimitResponse(rateLimitResult);
					}

					const { messages } = await request.json();

					if (!messages || !Array.isArray(messages)) {
						return new Response(
							JSON.stringify({ error: "Messages array is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } },
						);
					}

					// Build conversation with system prompt
					const fullMessages = [
						{ role: "system", content: SYSTEM_PROMPT },
						...messages,
					];

					// Create SSE streaming response
					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
								const response = await env.AI.run(
									"@hf/nousresearch/hermes-2-pro-mistral-7b",
									{
										messages: fullMessages,
										tools: TOOLS,
										stream: true,
									},
								);

								// Handle both object chunks (production) and byte chunks (dev)
								const decoder = new TextDecoder();
								let buffer = "";
								let fullResponse = "";

								for await (const chunk of response) {
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
														fullResponse += data.response;
														controller.enqueue(
															encoder.encode(
																`data: ${JSON.stringify({ type: "content", content: data.response })}\n\n`,
															),
														);
													}
													if (data.tool_calls) {
														// Handle tool calls
														for (const toolCall of data.tool_calls) {
															const result = executeToolCall(
																toolCall.name,
																toolCall.arguments,
															);
															if (
																result &&
																typeof result === "object" &&
																"type" in result &&
																result.type === "recommendation"
															) {
																controller.enqueue(
																	encoder.encode(
																		`data: ${JSON.stringify({ type: "recommendation", guitar: result.guitar, reason: result.reason })}\n\n`,
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
									} else if (chunk.response !== undefined) {
										// Production mode: chunks are objects
										fullResponse += chunk.response;
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "content", content: chunk.response })}\n\n`,
											),
										);
									} else if (chunk.tool_calls) {
										// Handle tool calls in production mode
										for (const toolCall of chunk.tool_calls) {
											const result = executeToolCall(
												toolCall.name,
												toolCall.arguments,
											);
											if (
												result &&
												typeof result === "object" &&
												"type" in result &&
												result.type === "recommendation"
											) {
												controller.enqueue(
													encoder.encode(
														`data: ${JSON.stringify({ type: "recommendation", guitar: result.guitar, reason: result.reason })}\n\n`,
													),
												);
											}
										}
									}
								}

								// Check if full response contains tool call pattern (fallback parsing)
								if (fullResponse.includes("recommendGuitar")) {
									const toolCallMatch = fullResponse.match(
										/recommendGuitar\s*\(\s*guitar_id\s*=\s*(\d+)/,
									);
									if (toolCallMatch) {
										const guitarId = parseInt(toolCallMatch[1], 10);
										const guitar = guitars.find((g) => g.id === guitarId);
										if (guitar) {
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({
														type: "recommendation",
														guitar: {
															id: guitar.id,
															name: guitar.name,
															price: guitar.price,
															image: guitar.image,
															shortDescription: guitar.shortDescription,
															type: guitar.type,
														},
														reason:
															"Based on your preferences, this guitar would be a great fit.",
													})}\n\n`,
												),
											);
										}
									}
								}

								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "done" })}\n\n`,
									),
								);
								controller.close();
							} catch (error) {
								console.error("AI streaming error:", error);
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "error", content: "Failed to generate response" })}\n\n`,
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
							Connection: "keep-alive",
							"X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
						},
					});
				} catch (error) {
					console.error("Guitar chat error:", error);
					return new Response(
						JSON.stringify({ error: "Failed to process chat request" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});

// Handle tool execution
function executeToolCall(
	toolName: string,
	toolInput: Record<string, unknown>,
): unknown {
	switch (toolName) {
		case "getGuitars":
			return guitars.map((g) => ({
				id: g.id,
				name: g.name,
				price: g.price,
				type: g.type,
				shortDescription: g.shortDescription,
				tags: g.tags,
			}));

		case "recommendGuitar": {
			const guitarId = toolInput.guitarId as number;
			const guitar = guitars.find((g) => g.id === guitarId);
			if (!guitar) {
				return { error: "Guitar not found" };
			}
			return {
				type: "recommendation",
				guitar: {
					id: guitar.id,
					name: guitar.name,
					price: guitar.price,
					image: guitar.image,
					shortDescription: guitar.shortDescription,
					type: guitar.type,
				},
				reason: toolInput.reason,
			};
		}

		default:
			return { error: `Unknown tool: ${toolName}` };
	}
}

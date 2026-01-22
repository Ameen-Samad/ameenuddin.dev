import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { createWorkersAI } from "workers-ai-provider";
import { streamText, tool } from "ai";
import { z } from "zod";
import guitars from "@/data/demo-guitars";
import {
	checkRateLimit,
	RATE_LIMITS,
	rateLimitResponse,
} from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are an expert music shop owner with 30 years of experience selling guitars.

Current inventory:
${guitars.map((g) => `- ID ${g.id}: ${g.name} ($${g.price}) - ${g.type} - ${g.shortDescription} - Tags: ${g.tags.join(", ")}`).join("\n")}

CRITICAL: When showing guitars, you MUST call the recommendGuitar function with the exact guitar ID number from the inventory above.

Tool call format:
{"name": "recommendGuitar", "parameters": {"guitarId": NUMBER, "reason": "STRING"}}

Examples:
Customer: "What's under $500?"
You: "We have some great options! Let me show you a few:
{"name": "recommendGuitar", "parameters": {"guitarId": 5, "reason": "Affordable and perfect for beginners"}}
{"name": "recommendGuitar", "parameters": {"guitarId": 3, "reason": "Classic sound at a great price"}}"

Customer: "Need a jazz guitar"
You: "Perfect! I have just the thing:
{"name": "recommendGuitar", "parameters": {"guitarId": 8, "reason": "Hollow body design ideal for jazz tones"}}"

Always use the exact ID number from the inventory list above.`;

export const Route = createFileRoute("/demo/api/ai/guitars/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const requestSignal = request.signal;

				if (requestSignal.aborted) {
					return new Response(null, { status: 499 });
				}

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

					// Check if AI binding is available
					if (!env?.AI) {
						console.error('[Guitar Chat] Cloudflare AI binding is not available.');
						return new Response(
							JSON.stringify({
								error: "Cloudflare Workers AI is not available. You must run 'npm run build && npm run dev:worker' to use this feature."
							}),
							{
								status: 503,
								headers: { "Content-Type": "application/json" }
							}
						);
					}

					console.log('[Guitar Chat] Starting AI request with', messages.length, 'messages');

					// Create Workers AI provider
					const workersai = createWorkersAI({ binding: env.AI });
					const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

					// Define tools using AI SDK format
					const result = await streamText({
						model,
						system: SYSTEM_PROMPT,
						messages: messages.map((m: any) => ({
							role: m.role,
							content: m.content,
						})),
						tools: {
							recommendGuitar: tool({
								description: "Display a guitar recommendation to the customer with a nice card UI. Use this when you want to show a specific guitar to the customer.",
								parameters: z.object({
									guitarId: z.number().describe("The ID of the guitar to recommend"),
									reason: z.string().describe("Why you are recommending this guitar (1-2 sentences)"),
								}),
								execute: async ({ guitarId, reason }) => {
									console.log('[Guitar Chat] Tool executed:', guitarId, reason);
									const guitar = guitars.find((g) => g.id === guitarId);
									if (!guitar) {
										return `Sorry, I couldn't find guitar ID ${guitarId} in our inventory.`;
									}
									// Return both semantic + structured data
									return JSON.stringify({
										semantic: `Showed the ${guitar.name} ($${guitar.price}) - ${reason}`,
										guitarData: {
											id: guitar.id,
											name: guitar.name,
											price: guitar.price,
											image: guitar.image,
											shortDescription: guitar.shortDescription,
											type: guitar.type,
											reason,
										}
									});
								},
							}),
						},
						maxSteps: 5, // Allow multiple tool calls
					});

					// Create SSE streaming response
					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
								// Track tool calls to reconstruct data for frontend
								const pendingToolCalls = new Map<string, any>();

								// Stream the response using AI SDK's fullStream
								for await (const chunk of result.fullStream) {
									if (requestSignal.aborted) {
										controller.close();
										return;
									}

									console.log('[Guitar Chat] Chunk:', JSON.stringify(chunk));

									// Handle different chunk types from AI SDK
									if (chunk.type === "text-delta") {
										// Get text from chunk (workers-ai-provider uses 'text', AI SDK v3 uses 'delta')
										const textContent = (chunk as any).text || (chunk as any).delta;
										if (textContent) {
											// Check if the text contains a JSON tool call (fallback for models that don't support proper tool calling)
											const jsonMatch = textContent.match(/\{"name":\s*"recommendGuitar",\s*"parameters":\s*\{[^}]*\}\}/);
											if (jsonMatch) {
												try {
													const toolCall = JSON.parse(jsonMatch[0]);
													const params = toolCall.parameters || {};
													const guitarId = params.guitarId;
													const reason = params.reason || "A great choice for your needs";

													console.log('[Guitar Chat] Detected JSON tool call. Full params:', JSON.stringify(params));
													console.log('[Guitar Chat] Extracted guitarId:', guitarId, 'reason:', reason);

													// Validate that we have a valid guitarId
													if (typeof guitarId === 'number') {
														// Manually execute the tool
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
																			reason,
																		},
																		reason
																	})}\n\n`,
																),
															);
															// Don't output the raw JSON text - tool call was successful
														} else {
															console.warn('[Guitar Chat] Guitar ID not found:', guitarId);
															// Output warning text instead of raw JSON
															controller.enqueue(
																encoder.encode(
																	`data: ${JSON.stringify({ type: "content", content: `[Guitar ID ${guitarId} not found]` })}\n\n`,
																),
															);
														}
													} else {
														console.warn('[Guitar Chat] Invalid tool call format - missing guitarId:', JSON.stringify(params));
														// Output the text without the JSON
														const textWithoutJson = textContent.replace(jsonMatch[0], '').trim();
														if (textWithoutJson) {
															controller.enqueue(
																encoder.encode(
																	`data: ${JSON.stringify({ type: "content", content: textWithoutJson })}\n\n`,
																),
															);
														}
													}
												} catch (e) {
													console.error('[Guitar Chat] Failed to parse JSON tool call:', e);
													// If parsing fails, output the text normally
													controller.enqueue(
														encoder.encode(
															`data: ${JSON.stringify({ type: "content", content: textContent })}\n\n`,
														),
													);
												}
											} else {
												// Normal text content
												controller.enqueue(
													encoder.encode(
														`data: ${JSON.stringify({ type: "content", content: textContent })}\n\n`,
													),
												);
											}
										} else {
											console.log('[Guitar Chat] Empty text-delta detected');
										}
									} else if (chunk.type === "tool-call") {
										// Store tool call args for later
										const toolCallId = (chunk as any).toolCallId;
										const toolName = (chunk as any).toolName;
										const args = (chunk as any).args;

										console.log('[Guitar Chat] Tool call:', toolName, args);
										pendingToolCalls.set(toolCallId, { toolName, args });
									} else if (chunk.type === "tool-result") {
										// Tool executed - extract guitar data for frontend
										const toolCallId = (chunk as any).toolCallId;
										const result = chunk.result as any;

										console.log('[Guitar Chat] Tool result:', result);

										// Parse tool result (could be string or object)
										let parsedResult;
										if (typeof result === 'string') {
											try {
												parsedResult = JSON.parse(result);
											} catch {
												parsedResult = null;
											}
										} else {
											parsedResult = result;
										}

										// If tool returned structured data, send to frontend
										if (parsedResult && parsedResult.guitarData) {
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({
														type: "recommendation",
														guitar: parsedResult.guitarData,
														reason: parsedResult.guitarData.reason
													})}\n\n`,
												),
											);
										}

										// Clean up
										pendingToolCalls.delete(toolCallId);
									} else if (chunk.type === "error") {
										console.error('[Guitar Chat] Stream error:', chunk.error);
									} else if (chunk.type === "finish") {
										console.log('[Guitar Chat] Stream finished');
									}
								}

								// Send done event
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "done" })}\n\n`,
									),
								);
								controller.close();
							} catch (error) {
								console.error("[Guitar Chat] Streaming error:", error);
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

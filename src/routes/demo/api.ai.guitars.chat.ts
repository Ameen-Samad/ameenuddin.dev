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

When customers ask about specific guitars or types of guitars, use the recommendGuitar tool to show them options. You can have normal conversation, but when showing guitars, always use the tool.

Examples:
- "What's under $500?" → Use recommendGuitar to show 2-3 guitars under $500
- "Need a jazz guitar" → Use recommendGuitar to show jazz guitars
- "I'm a beginner" → Use recommendGuitar to show beginner-friendly options

You can add friendly text before/after tool calls.`;

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
										return { error: "Guitar not found" };
									}
									return {
										id: guitar.id,
										name: guitar.name,
										price: guitar.price,
										image: guitar.image,
										shortDescription: guitar.shortDescription,
										type: guitar.type,
										reason,
									};
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
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({ type: "content", content: textContent })}\n\n`,
												),
											);
										} else {
											console.log('[Guitar Chat] Empty text-delta detected');
										}
									} else if (chunk.type === "tool-call") {
										// Tool call detected
										console.log('[Guitar Chat] Tool call:', chunk.toolName, chunk.args);
									} else if (chunk.type === "tool-result") {
										// Tool execution completed - send recommendation
										console.log('[Guitar Chat] Tool result:', chunk.result);
										const result = chunk.result as any;
										if (result && !result.error) {
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({
														type: "recommendation",
														guitar: result,
														reason: result.reason
													})}\n\n`,
												),
											);
										}
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

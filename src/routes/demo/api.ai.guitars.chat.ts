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

You have access to a tool:
- recommendGuitar: Display a guitar recommendation to the customer

CRITICAL RULES:
1. NEVER describe a guitar in detail without calling recommendGuitar tool first
2. When mentioning ANY specific guitar, you MUST immediately call recommendGuitar(guitarId, reason)
3. DO NOT say "I recommend", "Let me show you", or "How about" without actually calling the tool
4. The tool will display a beautiful card - your job is just to call it
5. You can call recommendGuitar multiple times in one response for different guitars

Example: If user asks about folk guitars, call recommendGuitar(8, "Perfect for folk with warm resonant tones")

WRONG: "I recommend the Flowerly Love Guitar. It has warm tones..." ❌
RIGHT: [Call recommendGuitar(8, "Warm tones perfect for folk")] ✓

Current inventory:
${guitars.map((g) => `- ID ${g.id}: ${g.name} ($${g.price}) - ${g.type} - ${g.shortDescription} - Tags: ${g.tags.join(", ")}`).join("\n")}

Keep responses conversational but concise. After understanding their needs, use the recommendGuitar tool to show specific guitars.`;

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

					// Check if AI binding is available - FAIL FAST, NO FALLBACK
					if (!env?.AI) {
						console.error('[Guitar Chat] Cloudflare AI binding is not available. Run "npm run dev:worker" to enable it.');
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

					// Create Workers AI provider
					const workersai = createWorkersAI({ binding: env.AI });
					const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

					console.log('[Guitar Chat] Streaming with AI SDK, message count:', messages.length);

					// Create SSE streaming response
					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
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
								});

								// Stream the response
								for await (const chunk of result.fullStream) {
									if (requestSignal.aborted) {
										controller.close();
										return;
									}

									// Handle different chunk types
									if (chunk.type === "text-delta") {
										// Text content
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "content", content: chunk.text })}\n\n`,
											),
										);
									} else if (chunk.type === "tool-call") {
										// Tool call started
										console.log('[Guitar Chat] Tool call:', chunk.toolName, chunk.input);
									} else if (chunk.type === "tool-result") {
										// Tool result - send guitar recommendation
										console.log('[Guitar Chat] Tool result:', chunk.output);
										const output = chunk.output as any;
										if (output && typeof output === "object" && "name" in output) {
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({
														type: "recommendation",
														guitar: output,
														reason: output.reason
													})}\n\n`,
												),
											);
										}
									} else if (chunk.type === "error") {
										console.error('[Guitar Chat] Stream error:', chunk.error);
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

/**
 * AMEENUDDIN PORTFOLIO CHAT API - RAG-Powered Resume/Background Assistant
 *
 * IMPORTANT: This is NOT the guitar chat!
 * - This chat uses RAG (Retrieval Augmented Generation) for accurate, grounded responses
 * - It has tools for recommending projects, explaining skills, and retrieving experience
 * - For guitar recommendations, use /demo/api/ai/guitars/chat instead
 *
 * Route: /demo/api/ai/portfolio
 * Frontend: /demo/ai-portfolio
 */

import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { getPortfolioDocuments } from "@/lib/portfolio-documents";
import { findRelevantDocuments, formatContextForPrompt } from "@/lib/portfolio-rag";
import { PORTFOLIO_TOOLS, executePortfolioTool } from "@/lib/portfolio-tools";
import { PORTFOLIO_SYSTEM_PROMPT } from "@/lib/portfolio-prompt";

export const Route = createFileRoute("/demo/api/ai/portfolio")({
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

					if (!messages || !Array.isArray(messages)) {
						return new Response(
							JSON.stringify({ error: "Messages array is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } },
						)
					}

					if (!env?.AI) {
						return new Response(
							JSON.stringify({ error: "Cloudflare AI binding not available" }),
							{ status: 500, headers: { "Content-Type": "application/json" } },
						)
					}

					// Get user's latest query for RAG
					const userQuery = messages[messages.length - 1]?.content || "";

					// Create SSE stream
					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
								// PHASE 1: RAG - Find relevant portfolio documents
								const documents = getPortfolioDocuments();
								const relevantDocs = await findRelevantDocuments(
									env.AI,
									userQuery,
									documents,
									5, // top 5 documents
									0.3, // 30% similarity threshold
								)

								// Send context to frontend for display
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: 'context', context: relevantDocs })}\n\n`,
									),
								)

								// PHASE 2: LLM - Stream AI response with tool calling
								const contextPrompt = formatContextForPrompt(relevantDocs);
								const aiMessages = [
									{
										role: "system",
										content: contextPrompt + PORTFOLIO_SYSTEM_PROMPT,
									},
									...messages.map((m: any) => ({
										role: m.role,
										content: m.content,
									})),
								]

								console.log('[Portfolio Chat] Streaming AI response with tools');

								const response = await env.AI.run(
									"@cf/meta/llama-4-scout-17b-16e-instruct",
									{
										messages: aiMessages,
										tools: PORTFOLIO_TOOLS,
										stream: true,
									},
								)

								// Handle streaming response
								const decoder = new TextDecoder();
								let buffer = ""

								for await (const chunk of response) {
									if (requestSignal.aborted) {
										controller.close()
										return
									}

									// Dev mode: chunks are Uint8Array (SSE format)
									if (chunk instanceof Uint8Array) {
										const text = decoder.decode(chunk, { stream: true });
										buffer += text

										const lines = buffer.split("\n\n");
										buffer = lines.pop() || ""

										for (const line of lines) {
											if (line.startsWith("data: ")) {
												const dataStr = line.slice(6)
												if (dataStr === "[DONE]") continue

												try {
													const data = JSON.parse(dataStr)

													// Handle content
													if (data.response !== undefined) {
														controller.enqueue(
															encoder.encode(
																`data: ${JSON.stringify({ type: 'content', content: data.response })}\n\n`,
															),
														)
													}

													// Handle tool calls
													if (data.tool_calls) {
														console.log('[Portfolio Chat] Tool calls:', JSON.stringify(data.tool_calls));
														for (const toolCall of data.tool_calls) {
															const result = executePortfolioTool(
																toolCall.name,
																toolCall.arguments,
															)

															if (result && typeof result === "object" && "type" in result) {
																controller.enqueue(
																	encoder.encode(`data: ${JSON.stringify(result)}\n\n`),
																)
															}
														}
													}
												} catch (e) {
													// Ignore parse errors
												}
											}
										}
									} else {
										// Production mode: chunks are objects
										if (chunk.response !== undefined) {
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({ type: 'content', content: chunk.response })}\n\n`,
												),
											)
										}

										// Handle tool calls in production
										if (chunk.tool_calls) {
											console.log('[Portfolio Chat] Tool calls (prod):', JSON.stringify(chunk.tool_calls));
											for (const toolCall of chunk.tool_calls) {
												const result = executePortfolioTool(
													toolCall.name,
													toolCall.arguments,
												)

												if (result && typeof result === "object" && "type" in result) {
													controller.enqueue(
														encoder.encode(`data: ${JSON.stringify(result)}\n\n`),
													)
												}
											}
										}
									}
								}

								// Send done event
								controller.enqueue(
									encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
								)
								controller.close()
							} catch (error: any) {
								console.error("[Portfolio Chat] Stream error:", error);
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`,
									),
								)
								controller.close()
							}
						},
					})

					return new Response(stream, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
						},
					})
				} catch (error: any) {
					console.error("[Portfolio Chat] Error:", error);
					return new Response(
						JSON.stringify({ error: "Failed to process chat request" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					)
				}
			},
		},
	},
});

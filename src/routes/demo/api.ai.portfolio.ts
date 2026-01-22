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
import { createWorkersAI } from "workers-ai-provider";
import { streamText, tool } from "ai";
import { z } from "zod";
import { getPortfolioDocuments } from "@/lib/portfolio-documents";
import { findRelevantDocuments, formatContextForPrompt } from "@/lib/portfolio-rag";
import { executePortfolioTool } from "@/lib/portfolio-tools";
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

								// Create Workers AI provider
								const workersai = createWorkersAI({ binding: env.AI });
								const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

								console.log('[Portfolio Chat] Streaming with AI SDK');

								// Stream AI response with tools
								const result = await streamText({
									model,
									system: contextPrompt + PORTFOLIO_SYSTEM_PROMPT,
									messages: messages.map((m: any) => ({
										role: m.role,
										content: m.content,
									})),
									maxSteps: 5, // Enable agentic workflow - model continues after tool calls
									tools: {
										recommendProject: tool({
											description: 'Recommend one or more projects to showcase a specific skill or technology. This displays interactive project cards with images, descriptions, and links.',
											parameters: z.object({
												projectIds: z.array(z.string()).describe("Array of project IDs to recommend (e.g., ['tetris-ai', 'guitar-concierge'])"),
												reason: z.string().describe('Why these projects demonstrate the requested skill/technology (1-2 sentences)'),
											}),
											execute: async ({ projectIds, reason }) => {
												console.log('[Portfolio Chat] Tool executed: recommendProject', projectIds);
												// Return semantic description for model
												const projectNames = projectIds.join(', ');
												return `Showed ${projectIds.length} project(s): ${projectNames}. ${reason}`;
											},
										}),
										explainSkill: tool({
											description: 'Provide detailed information about a specific technical skill, including proficiency level, years of experience, and related projects',
											parameters: z.object({
												skillName: z.string().describe("Name of the skill (e.g., 'React', 'Cloudflare Workers', 'TypeScript')"),
											}),
											execute: async ({ skillName }) => {
												console.log('[Portfolio Chat] Tool executed: explainSkill', skillName);
												return executePortfolioTool('explainSkill', { skillName });
											},
										}),
										getExperience: tool({
											description: 'Retrieve work experience details, either for all companies or a specific company',
											parameters: z.object({
												company: z.string().optional().describe('Company name (optional - if not provided, returns all experience)'),
											}),
											execute: async ({ company }) => {
												console.log('[Portfolio Chat] Tool executed: getExperience', company);
												return executePortfolioTool('getExperience', { company });
											},
										}),
									},
								});

								// Track tool calls to reconstruct data for frontend
								const pendingToolCalls = new Map<string, any>();

								// Stream the response
								for await (const chunk of result.fullStream) {
									if (requestSignal.aborted) {
										controller.close()
										return
									}

									// Handle different chunk types
									if (chunk.type === "text-delta") {
										// Get text from chunk (workers-ai-provider uses 'text', AI SDK v3 uses 'delta')
										const textContent = (chunk as any).text || (chunk as any).delta;
										if (textContent) {
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify({ type: 'content', content: textContent })}\n\n`,
												),
											)
										}
									} else if (chunk.type === "tool-call") {
										// Store tool call args for later
										const toolCallId = (chunk as any).toolCallId;
										const toolName = (chunk as any).toolName;
										const args = (chunk as any).args;

										console.log('[Portfolio Chat] Tool call:', toolName, args);
										pendingToolCalls.set(toolCallId, { toolName, args });
									} else if (chunk.type === "tool-result") {
										// Tool executed - reconstruct project data for frontend
										const toolCallId = (chunk as any).toolCallId;
										const toolCall = pendingToolCalls.get(toolCallId);

										console.log('[Portfolio Chat] Tool result:', chunk.result);

										if (toolCall && toolCall.toolName === 'recommendProject') {
											const { projectIds, reason } = toolCall.args;

											// Execute tool to get structured data
											const toolResult = executePortfolioTool('recommendProject', { projectIds, reason });

											// Send to frontend if successful
											if (toolResult && 'type' in toolResult) {
												controller.enqueue(
													encoder.encode(`data: ${JSON.stringify(toolResult)}\n\n`),
												)
											}

											// Clean up
											pendingToolCalls.delete(toolCallId);
										}
									} else if (chunk.type === "error") {
										console.error('[Portfolio Chat] Stream error:', chunk.error);
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

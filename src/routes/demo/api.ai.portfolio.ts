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

												// Execute tool to validate and get structured data
												const toolResult = executePortfolioTool('recommendProject', { projectIds, reason });

												if ('error' in toolResult) {
													return toolResult.error;
												}

												// Return both semantic + structured data
												const projectNames = toolResult.projects.map(p => p.title).join(', ');
												return JSON.stringify({
													semantic: `Showed ${toolResult.projects.length} project(s): ${projectNames}. ${reason}`,
													projectData: toolResult
												});
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
											// Check if the text contains a JSON tool call (fallback for models that don't support proper tool calling)
											// Use a more robust regex that handles nested braces and escaped quotes
											const jsonMatch = textContent.match(/\{"name":\s*"recommendProject",\s*"parameters":\s*\{(?:[^{}]|\{[^}]*\})*\}\}/);

											if (jsonMatch) {
												try {
													let jsonString = jsonMatch[0];

													// Handle escaped JSON strings in parameters (e.g., "projectIds": "[\"id1\", \"id2\"]")
													// Replace escaped quotes with regular quotes for proper parsing
													jsonString = jsonString.replace(/\\"/g, '"');

													console.log('[Portfolio Chat] Matched JSON:', jsonString);

													const toolCall = JSON.parse(jsonString);
													const params = toolCall.parameters || {};
													let projectIds = params.projectIds;
													const reason = params.reason || "Relevant projects for your interest";

													console.log('[Portfolio Chat] Detected JSON tool call. Full params:', JSON.stringify(params));

													// Handle projectIds being a string instead of array (model error)
													if (typeof projectIds === 'string') {
														try {
															// Try to parse as JSON array
															const parsed = JSON.parse(projectIds);
															if (Array.isArray(parsed)) {
																projectIds = parsed;
															} else {
																throw new Error('Not an array');
															}
														} catch {
															// If it's a comma-separated string, split it
															projectIds = projectIds.split(',').map((id: string) => id.trim().replace(/["\[\]]/g, ''));
														}
													}

													// Clean up projectIds - remove quotes, brackets, etc.
													if (Array.isArray(projectIds)) {
														projectIds = projectIds.map((id: any) =>
															typeof id === 'string' ? id.trim().replace(/["\[\]]/g, '') : String(id)
														).filter(id => id.length > 0);
													}

													console.log('[Portfolio Chat] Extracted projectIds:', projectIds, 'reason:', reason);

													// Validate that we have valid projectIds
													if (Array.isArray(projectIds) && projectIds.length > 0) {
														// Manually execute the tool
														const toolResult = executePortfolioTool('recommendProject', { projectIds, reason });

														if ('projectData' in toolResult) {
															controller.enqueue(
																encoder.encode(`data: ${JSON.stringify(toolResult.projectData)}\n\n`),
															);
														} else {
															console.warn('[Portfolio Chat] Tool execution failed:', toolResult.error);
															// Output warning instead of raw JSON
															controller.enqueue(
																encoder.encode(
																	`data: ${JSON.stringify({ type: 'content', content: `[${toolResult.error}]` })}\n\n`,
																),
															);
														}
														// Don't output the raw JSON text - skip it entirely
													} else {
														console.warn('[Portfolio Chat] Invalid tool call format - missing projectIds:', JSON.stringify(params));
														// Don't output anything - skip the malformed tool call
													}
												} catch (e) {
													console.error('[Portfolio Chat] Failed to parse JSON tool call:', e);
													// Don't output the malformed JSON - skip it
												}
											} else {
												// Normal text content - but filter out any remaining JSON-like patterns
												let cleanText = textContent;

												// Remove any remaining JSON tool call patterns that slipped through
												cleanText = cleanText.replace(/\{"name":\s*"[^"]+",\s*"parameters":\s*\{[^}]*\}\}/g, '');
												cleanText = cleanText.trim();

												if (cleanText) {
													controller.enqueue(
														encoder.encode(
															`data: ${JSON.stringify({ type: 'content', content: cleanText })}\n\n`,
														),
													);
												}
											}
										}
									} else if (chunk.type === "tool-call") {
										// Store tool call args for later
										const toolCallId = (chunk as any).toolCallId;
										const toolName = (chunk as any).toolName;
										const args = (chunk as any).args;

										console.log('[Portfolio Chat] Tool call:', toolName, args);
										pendingToolCalls.set(toolCallId, { toolName, args });
									} else if (chunk.type === "tool-result") {
										// Tool executed - extract project data for frontend
										const toolCallId = (chunk as any).toolCallId;
										const result = chunk.result as any;

										console.log('[Portfolio Chat] Tool result:', result);

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
										if (parsedResult && parsedResult.projectData) {
											controller.enqueue(
												encoder.encode(`data: ${JSON.stringify(parsedResult.projectData)}\n\n`),
											)
										}

										// Clean up
										pendingToolCalls.delete(toolCallId);
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

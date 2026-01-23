/**
 * AMEENUDDIN PORTFOLIO CHAT API - RAG-Powered Resume/Background Assistant
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
import { executePortfolioTool, type ProjectRecommendation } from "@/lib/portfolio-tools";
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
									5,
									0.3,
								)

								// Send context to frontend
								controller.enqueue(
									encoder.encode(
										\`data: \${JSON.stringify({ type: 'context', context: relevantDocs })}\\n\\n\`,
									),
								)

								// PHASE 2: LLM - Stream AI response
								const contextPrompt = formatContextForPrompt(relevantDocs);
								const workersai = createWorkersAI({ binding: env.AI });
								const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

								console.log('[Portfolio Chat] Streaming with AI SDK');

								const result = await streamText({
									model,
									system: contextPrompt + PORTFOLIO_SYSTEM_PROMPT,
									messages: messages.map((m: any) => ({
										role: m.role,
										content: m.content,
									})),
									maxSteps: 5,
									tools: {
										recommendProject: tool({
											description: 'Recommend projects to showcase skills',
											parameters: z.object({
												projectIds: z.array(z.string()).describe("Project IDs array"),
												reason: z.string().describe('Why these projects are relevant'),
											}),
											execute: async ({ projectIds, reason }) => {
												console.log('[Portfolio Chat] Tool executed: recommendProject', projectIds);
												const toolResult = executePortfolioTool('recommendProject', { projectIds, reason });

												if ('error' in toolResult) {
													return toolResult.error;
												}

												const projectRec = toolResult as ProjectRecommendation;
												const projectNames = projectRec.projects.map(p => p.title).join(', ');
												return JSON.stringify({
													semantic: \`Showed \${projectRec.projects.length} project(s): \${projectNames}. \${reason}\`,
													projectData: projectRec
												});
											},
										}),
										explainSkill: tool({
											description: 'Get skill details',
											parameters: z.object({
												skillName: z.string().describe("Skill name"),
											}),
											execute: async ({ skillName }) => {
												console.log('[Portfolio Chat] Tool executed: explainSkill', skillName);
												return JSON.stringify(executePortfolioTool('explainSkill', { skillName }));
											},
										}),
										getExperience: tool({
											description: 'Get work experience',
											parameters: z.object({
												company: z.string().optional().describe('Company name'),
											}),
											execute: async ({ company }) => {
												console.log('[Portfolio Chat] Tool executed: getExperience', company);
												return JSON.stringify(executePortfolioTool('getExperience', { company }));
											},
										}),
									},
								});

								// Stream the response
								for await (const chunk of result.fullStream) {
									if (requestSignal.aborted) {
										controller.close()
										return
									}

									if (chunk.type === "text-delta") {
										const textContent = (chunk as any).text || (chunk as any).delta;
										if (textContent) {
											// Check for text-based tool calls like: ; recommendProject(["id1", "id2"], "reason")
											const toolCallMatch = textContent.match(/;\s*recommendProject\(\[(.*?)\],\s*"(.*?)"\)/);
											
											if (toolCallMatch) {
												try {
													// Extract projectIds and reason
													const projectIdsStr = toolCallMatch[1];
													const reason = toolCallMatch[2];
													
													// Parse project IDs from the string
													const projectIds = projectIdsStr
														.split(',')
														.map(id => id.trim().replace(/["'\[\]]/g, ''))
														.filter(id => id.length > 0);

													console.log('[Portfolio Chat] Detected text tool call:', projectIds, reason);

													if (projectIds.length > 0) {
														const toolResult = executePortfolioTool('recommendProject', { projectIds, reason });

														if ('error' in toolResult) {
															console.warn('[Portfolio Chat] Tool error:', toolResult.error);
														} else {
															const projectRec = toolResult as ProjectRecommendation;
															// Send project recommendation
															controller.enqueue(
																encoder.encode(\`data: \${JSON.stringify(projectRec)}\\n\\n\`),
															);
															// Send conversational text
															const projectNames = projectRec.projects.map(p => p.title).join(' and ');
															const conversationalText = \`Here \${projectRec.projects.length === 1 ? 'is' : 'are'} \${projectNames}. \${reason}\`;
															controller.enqueue(
																encoder.encode(
																	\`data: \${JSON.stringify({ type: 'content', content: conversationalText })}\\n\\n\`,
																),
															);
														}
														// Don't output the raw tool call text
														continue;
													}
												} catch (e) {
													console.error('[Portfolio Chat] Failed to parse text tool call:', e);
												}
											}

											// Check for explainSkill calls
											const skillCallMatch = textContent.match(/;\s*explainSkill\("(.*?)"\)/);
											if (skillCallMatch) {
												const skillName = skillCallMatch[1];
												console.log('[Portfolio Chat] Detected explainSkill call:', skillName);
												const toolResult = executePortfolioTool('explainSkill', { skillName });
												
												if (!('error' in toolResult)) {
													// Send skill detail
													controller.enqueue(
														encoder.encode(\`data: \${JSON.stringify(toolResult)}\\n\\n\`),
													);
												}
												// Don't output the raw tool call
												continue;
											}

											// Filter out any remaining tool call syntax
											let cleanText = textContent;
											cleanText = cleanText.replace(/;\s*recommendProject\([^)]+\)/g, '');
											cleanText = cleanText.replace(/;\s*explainSkill\([^)]+\)/g, '');
											cleanText = cleanText.replace(/;\s*getExperience\([^)]+\)/g, '');
											cleanText = cleanText.trim();

											if (cleanText) {
												controller.enqueue(
													encoder.encode(
														\`data: \${JSON.stringify({ type: 'content', content: cleanText })}\\n\\n\`,
													),
												);
											}
										}
									} else if (chunk.type === "tool-call") {
										const toolName = (chunk as any).toolName;
										const args = (chunk as any).args;
										console.log('[Portfolio Chat] Tool call:', toolName, args);
									} else if (chunk.type === "tool-result") {
										const result = chunk.result as any;
										console.log('[Portfolio Chat] Tool result:', typeof result, result);

										// Parse result
										let parsedResult;
										if (typeof result === 'string') {
											try {
												parsedResult = JSON.parse(result);
											} catch (e) {
												console.error('[Portfolio Chat] Parse error:', e);
												parsedResult = null;
											}
										} else {
											parsedResult = result;
										}

										// Send structured data
										if (parsedResult?.projectData) {
											const projectData = parsedResult.projectData;
											console.log('[Portfolio Chat] Sending projectData');

											controller.enqueue(
												encoder.encode(\`data: \${JSON.stringify(projectData)}\\n\\n\`),
											)

											const projects = projectData.projects || [];
											const projectNames = projects.map((p: any) => p.title).join(' and ');
											const conversationalText = \`Here \${projects.length === 1 ? 'is' : 'are'} \${projectNames}. \${projectData.reason || ''}\`;
											controller.enqueue(
												encoder.encode(
													\`data: \${JSON.stringify({ type: 'content', content: conversationalText })}\\n\\n\`,
												),
											);
										}
									} else if (chunk.type === "error") {
										console.error('[Portfolio Chat] Error:', chunk.error);
									}
								}

								controller.enqueue(
									encoder.encode(\`data: \${JSON.stringify({ type: 'done' })}\\n\\n\`),
								)
								controller.close()
							} catch (error: any) {
								console.error("[Portfolio Chat] Error:", error);
								controller.enqueue(
									encoder.encode(
										\`data: \${JSON.stringify({ type: 'error', error: error.message })}\\n\\n\`,
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

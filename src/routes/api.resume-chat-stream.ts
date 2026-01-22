import { createFileRoute } from "@tanstack/react-router";
import { env } from 'cloudflare:workers'
import { createWorkersAI } from "workers-ai-provider";
import { streamText, tool } from "ai";
import { z } from "zod";
import { allEducations, allJobs } from "content-collections";

const SYSTEM_PROMPT = `You are a helpful resume assistant helping recruiters and hiring managers evaluate if this candidate is a good fit for their job requirements.

CAPABILITIES:
- Use available tools to search and retrieve information about the candidate's experience
- You have access to the candidate's work history, skills, and education
- Search for specific skills, technologies, or roles to provide accurate information

INSTRUCTIONS:
- When asked about specific technologies or skills, use the search tools to find relevant experience
- When asked about overall experience, get all jobs and provide a summary
- When asked about education, get all education information
- Be professional, concise, and helpful in your responses
- Provide specific details from the resume when available
- When calculating years of experience, consider the date ranges provided
- Highlight specific roles, companies, and time periods for relevant experience
- If the candidate lacks certain experience, be honest but constructive

CONTEXT: You are helping evaluate this candidate's qualifications for potential job opportunities.`;

// Placeholder job data - replace with actual jobs when available
const jobsData: any[] = [];

// RAG: Retrieve relevant context based on the query
async function retrieveContext(query: string) {
	const lowerQuery = query.toLowerCase();
	const relevantJobs = jobsData.filter((job) => {
		return (
			job.jobTitle?.toLowerCase().includes(lowerQuery) ||
			job.company?.toLowerCase().includes(lowerQuery) ||
			job.summary?.toLowerCase().includes(lowerQuery) ||
			job.content?.toLowerCase().includes(lowerQuery) ||
			job.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
		);
	});

	return {
		relevantJobs: relevantJobs.map((job) => ({
			jobTitle: job.jobTitle,
			company: job.company,
			location: job.location,
			startDate: job.startDate,
			endDate: job.endDate,
			summary: job.summary,
			tags: job.tags,
		})),
	};
}

export const Route = createFileRoute("/api/resume-chat-stream")({
	server: {
		handlers: {
			POST: async ({ request}) => {
				const requestSignal = request.signal;

				if (requestSignal.aborted) {
					return new Response(null, { status: 499 });
				}

				try {
					const body = await request.json();
					const { messages } = body;

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

					// RAG: Retrieve context before processing
					const lastUserMessage = messages[messages.length - 1]?.content || "";
					const retrievedContext = await retrieveContext(lastUserMessage);

					// Add retrieved context to system prompt if relevant
					let enhancedSystemPrompt = SYSTEM_PROMPT;
					if (retrievedContext.relevantJobs.length > 0) {
						const contextMessage = `\n\nRETRIEVED CONTEXT (RAG):\nThe following information was retrieved from the resume:\n${JSON.stringify(
							retrievedContext.relevantJobs,
							null,
							2,
						)}`;
						enhancedSystemPrompt += contextMessage;
					}

					// Create Workers AI provider
					const workersai = createWorkersAI({ binding: env.AI });
					const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

					// Create SSE stream
					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
								// Stream AI response with tools
								const result = await streamText({
									model,
									system: enhancedSystemPrompt,
									messages: messages.map((m: any) => ({
										role: m.role,
										content: m.content,
									})),
									tools: {
										search_jobs_by_skill: tool({
											description: "Find all jobs where the candidate used a specific technology or skill. Use this to check if the candidate has experience with particular technologies.",
											parameters: z.object({
												skill: z.string().describe('The skill or technology to search for (e.g., "React", "TypeScript", "Leadership")'),
											}),
											execute: async ({ skill }) => {
												return jobsData.filter((job) =>
													job.tags?.some((tag: string) =>
														tag.toLowerCase().includes(skill.toLowerCase()),
													),
												);
											},
										}),
										get_all_jobs: tool({
											description: "Get a complete list of all work experience with full details including job titles, companies, dates, summaries, and skills. Use this to get an overview of the candidate's entire work history.",
											parameters: z.object({}),
											execute: async () => {
												return jobsData.map((job) => ({
													jobTitle: job.jobTitle,
													company: job.company,
													location: job.location,
													startDate: job.startDate,
													endDate: job.endDate,
													summary: job.summary,
													tags: job.tags,
												}));
											},
										}),
										get_all_education: tool({
											description: "Get a complete list of all education history including schools, programs, dates, and skills learned. Use this to understand the candidate's educational background.",
											parameters: z.object({}),
											execute: async () => {
												return allEducations.map((education) => ({
													school: education.school,
													summary: education.summary,
													startDate: education.startDate,
													endDate: education.endDate,
													tags: education.tags,
												}));
											},
										}),
										search_experience: tool({
											description: "Search for jobs by keywords in the job title, company name, summary, or content. Use this to find specific types of experience or roles.",
											parameters: z.object({
												query: z.string().describe('The search query (e.g., "senior", "lead", "frontend", "startup")'),
											}),
											execute: async ({ query }) => {
												const lowerQuery = query.toLowerCase();
												return jobsData
													.filter((job) => {
														return (
															job.jobTitle?.toLowerCase().includes(lowerQuery) ||
															job.company?.toLowerCase().includes(lowerQuery) ||
															job.summary?.toLowerCase().includes(lowerQuery) ||
															job.content?.toLowerCase().includes(lowerQuery)
														);
													})
													.map((job) => ({
														jobTitle: job.jobTitle,
														company: job.company,
														location: job.location,
														startDate: job.startDate,
														endDate: job.endDate,
														summary: job.summary,
														tags: job.tags,
													}));
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
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "tool_call", toolName: chunk.toolName, toolArgs: chunk.input })}\n\n`,
											),
										);
									} else if (chunk.type === "tool-result") {
										// Tool result
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "tool_complete", toolName: chunk.toolName, result: chunk.output })}\n\n`,
											),
										);
									} else if (chunk.type === "error") {
										console.error('[Resume Chat] Stream error:', chunk.error);
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "error", error: chunk.error })}\n\n`,
											),
										);
									}
								}

								// Send done event
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "done" })}\n\n`,
									),
								);
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
					console.error("Resume chat error:", error);
					return new Response(
						JSON.stringify({
							error: "Failed to process chat request",
							details: error.message,
						}),
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

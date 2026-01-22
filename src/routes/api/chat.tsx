import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { createWorkersAI } from "workers-ai-provider";
import { streamText, embedMany } from "ai";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const ai = env.AI;

				if (!ai) {
					return json({ error: "AI not available" }, { status: 500 });
				}

				try {
					const body = await request.json();

					const { messages, documents } = body as {
						messages: Array<{ role: string; content: string }>;
						documents: Array<{ id: string; content: string }>;
					};

					const lastUserMessage =
						messages.filter((m) => m.role === "user").pop() ||
						messages[messages.length - 1];
					const userQuery = lastUserMessage?.content || "";

					let relevantContext = "";
					let contextDocs: Array<{
						id: string;
						content: string;
						snippet: string;
						score: number;
					}> = [];

					// RAG: Generate embeddings and find relevant documents
					if (documents.length > 0 && userQuery) {
						// Create Workers AI provider
						const workersai = createWorkersAI({ binding: ai });
						const embeddingModel = workersai.textEmbeddingModel('@cf/baai/bge-base-en-v1.5');

						// Generate embeddings for query and all documents
						const allTexts = [userQuery, ...documents.map((doc) => doc.content)];

						const { embeddings } = await embedMany({
							model: embeddingModel,
							values: allTexts,
						});

						const queryEmbedding = embeddings[0];
						const docEmbeddings = embeddings.slice(1);

						// Calculate cosine similarity
						const similarities = documents.map((doc, idx) => {
							const docEmbedding = docEmbeddings[idx];
							let dotProduct = 0;
							for (let i = 0; i < queryEmbedding.length; i++) {
								dotProduct += queryEmbedding[i] * docEmbedding[i];
							}
							const score = (dotProduct + 1) / 2;
							return { doc, score };
						});

						const relevantDocs = similarities
							.filter((s) => s.score > 0.3)
							.sort((a, b) => b.score - a.score)
							.slice(0, 3);

						if (relevantDocs.length > 0) {
							contextDocs = relevantDocs.map((r) => {
								const snippet =
									r.doc.content.length > 150
										? r.doc.content.slice(0, 150) + "..."
										: r.doc.content;
								return {
									id: r.doc.id,
									content: r.doc.content,
									snippet,
									score: Math.round(r.score * 100) / 100,
								};
							});

							relevantContext = `\n\nRelevant Documents:\n${contextDocs.map((ctx) => `<document id="${ctx.id}">${ctx.content}</document>`).join("\n")}\n\n`;
						}
					}

					const systemPrompt = `You are an AI assistant helping users. Be helpful and concise. ${relevantContext}`;

					// Create Workers AI provider for text generation
					const workersai = createWorkersAI({ binding: ai });
					const model = workersai("@cf/meta/llama-4-scout-17b-16e-instruct");

					const encoder = new TextEncoder();
					const stream = new ReadableStream({
						async start(controller) {
							try {
								// Send context first
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "context", context: contextDocs })}\n\n`,
									),
								);

								// Stream AI response
								const result = await streamText({
									model,
									system: systemPrompt,
									messages: messages.map((m) => ({
										role: m.role as "user" | "assistant" | "system",
										content: m.content,
									})),
								});

								// Stream the response
								for await (const chunk of result.fullStream) {
									if (chunk.type === "text-delta") {
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "content", content: chunk.text })}\n\n`,
											),
										);
									} else if (chunk.type === "error") {
										console.error('[Chat API] Stream error:', chunk.error);
									}
								}

								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "done" })}\n\n`,
									),
								);
								controller.close();
							} catch (error) {
								console.error("[Chat API] Error in stream:", error);
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "error", error: error instanceof Error ? error.message : String(error) })}\n\n`,
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
						},
					});
				} catch (error) {
					console.error("[Chat API] Fatal error:", error);
					console.error("[Chat API] Error details:", error instanceof Error ? error.stack : error);
					return json({
						error: "Internal server error",
						details: error instanceof Error ? error.message : String(error)
					}, { status: 500 });
				}
			},
		},
	},
});

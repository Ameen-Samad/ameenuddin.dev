import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
	checkRateLimit,
	RATE_LIMITS,
	rateLimitResponse,
} from "@/lib/rate-limit";

export const Route = createFileRoute("/demo/api/ai/image")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const ai = env.AI;
				const rateLimitKV = env.RATE_LIMIT;

				if (!ai) {
					return json({ error: "AI not available" }, { status: 500 });
				}

				const rateLimitResult = await checkRateLimit(
					request,
					"image-generation",
					RATE_LIMITS.IMAGE_GENERATION,
					rateLimitKV,
				);

				if (!rateLimitResult.success) {
					return rateLimitResponse(rateLimitResult);
				}

				try {
					const body = await request.json();
					const { prompt, numberOfImages } = body as {
						prompt: string;
						numberOfImages: number;
					};

					if (!prompt || prompt.trim().length === 0) {
						return json({ error: "Prompt is required" }, { status: 400 });
					}

					const numImages = Math.min(4, Math.max(1, numberOfImages || 1));
					const images = [];

					for (let i = 0; i < numImages; i++) {
						const response = await ai.run(
							"@cf/bytedance/stable-diffusion-xl-lightning",
							{
								prompt: prompt.trim(),
							},
						);

						// Convert response to Uint8Array
						let imageData: Uint8Array;

						if (response instanceof Uint8Array) {
							imageData = response;
						} else if (response instanceof ReadableStream) {
							// Read the stream to get the image data
							const reader = response.getReader();
							const chunks: Uint8Array[] = [];
							let totalLength = 0;

							while (true) {
								const { done, value } = await reader.read();
								if (done) break;
								chunks.push(value);
								totalLength += value.length;
							}

							// Combine all chunks into a single Uint8Array
							imageData = new Uint8Array(totalLength);
							let offset = 0;
							for (const chunk of chunks) {
								imageData.set(chunk, offset);
								offset += chunk.length;
							}
						} else if (response && typeof response === "object" && "image" in response) {
							const imgData = (response as any).image;
							if (imgData instanceof Uint8Array) {
								imageData = imgData;
							} else if (imgData instanceof ReadableStream) {
								// Read the stream
								const reader = imgData.getReader();
								const chunks: Uint8Array[] = [];
								let totalLength = 0;

								while (true) {
									const { done, value } = await reader.read();
									if (done) break;
									chunks.push(value);
									totalLength += value.length;
								}

								imageData = new Uint8Array(totalLength);
								let offset = 0;
								for (const chunk of chunks) {
									imageData.set(chunk, offset);
									offset += chunk.length;
								}
							} else {
								throw new Error("Unexpected image data type in response object");
							}
						} else {
							console.error("Unexpected response type:", typeof response, response);
							throw new Error("Could not generate image - unexpected response format");
						}

						// Check if we have valid image data
						if (!imageData || imageData.length === 0) {
							throw new Error("AI returned empty image data");
						}

						// Convert Uint8Array to base64 string in chunks to avoid stack overflow
						let binaryString = '';
						const chunkSize = 8192; // Process 8KB at a time
						for (let i = 0; i < imageData.length; i += chunkSize) {
							const chunk = imageData.subarray(i, i + chunkSize);
							binaryString += String.fromCharCode(...chunk);
						}
						const base64String = btoa(binaryString);

						images.push({
							b64Json: base64String,
						});
					}

					return json({
						images,
						rateLimit: {
							limit: rateLimitResult.limit,
							remaining: rateLimitResult.remaining,
							resetAt: rateLimitResult.resetAt,
						},
					});
				} catch (error) {
					console.error("Image Generation Error:", error);
					return json(
						{ error: "Failed to generate image. Please try again." },
						{ status: 500 },
					);
				}
			},
		},
	},
});

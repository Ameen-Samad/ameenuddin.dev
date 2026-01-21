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

						// Log response for debugging
						console.log("AI Response type:", typeof response);
						console.log("Is Uint8Array:", response instanceof Uint8Array);
						console.log("Response:", response);

						// Convert Uint8Array to base64 string
						let base64String = "";
						if (response instanceof Uint8Array) {
							if (response.length === 0) {
								console.error("Received empty Uint8Array from AI");
								throw new Error("AI returned empty image data");
							}
							base64String = btoa(String.fromCharCode(...response));
						} else if (typeof response === "string") {
							base64String = response;
						} else if (response && typeof response === "object") {
							// Handle object response (might have image property)
							console.log("Response keys:", Object.keys(response));
							if ("image" in response) {
								const imgData = (response as any).image;
								if (imgData instanceof Uint8Array) {
									base64String = btoa(String.fromCharCode(...imgData));
								} else if (typeof imgData === "string") {
									base64String = imgData;
								}
							}
						}

						if (!base64String) {
							console.error("Failed to extract image data from response");
							throw new Error("Could not generate image - empty response from AI");
						}

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

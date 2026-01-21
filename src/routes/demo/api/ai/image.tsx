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

						images.push({
							b64Json: response,
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

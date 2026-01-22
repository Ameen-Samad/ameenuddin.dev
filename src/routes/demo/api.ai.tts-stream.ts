import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/api/ai/tts-stream")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.json();
				const { text, speaker = "asteria" } = body;

				if (!text || text.trim().length === 0) {
					return new Response(
						JSON.stringify({
							error: "Text is required",
						}),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

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

				try {
					const response = await env.AI.run("@cf/deepgram/aura-2-en", {
						text,
						speaker,
					});

					// If response is a ReadableStream, pass it through directly
					if (response instanceof ReadableStream) {
						return new Response(response, {
							status: 200,
							headers: {
								"Content-Type": "audio/mpeg",
								"Cache-Control": "no-cache",
								"Transfer-Encoding": "chunked",
							},
						});
					}

					// If it's ArrayBuffer or Buffer, return it directly
					if (response instanceof ArrayBuffer || Buffer.isBuffer(response)) {
						return new Response(response, {
							status: 200,
							headers: {
								"Content-Type": "audio/mpeg",
							},
						});
					}

					// Fallback: return as-is
					return new Response(response as any, {
						status: 200,
						headers: {
							"Content-Type": "audio/mpeg",
						},
					});
				} catch (error: any) {
					console.error("Text-to-speech streaming error:", error);
					return new Response(
						JSON.stringify({
							error: error.message || "An error occurred during text-to-speech",
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

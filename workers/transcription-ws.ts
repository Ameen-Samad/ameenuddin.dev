/**
 * Standalone WebSocket Worker for Real-Time Voice Transcription
 *
 * Uses Cloudflare Workers AI with Deepgram Flux for real-time speech-to-text.
 *
 * Deployed to: /demo/api/ai/transcription
 *
 * Reference: https://developers.cloudflare.com/workers-ai/models/flux/
 *
 * This is the EXACT implementation from Cloudflare's documentation.
 * Cloudflare automatically handles the WebSocket upgrade and proxying.
 *
 * Audio Format:
 * - Encoding: linear16 (raw signed little-endian 16-bit PCM)
 * - Sample Rate: 16000 Hz
 * - Channels: 1 (mono)
 */

interface Env {
	AI: Ai;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Deepgram Flux requires WebSocket connection
		// Cloudflare automatically handles the upgrade and proxying
		const resp = await env.AI.run(
			"@cf/deepgram/flux",
			{
				encoding: "linear16",
				sample_rate: "16000",
			},
			{
				websocket: true,
			}
		);

		return resp;
	},
} satisfies ExportedHandler<Env>;

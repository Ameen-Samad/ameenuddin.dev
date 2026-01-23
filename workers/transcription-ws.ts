/**
 * Durable Object-based WebSocket Worker for Real-Time Voice Transcription
 *
 * Uses Cloudflare Durable Objects for stable, persistent WebSocket connections
 * with Deepgram Flux for real-time speech-to-text.
 *
 * Deployed to: /demo/api/ai/transcription
 *
 * Architecture:
 * - Durable Objects provide persistent WebSocket state
 * - Each client gets a unique Durable Object instance
 * - Connections survive Worker cold starts and scaling events
 *
 * Audio Format:
 * - Encoding: linear16 (raw signed little-endian 16-bit PCM)
 * - Sample Rate: 16000 Hz
 * - Channels: 1 (mono)
 */

interface Env {
	AI: Ai;
	TRANSCRIPTION_DO: DurableObjectNamespace;
}

/**
 * Durable Object class for managing transcription WebSocket connections
 * Provides stable, long-running connections with state persistence
 */
export class TranscriptionDurableObject implements DurableObject {
	private state: DurableObjectState;
	private env: Env;
	private sessions: Set<WebSocket>;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.sessions = new Set();
	}

	/**
	 * Handle WebSocket connections from clients
	 */
	async fetch(request: Request): Promise<Response> {
		// Validate WebSocket upgrade request
		const upgradeHeader = request.headers.get("Upgrade");
		if (!upgradeHeader || upgradeHeader !== "websocket") {
			return new Response("Expected WebSocket upgrade request", {
				status: 426,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			// Create WebSocket pair for client connection
			const webSocketPair = new WebSocketPair();
			const [client, server] = Object.values(webSocketPair);

			// Accept the WebSocket connection
			server.accept();
			this.sessions.add(server);

			// Connect to Deepgram Flux via Workers AI
			const aiResponse = await this.env.AI.run(
				"@cf/deepgram/flux",
				{
					encoding: "linear16",
					sample_rate: "16000",
				},
				{
					websocket: true,
				}
			);

			// Extract the AI WebSocket from the response
			const aiWebSocket = aiResponse.webSocket;
			if (!aiWebSocket) {
				server.close(1011, "Failed to connect to AI model");
				return new Response("Failed to initialize AI connection", {
					status: 500,
				});
			}

			// Accept the AI WebSocket connection
			aiWebSocket.accept();

			// Set up bidirectional message forwarding
			this.setupMessageForwarding(server, aiWebSocket);

			// Return the client-side WebSocket
			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		} catch (error) {
			console.error("[TranscriptionDO] Error setting up WebSocket:", error);
			return new Response(
				JSON.stringify({
					error: "Failed to establish WebSocket connection",
					details: error instanceof Error ? error.message : String(error),
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	}

	/**
	 * Set up bidirectional message forwarding between client and AI
	 */
	private setupMessageForwarding(
		clientWs: WebSocket,
		aiWs: WebSocket
	): void {
		// Forward messages from client to AI (audio data)
		clientWs.addEventListener("message", (event) => {
			try {
				if (aiWs.readyState === WebSocket.OPEN) {
					aiWs.send(event.data);
				}
			} catch (error) {
				console.error("[TranscriptionDO] Error forwarding to AI:", error);
			}
		});

		// Forward messages from AI to client (transcription results)
		aiWs.addEventListener("message", (event) => {
			try {
				if (clientWs.readyState === WebSocket.OPEN) {
					clientWs.send(event.data);
				}
			} catch (error) {
				console.error("[TranscriptionDO] Error forwarding to client:", error);
			}
		});

		// Handle client disconnection
		clientWs.addEventListener("close", (event) => {
			console.log(
				`[TranscriptionDO] Client disconnected: ${event.code} ${event.reason}`
			);
			this.sessions.delete(clientWs);
			if (aiWs.readyState === WebSocket.OPEN) {
				aiWs.close(1000, "Client disconnected");
			}
		});

		// Handle AI disconnection
		aiWs.addEventListener("close", (event) => {
			console.log(
				`[TranscriptionDO] AI disconnected: ${event.code} ${event.reason}`
			);
			if (clientWs.readyState === WebSocket.OPEN) {
				clientWs.close(1000, "AI connection closed");
			}
		});

		// Handle client errors
		clientWs.addEventListener("error", (event) => {
			console.error("[TranscriptionDO] Client WebSocket error:", event);
			this.sessions.delete(clientWs);
		});

		// Handle AI errors
		aiWs.addEventListener("error", (event) => {
			console.error("[TranscriptionDO] AI WebSocket error:", event);
		});
	}

	/**
	 * Clean up when the Durable Object is being evicted
	 */
	async webSocketClose(
		ws: WebSocket,
		code: number,
		reason: string,
		wasClean: boolean
	): Promise<void> {
		this.sessions.delete(ws);
		console.log(
			`[TranscriptionDO] Session closed: ${code} ${reason} (clean: ${wasClean})`
		);
	}
}

/**
 * Worker entry point - routes requests to Durable Objects
 */
export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		try {
			// Generate a unique ID for each connection (could be based on session ID, user ID, etc.)
			// For now, we'll create a new instance for each connection request
			const url = new URL(request.url);

			// Use a query parameter or generate a random ID for the Durable Object
			const doId = url.searchParams.get("session") || crypto.randomUUID();

			// Get the Durable Object stub
			const id = env.TRANSCRIPTION_DO.idFromName(doId);
			const stub = env.TRANSCRIPTION_DO.get(id);

			// Forward the request to the Durable Object
			return await stub.fetch(request);
		} catch (error) {
			console.error("[Worker] Error routing to Durable Object:", error);
			return new Response(
				JSON.stringify({
					error: "Failed to route request",
					details: error instanceof Error ? error.message : String(error),
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	},
} satisfies ExportedHandler<Env>;

/**
 * Standalone WebSocket Worker for Real-Time Voice Transcription
 *
 * Uses Cloudflare AI Gateway with Deepgram Flux for real-time speech-to-text.
 *
 * Deployed to: /demo/api/ai/transcription
 *
 * Usage:
 * ```javascript
 * const ws = new WebSocket('wss://ameenuddin.dev/demo/api/ai/transcription');
 *
 * ws.onopen = () => {
 *   // Send audio data (linear16, 16kHz)
 *   const audioData = getAudioFromMicrophone();
 *   ws.send(audioData);
 * };
 *
 * ws.onmessage = (event) => {
 *   const transcription = JSON.parse(event.data);
 *   console.log('Transcription:', transcription);
 * };
 * ```
 */

interface Env {
  // Environment variables (set in wrangler.toml)
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_GATEWAY_ID: string;

  // Secret (set via `wrangler secret put CLOUDFLARE_API_TOKEN`)
  CLOUDFLARE_API_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    const url = new URL(request.url);

    // If not a WebSocket upgrade request, return helpful info
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${url.host}${url.pathname}`;

      return new Response(
        JSON.stringify({
          error: 'This endpoint requires a WebSocket connection',
          info: 'Deepgram Flux requires WebSocket for real-time transcription',
          usage: 'Connect via WebSocket and send audio data (linear16, 16kHz)',
          websocketUrl: wsUrl,
          model: '@cf/deepgram/flux',
          audioFormat: {
            encoding: 'linear16',
            sampleRate: 16000,
            channels: 1,
          },
          example: {
            javascript: `
const ws = new WebSocket('${wsUrl}');

ws.onopen = () => {
  console.log('Connected to Deepgram Flux');
  // Send audio data (Int16Array from AudioContext)
  const audioData = new Int16Array(audioBuffer);
  ws.send(audioData.buffer);
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  if (result.type === 'transcription') {
    console.log('Text:', result.text);
  }
};
            `.trim(),
          },
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Check required environment variables
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_GATEWAY_ID || !env.CLOUDFLARE_API_TOKEN) {
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'Required environment variables not set. See AI-GATEWAY-SETUP.md',
          required: ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_GATEWAY_ID', 'CLOUDFLARE_API_TOKEN'],
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    try {
      // Create client-side WebSocket pair
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // Accept the client connection
      server.accept();

      // Build AI Gateway WebSocket URL
      const aiGatewayUrl = `wss://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.CLOUDFLARE_GATEWAY_ID}/workers-ai?model=@cf/deepgram/flux&encoding=linear16&sample_rate=16000&interim_results=true`;

      console.log('Connecting to AI Gateway:', aiGatewayUrl);

      // In Cloudflare Workers, outbound WebSocket connections use the subprotocol for authentication
      // Format: "cf-aig-authorization.<your-token>"
      const authProtocol = `cf-aig-authorization.${env.CLOUDFLARE_API_TOKEN}`;
      console.log('Auth protocol format:', authProtocol.substring(0, 40) + '...');
      const aiWebSocket = new WebSocket(aiGatewayUrl, [authProtocol]);

      // Track connection state
      let aiConnected = false;

      // Handle AI WebSocket open
      aiWebSocket.addEventListener('open', () => {
        aiConnected = true;
        console.log('AI Gateway connection established');

        server.send(JSON.stringify({
          type: 'connected',
          message: 'Connected to Deepgram Flux',
          model: '@cf/deepgram/flux',
          config: {
            encoding: 'linear16',
            sampleRate: 16000,
            interimResults: true,
          },
          timestamp: Date.now(),
        }));
      });

      // Forward audio from client to AI
      server.addEventListener('message', (event: MessageEvent) => {
        if (!aiConnected) {
          server.send(JSON.stringify({
            type: 'error',
            error: 'AI connection not ready',
            timestamp: Date.now(),
          }));
          return;
        }

        try {
          // Forward audio data to AI Gateway
          if (event.data instanceof ArrayBuffer || event.data instanceof Uint8Array) {
            aiWebSocket.send(event.data);
          } else if (typeof event.data === 'string') {
            // Handle text control messages if needed
            aiWebSocket.send(event.data);
          }
        } catch (error) {
          console.error('Error forwarding to AI:', error);
          server.send(JSON.stringify({
            type: 'error',
            error: 'Failed to forward audio data',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
          }));
        }
      });

      // Forward transcription results from AI to client
      aiWebSocket.addEventListener('message', (event: MessageEvent) => {
        try {
          if (typeof event.data === 'string') {
            // Parse AI response
            const data = JSON.parse(event.data);

            // Forward transcription result to client
            server.send(JSON.stringify({
              type: 'transcription',
              data,
              timestamp: Date.now(),
            }));
          } else {
            // Binary data (unlikely from Flux, but handle it)
            server.send(event.data);
          }
        } catch (error) {
          console.error('Error forwarding from AI:', error);
          server.send(JSON.stringify({
            type: 'error',
            error: 'Failed to process transcription',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
          }));
        }
      });

      // Handle AI WebSocket errors
      aiWebSocket.addEventListener('error', (event: any) => {
        console.error('AI WebSocket error:', event);
        server.send(JSON.stringify({
          type: 'error',
          error: 'AI connection error',
          message: event.message || 'Unknown error',
          timestamp: Date.now(),
        }));
        server.close(1011, 'AI connection error');
      });

      // Handle AI WebSocket close
      aiWebSocket.addEventListener('close', (event: CloseEvent) => {
        console.log('AI WebSocket closed:', event.code, event.reason);
        aiConnected = false;

        server.send(JSON.stringify({
          type: 'disconnected',
          reason: event.reason || 'AI connection closed',
          code: event.code,
          timestamp: Date.now(),
        }));

        server.close(event.code, event.reason || 'AI connection closed');
      });

      // Handle client WebSocket close
      server.addEventListener('close', (event: CloseEvent) => {
        console.log('Client WebSocket closed:', event.code, event.reason);
        if (aiConnected) {
          aiWebSocket.close(event.code, event.reason || 'Client disconnected');
        }
      });

      // Handle client WebSocket errors
      server.addEventListener('error', (event: any) => {
        console.error('Client WebSocket error:', event);
        if (aiConnected) {
          aiWebSocket.close(1011, 'Client connection error');
        }
      });

      // Return the WebSocket response to upgrade the connection
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (error: any) {
      console.error('WebSocket setup error:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to establish WebSocket connection',
          details: error.message || 'Unknown error',
          hint: 'Check AI-GATEWAY-SETUP.md for configuration instructions',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  },
};

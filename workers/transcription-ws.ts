/**
 * Standalone WebSocket Worker for Real-Time Voice Transcription
 *
 * This worker bypasses TanStack Start to provide WebSocket support for
 * real-time voice transcription using Cloudflare AI's Deepgram Flux model.
 *
 * Deployed separately to: /demo/api/ai/transcription
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
  AI: any; // Cloudflare AI binding
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');

    // Get the current URL to provide correct WebSocket endpoint
    const url = new URL(request.url);
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${url.host}${url.pathname}`;

    // If not a WebSocket upgrade request, return helpful info
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response(
        JSON.stringify({
          error: 'This endpoint requires a WebSocket connection',
          info: '@cf/deepgram/flux requires WebSocket for real-time transcription',
          usage: 'Connect via WebSocket and send audio data (linear16, 16kHz)',
          websocketUrl: wsUrl,
          example: {
            javascript: `
const ws = new WebSocket('${wsUrl}');

ws.onopen = () => {
  console.log('Connected to voice agent');
  // Send audio data (linear16, 16kHz)
  const audioData = getAudioFromMicrophone();
  ws.send(audioData);
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log('Transcription:', result);
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

    // Check AI binding availability
    if (!env?.AI) {
      return new Response(
        JSON.stringify({
          error: 'Cloudflare AI binding not available',
          details: 'AI binding must be configured in wrangler.toml',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    try {
      // Create a WebSocket pair for the client connection
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // Accept the WebSocket connection
      server.accept();

      // Establish WebSocket connection with Cloudflare AI
      const aiResponse = await env.AI.run(
        '@cf/deepgram/flux',
        {
          encoding: 'linear16',
          sample_rate: '16000',
        },
        {
          websocket: true,
        }
      );

      // Get the AI WebSocket from the response
      const aiWebSocket = aiResponse.webSocket;
      if (!aiWebSocket) {
        server.send(JSON.stringify({ error: 'Failed to establish AI connection' }));
        server.close(1011, 'AI connection failed');
        return new Response('AI connection failed', { status: 500 });
      }

      aiWebSocket.accept();

      // Forward messages from client to AI
      server.addEventListener('message', (event: MessageEvent) => {
        try {
          // Forward audio data from client to AI
          if (event.data instanceof ArrayBuffer || event.data instanceof Uint8Array) {
            aiWebSocket.send(event.data);
          } else if (typeof event.data === 'string') {
            // Handle text messages (control messages, etc.)
            aiWebSocket.send(event.data);
          }
        } catch (error) {
          console.error('Error forwarding to AI:', error);
          server.send(JSON.stringify({
            error: 'Failed to forward audio data',
            details: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });

      // Forward transcription results from AI to client
      aiWebSocket.addEventListener('message', (event: MessageEvent) => {
        try {
          // Forward transcription results from AI to client
          if (typeof event.data === 'string') {
            // Parse and validate the transcription result
            try {
              const data = JSON.parse(event.data);
              server.send(JSON.stringify({
                type: 'transcription',
                data,
                timestamp: Date.now(),
              }));
            } catch {
              // If not JSON, send as raw text
              server.send(JSON.stringify({
                type: 'transcription',
                text: event.data,
                timestamp: Date.now(),
              }));
            }
          } else {
            // Forward binary data if any
            server.send(event.data);
          }
        } catch (error) {
          console.error('Error forwarding from AI:', error);
          server.send(JSON.stringify({
            error: 'Failed to forward transcription',
            details: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });

      // Handle AI WebSocket errors
      aiWebSocket.addEventListener('error', (event: ErrorEvent) => {
        console.error('AI WebSocket error:', event);
        server.send(JSON.stringify({
          error: 'AI connection error',
          message: event.message || 'Unknown error'
        }));
        server.close(1011, 'AI connection error');
      });

      // Handle AI WebSocket close
      aiWebSocket.addEventListener('close', (event: CloseEvent) => {
        console.log('AI WebSocket closed:', event.code, event.reason);
        server.close(event.code, event.reason || 'AI connection closed');
      });

      // Handle client WebSocket close
      server.addEventListener('close', (event: CloseEvent) => {
        console.log('Client WebSocket closed:', event.code, event.reason);
        aiWebSocket.close(event.code, event.reason || 'Client disconnected');
      });

      // Handle client WebSocket errors
      server.addEventListener('error', (event: ErrorEvent) => {
        console.error('Client WebSocket error:', event);
        aiWebSocket.close(1011, 'Client connection error');
      });

      // Send connection confirmation to client
      server.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Deepgram Flux voice agent',
        config: {
          encoding: 'linear16',
          sampleRate: 16000,
          model: '@cf/deepgram/flux',
        },
        timestamp: Date.now(),
      }));

      // Return the WebSocket response to upgrade the connection
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (error: any) {
      console.error('WebSocket connection error:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to establish WebSocket connection',
          details: error.message || 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  },
};

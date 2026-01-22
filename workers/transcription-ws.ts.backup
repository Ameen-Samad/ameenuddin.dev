/**
 * Standalone WebSocket Worker for Real-Time Voice Transcription
 *
 * Uses Cloudflare Workers AI with Deepgram Flux for real-time speech-to-text.
 *
 * Deployed to: /demo/api/ai/transcription
 *
 * Usage:
 * ```javascript
 * const ws = new WebSocket('wss://ameenuddin.dev/demo/api/ai/transcription');
 *
 * ws.onopen = () => {
 *   console.log('Connected to Deepgram Flux');
 *   // Send audio data (Int16Array, linear16, 16kHz, mono)
 *   const audioData = new Int16Array(audioBuffer);
 *   ws.send(audioData.buffer);
 * };
 *
 * ws.onmessage = (event) => {
 *   // Transcription results from Deepgram Flux
 *   console.log('Transcription:', event.data);
 * };
 *
 * ws.onerror = (error) => {
 *   console.error('WebSocket error:', error);
 * };
 *
 * ws.onclose = () => {
 *   console.log('WebSocket closed');
 * };
 * ```
 *
 * Audio Format:
 * - Encoding: linear16 (Int16Array)
 * - Sample Rate: 16000 Hz
 * - Channels: 1 (mono)
 */

interface Env {
  // AI binding (set in wrangler.toml)
  AI: Ai;
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
          usage: 'Connect via WebSocket and send audio data (Int16Array, linear16, 16kHz, mono)',
          websocketUrl: wsUrl,
          model: '@cf/deepgram/flux',
          audioFormat: {
            encoding: 'linear16',
            sampleRate: 16000,
            channels: 1,
            dataType: 'Int16Array',
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
  // Transcription results from Deepgram Flux
  console.log('Transcription:', event.data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
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

    // Check required AI binding
    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'AI binding not available. Check wrangler.toml configuration.',
          required: ['AI binding in wrangler.toml'],
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    try {
      console.log('[WS-TRANS] Initializing Deepgram Flux WebSocket connection');

      // Create a WebSocket pair for the client connection
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      // Accept the client WebSocket connection
      server.accept();

      // Establish WebSocket connection with Cloudflare AI
      const aiResponse = await env.AI.run(
        '@cf/deepgram/flux',
        {
          encoding: 'linear16',
          sample_rate: '16000',
        },
        {
          websocket: true, // Enable WebSocket mode
        }
      );

      console.log('[WS-TRANS] Deepgram Flux WebSocket initialized');

      // Get the AI WebSocket from the response
      const aiWebSocket = (aiResponse as any).webSocket;
      if (!aiWebSocket) {
        if (server.readyState === 1) {
          server.send(
            JSON.stringify({
              type: 'error',
              error: 'Failed to establish AI connection',
            })
          );
        }
        server.close(1011, 'AI connection failed');
        return new Response('AI connection failed', { status: 500 });
      }

      // Accept the AI WebSocket if it has an accept method
      // Note: AI WebSockets from env.AI.run() might need explicit accept() call
      if (typeof aiWebSocket.accept === 'function') {
        try {
          aiWebSocket.accept();
          console.log('[WS-TRANS] AI WebSocket accepted');
        } catch (error) {
          console.log('[WS-TRANS] AI WebSocket accept() not needed or already accepted:', error);
        }
      }

      // Forward messages from client to AI
      let audioChunkCount = 0;
      server.addEventListener('message', (event: MessageEvent) => {
        try {
          // Forward audio data from client to AI
          if (
            event.data instanceof ArrayBuffer ||
            event.data instanceof Uint8Array
          ) {
            audioChunkCount++;
            const byteLength = event.data instanceof ArrayBuffer ? event.data.byteLength : event.data.length;
            console.log(`[WS-TRANS] Forwarding audio chunk #${audioChunkCount}, size: ${byteLength} bytes`);
            aiWebSocket.send(event.data);
          } else if (typeof event.data === 'string') {
            // Handle text messages (control messages, etc.)
            console.log('[WS-TRANS] Forwarding text message:', event.data);
            aiWebSocket.send(event.data);
          }
        } catch (error) {
          console.error('[WS-TRANS] Error forwarding to AI:', error);
          if (server.readyState === 1) {
            server.send(
              JSON.stringify({
                type: 'error',
                error: 'Failed to forward audio data',
                details: error instanceof Error ? error.message : 'Unknown error',
              })
            );
          }
        }
      });

      // Forward transcription results from AI to client
      aiWebSocket.addEventListener('message', (event: MessageEvent) => {
        try {
          // Check if server WebSocket is still open
          if (server.readyState !== 1) return;

          console.log('[WS-TRANS] Received message from AI:', typeof event.data, event.data);

          // Forward transcription results from AI to client
          if (typeof event.data === 'string') {
            // Parse and validate the transcription result
            try {
              const data = JSON.parse(event.data);
              server.send(
                JSON.stringify({
                  type: 'transcription',
                  data,
                  timestamp: Date.now(),
                })
              );
            } catch {
              // If not JSON, send as raw text
              server.send(
                JSON.stringify({
                  type: 'transcription',
                  text: event.data,
                  timestamp: Date.now(),
                })
              );
            }
          } else {
            // Forward binary data if any
            server.send(event.data);
          }
        } catch (error) {
          console.error('[WS-TRANS] Error forwarding from AI:', error);
          if (server.readyState === 1) {
            server.send(
              JSON.stringify({
                type: 'error',
                error: 'Failed to forward transcription',
                details: error instanceof Error ? error.message : 'Unknown error',
              })
            );
          }
        }
      });

      // Handle AI WebSocket errors
      aiWebSocket.addEventListener('error', (event: ErrorEvent) => {
        console.error('[WS-TRANS] AI WebSocket error:', event);
        if (server.readyState === 1) {
          server.send(
            JSON.stringify({
              type: 'error',
              error: 'AI connection error',
              message: event.message || 'Unknown error',
            })
          );
        }
        if (server.readyState === 1 || server.readyState === 0) {
          server.close(1011, 'AI connection error');
        }
      });

      // Handle AI WebSocket close
      aiWebSocket.addEventListener('close', (event: CloseEvent) => {
        console.log(
          '[WS-TRANS] AI WebSocket closed:',
          event.code,
          event.reason
        );
        // 1006 is reserved and cannot be used in close() - use 1011 (internal error) instead
        const closeCode = event.code === 1006 || event.code === 1005 || event.code === 1015 ? 1011 : event.code;
        if (server.readyState === 1 || server.readyState === 0) {
          server.close(closeCode, event.reason || 'AI connection closed');
        }
      });

      // Handle client WebSocket close
      server.addEventListener('close', (event: CloseEvent) => {
        console.log(
          '[WS-TRANS] Client WebSocket closed:',
          event.code,
          event.reason
        );
        // 1006 is reserved and cannot be used in close() - use 1011 (internal error) instead
        const closeCode = event.code === 1006 || event.code === 1005 || event.code === 1015 ? 1011 : event.code;
        if (aiWebSocket.readyState === 1 || aiWebSocket.readyState === 0) {
          aiWebSocket.close(closeCode, event.reason || 'Client disconnected');
        }
      });

      // Handle client WebSocket errors
      server.addEventListener('error', (event: ErrorEvent) => {
        console.error('[WS-TRANS] Client WebSocket error:', event);
        if (aiWebSocket.readyState === 1 || aiWebSocket.readyState === 0) {
          aiWebSocket.close(1011, 'Client connection error');
        }
      });

      console.log('[WS-TRANS] WebSocket proxy established');

      // Send connection confirmation after the response is returned
      // Use queueMicrotask to ensure the WebSocket upgrade completes first
      queueMicrotask(() => {
        if (server.readyState === 1) {
          server.send(
            JSON.stringify({
              type: 'connected',
              message: 'Connected to Deepgram Flux voice agent',
              config: {
                encoding: 'linear16',
                sampleRate: 16000,
                model: '@cf/deepgram/flux',
              },
              timestamp: Date.now(),
            })
          );
        }
      });

      // Return the WebSocket response to upgrade the connection
      // This MUST be returned before sending any messages
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (error: any) {
      console.error('[WS-TRANS] WebSocket setup error:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to establish WebSocket connection',
          details: error.message || 'Unknown error',
          hint: 'Ensure AI binding is configured in wrangler.toml',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  },
};

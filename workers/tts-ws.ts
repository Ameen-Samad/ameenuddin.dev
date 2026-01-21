/**
 * Standalone WebSocket Worker for Real-Time Text-to-Speech
 *
 * Uses Cloudflare AI Gateway with Deepgram Aura-2-EN for streaming TTS.
 *
 * Deployed to: /demo/api/ai/tts-stream
 *
 * Usage:
 * ```javascript
 * const ws = new WebSocket('wss://ameenuddin.dev/demo/api/ai/tts-stream');
 *
 * ws.onopen = () => {
 *   // Send text to speak
 *   ws.send(JSON.stringify({
 *     type: 'Speak',
 *     text: 'Hello, this is a streaming text-to-speech demo.'
 *   }));
 *
 *   // Flush to get audio immediately
 *   ws.send(JSON.stringify({ type: 'Flush' }));
 * };
 *
 * ws.onmessage = (event) => {
 *   if (event.data instanceof ArrayBuffer) {
 *     // Raw audio data (PCM, 24kHz, 16-bit, mono)
 *     playAudio(event.data);
 *   } else {
 *     const msg = JSON.parse(event.data);
 *     console.log('Message:', msg);
 *   }
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
          info: 'Deepgram Aura-2-EN requires WebSocket for streaming text-to-speech',
          usage: 'Connect via WebSocket and send JSON messages to speak text',
          websocketUrl: wsUrl,
          model: '@cf/deepgram/aura-2-en',
          audioFormat: {
            encoding: 'PCM',
            sampleRate: 24000,
            bitDepth: 16,
            channels: 1,
          },
          messages: {
            Speak: 'Send text to convert to speech',
            Flush: 'Generate audio immediately',
            Clear: 'Clear audio queue',
            Close: 'Close the connection',
          },
          example: {
            javascript: `
const ws = new WebSocket('${wsUrl}');

ws.onopen = () => {
  console.log('Connected to Deepgram Aura TTS');

  // Send text to speak
  ws.send(JSON.stringify({
    type: 'Speak',
    text: 'Hello from Deepgram Aura streaming TTS!'
  }));

  // Flush to get audio immediately
  ws.send(JSON.stringify({ type: 'Flush' }));
};

ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    // Raw audio data - play it
    playAudioBuffer(event.data);
  } else {
    const msg = JSON.parse(event.data);
    if (msg.type === 'Flushed') {
      console.log('Audio generation complete');
    }
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

      // Build AI Gateway WebSocket URL for Aura-2-EN
      const aiGatewayUrl = `wss://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.CLOUDFLARE_GATEWAY_ID}/workers-ai?model=@cf/deepgram/aura-2-en`;

      console.log('Connecting to AI Gateway (TTS):', aiGatewayUrl.replace(env.CLOUDFLARE_API_TOKEN, '***'));

      // Connect to Cloudflare AI Gateway
      const aiWebSocket = new WebSocket(aiGatewayUrl, {
        headers: {
          'cf-aig-authorization': env.CLOUDFLARE_API_TOKEN,
        },
      } as any);

      // Track connection state
      let aiConnected = false;

      // Handle AI WebSocket open
      aiWebSocket.addEventListener('open', () => {
        aiConnected = true;
        console.log('AI Gateway TTS connection established');

        server.send(JSON.stringify({
          type: 'connected',
          message: 'Connected to Deepgram Aura-2-EN TTS',
          model: '@cf/deepgram/aura-2-en',
          config: {
            sampleRate: 24000,
            bitDepth: 16,
            channels: 1,
            encoding: 'PCM',
          },
          timestamp: Date.now(),
        }));
      });

      // Forward messages from client to AI
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
          // Forward text/control messages to AI Gateway
          if (typeof event.data === 'string') {
            aiWebSocket.send(event.data);
          } else {
            // Shouldn't receive binary from client for TTS
            console.warn('Unexpected binary data from client');
          }
        } catch (error) {
          console.error('Error forwarding to AI:', error);
          server.send(JSON.stringify({
            type: 'error',
            error: 'Failed to forward message',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
          }));
        }
      });

      // Forward audio/messages from AI to client
      aiWebSocket.addEventListener('message', (event: MessageEvent) => {
        try {
          // Check if message is JSON (metadata, flushed, etc.) or raw audio
          if (event.data instanceof ArrayBuffer || event.data instanceof Buffer) {
            // Raw audio data - forward directly
            server.send(event.data);
          } else if (typeof event.data === 'string') {
            // JSON message (Metadata, Flushed, Cleared, Warning)
            try {
              const message = JSON.parse(event.data);

              // Forward metadata/status messages
              server.send(JSON.stringify({
                type: message.type || 'message',
                data: message,
                timestamp: Date.now(),
              }));
            } catch {
              // Not JSON, might be raw audio as string
              server.send(event.data);
            }
          }
        } catch (error) {
          console.error('Error forwarding from AI:', error);
          server.send(JSON.stringify({
            type: 'error',
            error: 'Failed to process audio',
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
          // Send Close message to AI before closing
          try {
            aiWebSocket.send(JSON.stringify({ type: 'Close' }));
          } catch (e) {
            // Ignore if already closed
          }
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

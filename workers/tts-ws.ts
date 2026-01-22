/**
 * Standalone WebSocket Worker for Real-Time Text-to-Speech
 *
 * Uses Cloudflare Workers AI with Deepgram Aura-2-EN for streaming TTS.
 *
 * Deployed to: /demo/api/ai/tts-stream
 *
 * Usage:
 * ```javascript
 * const ws = new WebSocket('wss://ameenuddin.dev/demo/api/ai/tts-stream');
 *
 * ws.onopen = () => {
 *   console.log('Connected to Deepgram Aura TTS');
 *
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
 *     if (msg.type === 'Flushed') {
 *       console.log('Audio generation complete');
 *     }
 *   }
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
 * Protocol:
 * - Client sends JSON: { type: 'Speak', text: 'text to speak' }
 * - Client sends JSON: { type: 'Flush' } to generate audio
 * - Server responds with ArrayBuffer (PCM audio) or JSON messages
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
      console.log('Initializing Deepgram Aura-2-EN WebSocket connection');

      // Use Workers AI with WebSocket mode for TTS
      // This creates a WebSocket connection:
      // - Client sends JSON: { type: 'Speak', text: '...' }
      // - Client sends JSON: { type: 'Flush' } to generate audio
      // - Server responds with ArrayBuffer (PCM audio) or JSON messages
      const response = await env.AI.run(
        '@cf/deepgram/aura-2-en',
        {},
        {
          websocket: true, // Enable WebSocket mode
        }
      );

      console.log('Deepgram Aura-2-EN WebSocket initialized');

      // Return the WebSocket response
      // The client will connect directly to this worker's WebSocket
      return response;
    } catch (error: any) {
      console.error('WebSocket setup error:', error);
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

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
      console.log('Initializing Deepgram Flux WebSocket connection');

      // Use Workers AI with WebSocket mode
      // This creates a WebSocket connection that streams audio in and text out
      const response = await env.AI.run(
        '@cf/deepgram/flux',
        {
          encoding: 'linear16',
          sample_rate: '16000',
        },
        {
          websocket: true, // Enable WebSocket mode
        }
      );

      console.log('Deepgram Flux WebSocket initialized');

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

import { createFileRoute } from '@tanstack/react-router'

/**
 * Cloudflare Deepgram Flux Voice Agent API
 *
 * IMPORTANT: @cf/deepgram/flux requires WebSocket connections for real-time transcription.
 *
 * This endpoint creates a WebSocket bridge between the client and Cloudflare AI:
 * Client <--WebSocket--> This Worker <--WebSocket--> Cloudflare AI (Deepgram Flux)
 *
 * Usage:
 * 1. Client connects via WebSocket to this endpoint
 * 2. Send audio data as binary frames (linear16 encoding, 16kHz sample rate)
 * 3. Receive real-time transcription results as JSON messages
 *
 * Example client code:
 * ```javascript
 * const ws = new WebSocket('wss://your-domain.com/demo/api/ai/transcription');
 *
 * ws.onopen = () => {
 *   console.log('Connected to voice agent');
 *   // Send audio data from microphone
 *   navigator.mediaDevices.getUserMedia({ audio: true })
 *     .then(stream => {
 *       const mediaRecorder = new MediaRecorder(stream);
 *       mediaRecorder.ondataavailable = (event) => {
 *         ws.send(event.data);
 *       };
 *       mediaRecorder.start(100); // Send chunks every 100ms
 *     });
 * };
 *
 * ws.onmessage = (event) => {
 *   const transcription = JSON.parse(event.data);
 *   console.log('Transcription:', transcription);
 * };
 * ```
 */
export const Route = createFileRoute('/demo/api/ai/transcription')({
  server: {
    handlers: {
      // WebSocket upgrade handler
      GET: async ({ request, context }) => {
        const upgradeHeader = request.headers.get('Upgrade')

        // Get the current URL to provide correct WebSocket endpoint
        const url = new URL(request.url)
        const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProtocol}//${url.host}${url.pathname}`

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
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const env = (context as any)?.cloudflare?.env
        if (!env?.AI) {
          return new Response(
            JSON.stringify({
              error: 'Cloudflare AI binding not available',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        try {
          // Create a WebSocket pair for the client connection
          const webSocketPair = new WebSocketPair()
          const [client, server] = Object.values(webSocketPair)

          // Accept the WebSocket connection
          server.accept()

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
          )

          // Get the AI WebSocket from the response
          const aiWebSocket = aiResponse.webSocket
          if (!aiWebSocket) {
            server.send(JSON.stringify({ error: 'Failed to establish AI connection' }))
            server.close(1011, 'AI connection failed')
            return new Response('AI connection failed', { status: 500 })
          }

          aiWebSocket.accept()

          // Forward messages from client to AI
          server.addEventListener('message', (event: MessageEvent) => {
            try {
              // Forward audio data from client to AI
              if (event.data instanceof ArrayBuffer || event.data instanceof Uint8Array) {
                aiWebSocket.send(event.data)
              } else if (typeof event.data === 'string') {
                // Handle text messages (control messages, etc.)
                aiWebSocket.send(event.data)
              }
            } catch (error) {
              console.error('Error forwarding to AI:', error)
              server.send(JSON.stringify({
                error: 'Failed to forward audio data',
                details: error instanceof Error ? error.message : 'Unknown error'
              }))
            }
          })

          // Forward transcription results from AI to client
          aiWebSocket.addEventListener('message', (event: MessageEvent) => {
            try {
              // Forward transcription results from AI to client
              if (typeof event.data === 'string') {
                // Parse and validate the transcription result
                try {
                  const data = JSON.parse(event.data)
                  server.send(JSON.stringify({
                    type: 'transcription',
                    data,
                    timestamp: Date.now(),
                  }))
                } catch {
                  // If not JSON, send as raw text
                  server.send(JSON.stringify({
                    type: 'transcription',
                    text: event.data,
                    timestamp: Date.now(),
                  }))
                }
              } else {
                // Forward binary data if any
                server.send(event.data)
              }
            } catch (error) {
              console.error('Error forwarding from AI:', error)
              server.send(JSON.stringify({
                error: 'Failed to forward transcription',
                details: error instanceof Error ? error.message : 'Unknown error'
              }))
            }
          })

          // Handle AI WebSocket errors
          aiWebSocket.addEventListener('error', (event: ErrorEvent) => {
            console.error('AI WebSocket error:', event)
            server.send(JSON.stringify({
              error: 'AI connection error',
              message: event.message || 'Unknown error'
            }))
            server.close(1011, 'AI connection error')
          })

          // Handle AI WebSocket close
          aiWebSocket.addEventListener('close', (event: CloseEvent) => {
            console.log('AI WebSocket closed:', event.code, event.reason)
            server.close(event.code, event.reason || 'AI connection closed')
          })

          // Handle client WebSocket close
          server.addEventListener('close', (event: CloseEvent) => {
            console.log('Client WebSocket closed:', event.code, event.reason)
            aiWebSocket.close(event.code, event.reason || 'Client disconnected')
          })

          // Handle client WebSocket errors
          server.addEventListener('error', (event: ErrorEvent) => {
            console.error('Client WebSocket error:', event)
            aiWebSocket.close(1011, 'Client connection error')
          })

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
          }))

          // Return the WebSocket response to upgrade the connection
          return new Response(null, {
            status: 101,
            webSocket: client,
          })
        } catch (error: any) {
          console.error('WebSocket connection error:', error)
          return new Response(
            JSON.stringify({
              error: 'Failed to establish WebSocket connection',
              details: error.message || 'Unknown error',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },

      // Fallback for POST requests - inform about WebSocket requirement
      POST: async ({ request }) => {
        // Get the current URL to provide correct WebSocket endpoint
        const url = new URL(request.url)
        const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProtocol}//${url.host}${url.pathname}`

        return new Response(
          JSON.stringify({
            error: 'This endpoint requires a WebSocket connection',
            info: '@cf/deepgram/flux is a real-time voice agent that requires WebSocket',
            websocketUrl: wsUrl,
            instructions: {
              step1: 'Connect via WebSocket (GET request with Upgrade: websocket header)',
              step2: 'Wait for connection confirmation message',
              step3: 'Send audio data as binary frames (linear16 encoding, 16kHz sample rate)',
              step4: 'Receive real-time transcription results via WebSocket messages',
            },
            audioFormat: {
              encoding: 'linear16',
              sampleRate: 16000,
              channels: 1,
              bitDepth: 16,
            },
            messageFormat: {
              clientToServer: 'ArrayBuffer or Uint8Array (audio data)',
              serverToClient: {
                connected: {
                  type: 'connected',
                  message: 'string',
                  config: 'object',
                  timestamp: 'number',
                },
                transcription: {
                  type: 'transcription',
                  data: 'object',
                  timestamp: 'number',
                },
                error: {
                  error: 'string',
                  details: 'string',
                },
              },
            },
            example: {
              javascript: `
const ws = new WebSocket('${wsUrl}');

ws.onopen = () => {
  console.log('WebSocket connection opened');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'connected') {
    console.log('Voice agent ready:', message.config);
    // Start sending audio data
    sendAudioData(ws);
  } else if (message.type === 'transcription') {
    console.log('Transcription:', message.data);
  } else if (message.error) {
    console.error('Error:', message.error);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};

function sendAudioData(ws) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const audioData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16Array (linear16)
        const int16Data = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
        }
        ws.send(int16Data.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    })
    .catch(error => console.error('Microphone error:', error));
}
              `.trim(),
            },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      },
    },
  },
})

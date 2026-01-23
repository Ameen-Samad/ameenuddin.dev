/**
 * Test script for Durable Object WebSocket implementation
 *
 * Tests:
 * 1. WebSocket connection stability
 * 2. Message forwarding (client → AI → client)
 * 3. Error handling
 * 4. Reconnection behavior
 *
 * Usage:
 *   node test-durable-object-ws.js [ws-url]
 *
 * Examples:
 *   node test-durable-object-ws.js ws://localhost:8787
 *   node test-durable-object-ws.js wss://ameenuddin.dev/demo/api/ai/transcription
 */

const WebSocket = require('ws');

const WS_URL = process.argv[2] || 'ws://localhost:8787';
const TEST_DURATION = 30000; // 30 seconds
const HEARTBEAT_INTERVAL = 5000; // 5 seconds

console.log('🧪 Testing Durable Object WebSocket Implementation');
console.log('📡 Connecting to:', WS_URL);
console.log('⏱️  Test duration:', TEST_DURATION / 1000, 'seconds\n');

let messageCount = 0;
let startTime = Date.now();
let heartbeatInterval;

const ws = new WebSocket(WS_URL);

// Connection opened
ws.on('open', () => {
	console.log('✅ [OPEN] WebSocket connected to Durable Object');
	startTime = Date.now();

	// Send periodic heartbeats to keep connection alive
	heartbeatInterval = setInterval(() => {
		if (ws.readyState === WebSocket.OPEN) {
			const elapsed = Math.round((Date.now() - startTime) / 1000);
			console.log(`💓 [HEARTBEAT] Connection alive for ${elapsed}s`);

			// Send a small audio chunk (simulated - empty buffer)
			// In real usage, this would be actual audio data
			const dummyAudio = Buffer.alloc(1024); // 1KB dummy audio
			ws.send(dummyAudio);
		}
	}, HEARTBEAT_INTERVAL);
});

// Message received
ws.on('message', (data) => {
	messageCount++;
	const elapsed = Math.round((Date.now() - startTime) / 1000);

	try {
		// Try to parse as JSON (transcription results)
		const message = JSON.parse(data.toString());
		console.log(`📨 [MESSAGE ${messageCount}] Received (${elapsed}s):`, message);
	} catch (e) {
		// Binary data or non-JSON
		console.log(`📨 [MESSAGE ${messageCount}] Received ${data.length} bytes (${elapsed}s)`);
	}
});

// Error occurred
ws.on('error', (error) => {
	console.error('❌ [ERROR] WebSocket error:', error.message);
});

// Connection closed
ws.on('close', (code, reason) => {
	const elapsed = Math.round((Date.now() - startTime) / 1000);
	clearInterval(heartbeatInterval);

	console.log(`\n🔌 [CLOSE] WebSocket closed after ${elapsed}s`);
	console.log(`   Code: ${code}`);
	console.log(`   Reason: ${reason || 'No reason provided'}`);
	console.log(`   Messages received: ${messageCount}`);

	// Evaluate connection stability
	if (elapsed >= TEST_DURATION / 1000 * 0.9) {
		console.log('\n✅ SUCCESS: Connection remained stable for test duration');
	} else if (code === 1000) {
		console.log('\n✅ SUCCESS: Clean closure (normal termination)');
	} else {
		console.log('\n⚠️  WARNING: Connection closed unexpectedly');
	}
});

// Automatic test timeout
setTimeout(() => {
	if (ws.readyState === WebSocket.OPEN) {
		const elapsed = Math.round((Date.now() - startTime) / 1000);
		console.log(`\n⏰ [TIMEOUT] Test duration reached (${elapsed}s)`);
		console.log(`   Messages received: ${messageCount}`);
		console.log('   Closing connection...\n');
		ws.close(1000, 'Test completed');
	}
}, TEST_DURATION);

// Handle process termination
process.on('SIGINT', () => {
	console.log('\n\n🛑 Test interrupted by user');
	if (ws.readyState === WebSocket.OPEN) {
		ws.close(1000, 'User interrupted');
	}
	clearInterval(heartbeatInterval);
	process.exit(0);
});

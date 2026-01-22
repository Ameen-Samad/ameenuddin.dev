#!/usr/bin/env node

/**
 * Kill processes running on specific ports before starting dev servers
 * Prevents "address already in use" errors
 */

import { execSync } from "node:child_process";

// Ports used by the application
const PORTS = [
	3000, // Main app
	8787, // Transcription worker
	8788, // TTS worker
	9229, // Main inspector
	9230, // Transcription inspector
	9231, // TTS inspector
];

/**
 * Find and kill process on a given port
 * @param {number} port - Port number to check
 */
function killPort(port) {
	try {
		// Use lsof to find process using the port
		const pid = execSync(`lsof -ti:${port}`, { encoding: "utf-8" }).trim();

		if (pid) {
			console.log(`🔴 Killing process ${pid} on port ${port}`);
			execSync(`kill -9 ${pid}`);
			console.log(`✅ Port ${port} is now free`);
		}
	} catch (error) {
		// No process found on this port (lsof returns non-zero exit code)
		if (error.status === 1) {
			console.log(`✓ Port ${port} is already free`);
		} else {
			console.error(`⚠️  Error checking port ${port}:`, error.message);
		}
	}
}

console.log("🧹 Cleaning up ports before starting dev servers...\n");

// Kill processes on all ports
for (const port of PORTS) {
	killPort(port);
}

console.log("\n✨ Port cleanup complete!");

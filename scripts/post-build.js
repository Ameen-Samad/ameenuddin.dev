#!/usr/bin/env node
/**
 * Post-build script to prepare Cloudflare Pages deployment
 *
 * TanStack Start generates:
 * - dist/client/ - Static assets
 * - dist/server/server.js - Cloudflare Worker
 *
 * Cloudflare Pages needs:
 * - dist/client/ - Static assets
 * - dist/client/_worker.js - Pages Function (Worker)
 *
 * This script copies server.js to _worker.js for Pages deployment.
 */

import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Try server.js first (old output), then index.js (new output)
const serverFiles = [
  join(projectRoot, 'dist/server/server.js'),
  join(projectRoot, 'dist/server/index.js'),
];

const workerJs = join(projectRoot, 'dist/client/_worker.js');

try {
  let serverJs = null;
  for (const file of serverFiles) {
    if (existsSync(file)) {
      serverJs = file;
      break;
    }
  }

  if (!serverJs) {
    throw new Error('Could not find server entry file (server.js or index.js)');
  }

  console.log(`📦 Copying ${serverJs.split('/').pop()} to _worker.js for Cloudflare Pages...`);
  copyFileSync(serverJs, workerJs);
  console.log('✅ Successfully created dist/client/_worker.js');
  console.log('🚀 Ready to deploy to Cloudflare Pages!');
} catch (error) {
  console.error('❌ Error copying server file:', error.message);
  process.exit(1);
}

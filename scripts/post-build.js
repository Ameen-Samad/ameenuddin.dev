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

import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const serverJs = join(projectRoot, 'dist/server/server.js');
const workerJs = join(projectRoot, 'dist/client/_worker.js');

try {
  console.log('📦 Copying server.js to _worker.js for Cloudflare Pages...');
  copyFileSync(serverJs, workerJs);
  console.log('✅ Successfully created dist/client/_worker.js');
  console.log('🚀 Ready to deploy to Cloudflare Pages!');
} catch (error) {
  console.error('❌ Error copying server file:', error.message);
  process.exit(1);
}

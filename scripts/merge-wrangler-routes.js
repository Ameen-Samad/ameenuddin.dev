#!/usr/bin/env node
/**
 * Merges routes from source wrangler.jsonc into generated dist/server/wrangler.json
 * This fixes TanStack Start not copying the routes field during build
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const SOURCE_CONFIG = resolve("wrangler.jsonc");
const GENERATED_CONFIG = resolve("dist/server/wrangler.json");

try {
  // Read source config (wrangler.jsonc)
  const sourceContent = readFileSync(SOURCE_CONFIG, "utf-8");
  // Remove comments and parse JSON
  const sourceConfigText = sourceContent.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const sourceConfig = JSON.parse(sourceConfigText);

  // Read generated config
  const generatedConfig = JSON.parse(readFileSync(GENERATED_CONFIG, "utf-8"));

  // Merge routes if they exist in source
  if (sourceConfig.routes && sourceConfig.routes.length > 0) {
    generatedConfig.routes = sourceConfig.routes;
    console.log(`✅ Merged ${sourceConfig.routes.length} route(s) into generated wrangler.json`);

    // Write back
    writeFileSync(GENERATED_CONFIG, JSON.stringify(generatedConfig, null, 2));
    console.log(`✅ Updated ${GENERATED_CONFIG}`);
  } else {
    console.log("ℹ️  No routes found in source config, skipping merge");
  }
} catch (error) {
  console.error("❌ Error merging routes:", error.message);
  process.exit(1);
}

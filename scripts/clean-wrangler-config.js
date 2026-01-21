#!/usr/bin/env node
/**
 * Cleans generated wrangler.json by removing fields unsupported by wrangler v3
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GENERATED_CONFIG = resolve("dist/server/wrangler.json");

try {
  const config = JSON.parse(readFileSync(GENERATED_CONFIG, "utf-8"));

  // Remove unsupported fields
  const unsupportedFields = [
    "configPath",
    "userConfigPath",
    "definedEnvironments",
    "legacy_env",
    "jsx_factory",
    "jsx_fragment",
    "cloudchamber",
    "secrets_store_secrets",
    "unsafe_hello_world",
    "worker_loaders",
    "ratelimits",
    "vpc_services",
    "python_modules",
    "dev" // Remove dev field with problematic properties
  ];

  for (const field of unsupportedFields) {
    delete config[field];
  }

  // Fix triggers field - wrangler v3 expects only crons property if present
  if (config.triggers && Object.keys(config.triggers).length === 0) {
    delete config.triggers;
  }

  // Fix topLevelName
  delete config.topLevelName;

  // Write cleaned config
  writeFileSync(GENERATED_CONFIG, JSON.stringify(config, null, 2));
  console.log(`✅ Cleaned wrangler.json (removed ${unsupportedFields.length} unsupported fields)`);
} catch (error) {
  console.error("❌ Error cleaning config:", error.message);
  process.exit(1);
}

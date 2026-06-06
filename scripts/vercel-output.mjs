/**
 * Post-build script: reorganize Nitro's dist/ output into Vercel Build Output API v3 format.
 *
 * Nitro vercel preset writes to dist/ (overridden by @lovable.dev/vite-tanstack-config).
 * Vercel expects .vercel/output/ with this structure:
 *   config.json                         ← routing config
 *   static/                             ← public assets (from dist/client/)
 *   functions/__server.func/            ← serverless function (from dist/server/)
 *
 * Runs only when VERCEL=1 (set automatically by Vercel CI).
 */

import { existsSync, mkdirSync, rmSync } from "fs";
import { cpSync, copyFileSync } from "fs";
import { resolve } from "path";

if (!process.env.VERCEL) {
  console.log("[vercel-output] Not on Vercel — skipping.");
  process.exit(0);
}

const root = resolve(".");
const dist = resolve("dist");
const out = resolve(".vercel/output");

if (!existsSync(`${dist}/config.json`)) {
  console.error("[vercel-output] dist/config.json not found — was NITRO_PRESET=vercel set?");
  process.exit(1);
}

// Clean and recreate .vercel/output structure
if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/functions/__server.func`, { recursive: true });
mkdirSync(`${out}/static`, { recursive: true });

// Vercel routing config
copyFileSync(`${dist}/config.json`, `${out}/config.json`);

// Static assets (client bundle)
cpSync(`${dist}/client`, `${out}/static`, { recursive: true });

// Serverless function (Node.js, per .vc-config.json)
cpSync(`${dist}/server`, `${out}/functions/__server.func`, { recursive: true });

console.log("[vercel-output] .vercel/output/ created successfully.");
console.log(`  static/    ← dist/client/`);
console.log(`  functions/__server.func/ ← dist/server/`);

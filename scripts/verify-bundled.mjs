#!/usr/bin/env node
/**
 * Fails if `bundled/ai-rules` is not a byte-identical mirror of `.cursor/rules/ai-rules`.
 * Run after `npm run sync-bundled` (e.g. in prepublish).
 */
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const srcDir = path.join(repoRoot, ".cursor", "rules", "ai-rules");
const dstDir = path.join(repoRoot, "bundled", "ai-rules");

function walkFiles(rootDir) {
  /** @type {Map<string, string>} rel -> sha256 */
  const map = new Map();
  function walk(relDir) {
    const abs = path.join(rootDir, relDir);
    if (!fs.existsSync(abs)) {
      return;
    }
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      if (ent.name.startsWith(".")) {
        continue;
      }
      const rel = path.join(relDir, ent.name);
      const full = path.join(rootDir, rel);
      if (ent.isDirectory()) {
        walk(rel);
      } else {
        const buf = fs.readFileSync(full);
        map.set(rel.split(path.sep).join("/"), crypto.createHash("sha256").update(buf).digest("hex"));
      }
    }
  }
  walk("");
  return map;
}

if (!fs.existsSync(srcDir)) {
  console.error("Missing:", srcDir);
  process.exit(1);
}
if (!fs.existsSync(dstDir)) {
  console.error("Missing bundled copy:", dstDir, "— run npm run sync-bundled");
  process.exit(1);
}

const src = walkFiles(srcDir);
const dst = walkFiles(dstDir);
const problems = [];

for (const [rel, h] of src) {
  if (!dst.has(rel)) {
    problems.push(`missing in bundled: ${rel}`);
  } else if (dst.get(rel) !== h) {
    problems.push(`content mismatch: ${rel}`);
  }
}
for (const rel of dst.keys()) {
  if (!src.has(rel)) {
    problems.push(`extra in bundled (not in source): ${rel}`);
  }
}

if (problems.length) {
  console.error("bundled/ai-rules is not identical to .cursor/rules/ai-rules:\n", problems.join("\n"));
  process.exit(1);
}

console.log("OK: bundled/ai-rules matches .cursor/rules/ai-rules (", src.size, "files).");

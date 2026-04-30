#!/usr/bin/env node
/**
 * Copies `.cursor/rules/ai-rules/` → `bundled/ai-rules/` (recursive)
 * and writes `bundled/manifest.json` listing shipped files as repo-root
 * relative paths with forward slashes (e.g. `coding-rules/write-clean-code.mdc`).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(repoRoot, ".cursor", "rules", "ai-rules");
const destDir = path.join(repoRoot, "bundled", "ai-rules");
const manifestPath = path.join(repoRoot, "bundled", "manifest.json");

if (!fs.existsSync(sourceDir)) {
  console.error("Missing source rules folder:", sourceDir);
  process.exit(1);
}

fs.mkdirSync(path.dirname(destDir), { recursive: true });
fs.rmSync(destDir, { recursive: true, force: true });
fs.cpSync(sourceDir, destDir, { recursive: true });

/**
 * Walk a directory and yield repo-relative paths (using forward slashes),
 * skipping dotfiles. Matches the verifier's behavior so the manifest is stable.
 */
function listShippedFiles(rootDir) {
  const out = [];
  const walk = (relDir) => {
    const abs = path.join(rootDir, relDir);
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      if (ent.name.startsWith(".")) {
        continue;
      }
      const rel = relDir ? `${relDir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        walk(rel);
      } else {
        out.push(rel);
      }
    }
  };
  walk("");
  return out.sort();
}

const files = listShippedFiles(destDir);

fs.writeFileSync(manifestPath, JSON.stringify({ version: 1, files }, null, 2) + "\n", "utf8");
console.log("Synced", files.length, "files to bundled/ai-rules/ and wrote manifest.json");

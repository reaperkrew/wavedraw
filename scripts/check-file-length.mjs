#!/usr/bin/env node
// Enforces the AGENTS.md value-system rule:
//   ".ts files must be no longer than 300 lines (excluding tests)."
// Walks src/ and fails if any .ts file exceeds the limit. Test files live
// under test/ so they are outside the scanned root by design.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_LINES = 300;
const ROOT = fileURLToPath(new URL("../src", import.meta.url));

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (full.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n").length;
  if (lines > MAX_LINES) {
    violations.push({ file, lines });
  }
}

if (violations.length > 0) {
  console.error(`check-file-length: ${violations.length} source file(s) exceed ${MAX_LINES} lines:`);
  for (const v of violations) {
    console.error(`  ${relative(ROOT, v.file)}: ${v.lines} lines`);
  }
  process.exit(1);
}

console.log(`check-file-length: OK (${files.length} files within ${MAX_LINES} lines).`);

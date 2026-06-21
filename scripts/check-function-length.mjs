#!/usr/bin/env node
// Enforces the AGENTS.md value-system rule:
//   "Functions must be no longer than 20 lines (excluding tests)."
// Walks src/ and counts the body lines of every function declaration
// (regular and async, exported or not). A function whose body exceeds the
// limit must be decomposed into smaller helpers.
//
// Note: this script intentionally only scans `function` keyword declarations,
// which is the convention used throughout src/. Arrow-function block bodies
// are not detected; extend this script if that convention changes.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BODY_LINES = 20;
const ROOT = fileURLToPath(new URL("../src", import.meta.url));
const FUNC_RE = /\b(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;

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

function findFunctionExtent(lines, startLine) {
  let depth = 0;
  let started = false;
  let openBrace = -1;
  for (let i = startLine; i < lines.length; i += 1) {
    for (const ch of lines[i]) {
      if (ch === "{") {
        depth += 1;
        started = true;
        if (openBrace === -1) openBrace = i;
      } else if (ch === "}") {
        depth -= 1;
      }
    }
    if (started && depth === 0) {
      return { openBrace, closeBrace: i };
    }
  }
  return null;
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  let m;
  while ((m = FUNC_RE.exec(src)) !== null) {
    const name = m[1];
    const sigLine = src.slice(0, m.index).split("\n").length - 1;
    const extent = findFunctionExtent(lines, sigLine);
    if (!extent) continue;
    const bodyLines = extent.closeBrace - extent.openBrace - 1;
    if (bodyLines > MAX_BODY_LINES) {
      violations.push({ file, name, bodyLines, line: sigLine + 1 });
    }
  }
}

if (violations.length > 0) {
  console.error(`check-function-length: ${violations.length} function(s) exceed ${MAX_BODY_LINES} body lines:`);
  for (const v of violations) {
    console.error(`  ${relative(ROOT, v.file)}:${v.line}  ${v.name}  (${v.bodyLines} body lines)`);
  }
  process.exit(1);
}

console.log(`check-function-length: OK (all functions within ${MAX_BODY_LINES} body lines).`);

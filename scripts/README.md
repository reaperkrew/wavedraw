# scripts

Lint-adjacent guards that enforce the value-system length rules from `AGENTS.md`. Both scripts are pure Node.js ESM (no dependencies) and exit non-zero on violations, so they slot into CI without extra setup.

## Scripts

### `check-file-length.mjs`

```bash
node scripts/check-file-length.mjs
# or: npm run check:file-length
```

Walks `src/` and fails if any `.ts` file exceeds **300 lines**. Test files live under `test/`, which is outside the scanned root, so the "excluding tests" carve-out is structural.

### `check-function-length.mjs`

```bash
node scripts/check-function-length.mjs
# or: npm run check:function-length
```

Walks `src/`, finds every `function` declaration, counts body lines (the lines between the opening `{` and matching closing `}`), and fails if any body exceeds **20 lines**. Arrow-function block bodies are intentionally not detected — `src/` uses `function` declarations throughout. Extend the script if that convention changes.

## Combined run

```bash
npm run check:lengths
```

Runs both scripts; used by the CI and Publish workflows after `lint` and before `test`.

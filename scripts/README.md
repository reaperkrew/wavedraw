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

### `generate-examples.mjs`

```bash
npm run build && node scripts/generate-examples.mjs
# or: npm run generate:examples
```

Regenerates the README hero assets (`docs/images/waveform.png` and `docs/images/mel-spectrogram.png`) from the local, gitignored `wavedraw-example.wav` at the repo root. The source WAV is intentionally not shipped (it is not part of the package), so this script is dev-only: it documents exactly how the committed example images were produced and lets a maintainer refresh them after renderer changes. It imports the built package from `../dist`, so run `npm run build` first.

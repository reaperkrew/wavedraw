# internal

Small pure utility functions shared across `wavedraw` submodules. Anything here must be:

- Pure (no I/O, no globals, no side effects).
- Free of dependencies on other `src/` submodules (this is the leaf layer).

## Modules

- `math.ts` — `clamp`.
- `ascii.ts` — `readAscii` for byte-slice-to-string reads.
- `validation.ts` — `validatePositiveInteger`.
- `time.ts` — `TimeOption`, `normalizeTimeOption`, `parseTimecode`, `normalizeTimeRange`, `validateTimeRange`.

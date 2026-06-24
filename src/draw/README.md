# draw

High-level convenience wrappers that compose `loadAudio` + `summarize*` + `render*` and optionally write the result to disk. This is the **only** submodule that performs filesystem writes, so callers who want pure behavior can stay entirely within `wav/`, `aiff/`, `waveform/`, `spectrogram/`, and `render/`.

## Public exports

- `drawWave(path, options)` — read an audio file (WAV or AIFF), summarize the waveform, render SVG or PNG, optionally write to `options.output` (or legacy `options.filename`), and return the rendered output (`string` for SVG, `Uint8Array` for PNG).
- `drawMelSpectrogram(path, options)` — same shape for Mel spectrograms.
- `loadAudio(path)` — read a file and dispatch to `parseWav` or `parseAiff` based on the first 4 bytes.
- `parseAudio(input)` — in-memory dispatcher: `RIFF` → `parseWav`, `FORM` → `parseAiff`.
- Types: `DrawWaveOptions`, `DrawMelSpectrogramOptions`.

## Internal modules

- `load.ts` — `loadAudio` / `parseAudio` magic-byte dispatcher (the single read edge for the draw helpers).
- `types.ts` — public option types (draw options accept the legacy `maximums`/`filename` fields, a `format` override, and `HH:MM:SS` time strings via `TimeOption`).
- `output.ts` — `writeDrawOutput` (handles both `string` and `Uint8Array` payloads), `resolveOutputFormat` (auto-detects `.png` extension or honors `options.format`), `DrawOutput`, `DrawFormat`.
- `wave.ts` — `drawWave`, `resolveWaveMetricsFromFlags`, `buildWaveformSummaryOptions`, `buildWaveformRenderOptions`.
- `spectrogram.ts` — `drawMelSpectrogram`, `buildMelSummaryOptions`, `buildMelRenderOptions`.

## Behavior notes

- `drawWave` accepts both the v1 `maximums` flag and the `peaks` flag (synonyms); both map to the `peaks` metric.
- When no metric flag is supplied, both `peaks` and `rms` are summarized.
- `start`/`end` accept seconds (number), the literals `"START"`/`"END"`, or `HH:MM:SS` strings.
- `output` is preferred over the legacy `filename` field; only one is needed.
- Output format is SVG by default, switching to PNG when `options.output`/`options.filename` ends in `.png`, or when `options.format: "png"` is set explicitly. The returned value matches the rendered format (`string` for SVG, `Uint8Array` for PNG).

# draw

High-level convenience wrappers that compose `readWavFile` + `summarize*` + `render*` and optionally write the SVG to disk. This is the **only** submodule that performs filesystem writes, so callers who want pure behavior can stay entirely within `wav/`, `waveform/`, `spectrogram/`, and `render/`.

## Public exports

- `drawWave(path, options)` — read a WAV file, summarize the waveform, render SVG, optionally write to `options.output` (or legacy `options.filename`), and return the SVG string.
- `drawMelSpectrogram(path, options)` — same shape for Mel spectrograms.
- Types: `DrawWaveOptions`, `DrawMelSpectrogramOptions`.

## Internal modules

- `types.ts` — public option types (draw options accept the legacy `maximums`/`filename` fields and `HH:MM:SS` time strings via `TimeOption`).
- `output.ts` — `writeSvgOutput` wraps the single `writeFile` call.
- `wave.ts` — `drawWave`, `resolveWaveMetricsFromFlags`, `buildWaveformSummaryOptions`, `buildWaveformRenderOptions`.
- `spectrogram.ts` — `drawMelSpectrogram`, `buildMelSummaryOptions`, `buildMelRenderOptions`.

## Behavior notes

- `drawWave` accepts both the v1 `maximums` flag and the v2 `peaks` flag (synonyms); both map to the `peaks` metric.
- When no metric flag is supplied, both `peaks` and `rms` are summarized.
- `start`/`end` accept seconds (number), the literals `"START"`/`"END"`, or `HH:MM:SS` strings.
- `output` is preferred over the legacy `filename` field; only one is needed.

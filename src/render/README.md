# render

SVG rendering for waveform summaries and Mel spectrogram summaries. Pure string builders; no DOM, canvas, or browser APIs. Zero runtime dependencies.

## Public exports

- `renderWaveformSvg(summary, options)` — returns an SVG string.
- `renderMelSpectrogramSvg(summary, options)` — returns an SVG string.
- Types: `WaveformLayerStyle`, `RenderWaveformSvgOptions`, `RenderMelSpectrogramSvgOptions`.

## Internal modules

- `types.ts` — public option types.
- `color.ts` — `normalizeColorStops`, `parseHexColor`, `interpolateColorStops`, `rgbToHex`, `toHexByte`.
- `format.ts` — `escapeAttribute`, `formatNumber` (pure string helpers).
- `svg.ts` — `openSvg`, `renderBackground`, `closeSvg` (shared SVG primitives).
- `layer.ts` — `resolveWaveformLayers`, `normalizeLayer`, `buildWaveformGeometry`, `validateWaveformPadding`.
- `waveform-svg.ts` — `renderWaveformSvg` orchestration plus per-layer renderers (`renderPeaksLayer`, `renderRmsLayer`, `renderAverageLayer`).
- `spectrogram-svg.ts` — `renderMelSpectrogramSvg` orchestration plus `renderMelCells`, `renderMelCell`, `buildSpectrogramGeometry`, `validateSpectrogramPadding`.

## Behavior notes

- Waveform layers render in order: peaks (vertical lines), RMS (symmetric vertical lines at 0.7 opacity), average (polyline).
- A layer is omitted when the option is `false`, or when the corresponding column data (e.g. `rms`) is missing.
- Spectrogram cells are emitted as one `<rect>` per (column, Mel band); cell width/height are snapped to integer pixel boundaries via `ceil`/`floor`.
- All color attributes are interpolated from a normalized color-stop list.

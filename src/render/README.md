# render

SVG and PNG rendering for waveform summaries and Mel spectrogram summaries. Pure string/byte builders; no DOM, canvas, or browser APIs. Zero runtime dependencies (PNG uses Node's built-in `node:zlib` for IDAT deflate).

## Public exports

- `renderWaveformSvg(summary, options)` — returns an SVG string.
- `renderMelSpectrogramSvg(summary, options)` — returns an SVG string.
- `renderWaveformPng(summary, options)` — returns a PNG `Uint8Array`.
- `renderMelSpectrogramPng(summary, options)` — returns a PNG `Uint8Array`.
- Types: `WaveformLayerStyle`, `RenderWaveformSvgOptions`, `RenderMelSpectrogramSvgOptions`, `RenderWaveformPngOptions`, `RenderMelSpectrogramPngOptions`, `ColormapName`.

## Internal modules

- `types.ts` — public option types (SVG interfaces plus PNG type aliases).
- `color.ts` — `normalizeColorStops`, `parseHexColor`, `parseHexColorRgba`, `interpolateColorStops`, `interpolateColorStopsRgb`, `withAlpha`, `rgbToHex`, `toHexByte`.
- `colormaps.ts` — `resolveColormap`, `isColormapName`, `resolveSpectrogramColors`, `DEFAULT_SPECTRUM_COLORS`, `ColormapName`. Named presets (`viridis`/`magma`/`plasma`/`inferno`/`turbo`/`cividis`/`grayscale`) sampled from matplotlib LUTs.
- `format.ts` — `escapeAttribute`, `formatNumber` (pure string helpers).
- `svg.ts` — `openSvg`, `renderBackground`, `closeSvg` (shared SVG primitives).
- `layer.ts` — `resolveWaveformLayers`, `normalizeLayer`, `buildWaveformGeometry`, `validateWaveformPadding`.
- `waveform-svg.ts` — `renderWaveformSvg` orchestration plus per-layer renderers (`renderPeaksLayer`, `renderRmsLayer`, `renderAverageLayer`).
- `spectrogram-svg.ts` — `renderMelSpectrogramSvg` orchestration plus `renderMelCells`, `renderMelCell`, `buildSpectrogramGeometry`, `validateSpectrogramPadding`.
- `png/` — PNG rasterizer submodule; see `png/README.md`.

## Behavior notes

- Waveform layers render in order: peaks (vertical lines), RMS (symmetric vertical lines at 0.7 opacity), average (polyline).
- A layer is omitted when the option is `false`, or when the corresponding column data (e.g. `rms`) is missing.
- Spectrogram cells are emitted as one `<rect>` per (column, Mel band); cell width/height are snapped to integer pixel boundaries via `ceil`/`floor`.
- All color attributes are interpolated from a normalized color-stop list.
- Spectrograms accept a named `colormap` preset that overrides `colors`; precedence is `colormap` > `colors` > `DEFAULT_SPECTRUM_COLORS`.
- SVG and PNG renderers share geometry and color helpers, so output stays aligned across formats.

# render/png

Optional PNG rasterizer. Produces 8-bit RGBA PNG `Uint8Array` output from the same waveform and spectrogram summaries used by the SVG renderer. Zero runtime dependencies: PNG chunk encoding, CRC32, and pixel rasterization are all implemented locally; the only external used is Node's built-in `node:zlib` for IDAT deflate compression, which ships with Node.

## Public exports

- `renderWaveformPng(summary, options)` — returns a PNG `Uint8Array`.
- `renderMelSpectrogramPng(summary, options)` — returns a PNG `Uint8Array`.
- `renderLinearSpectrogramPng(summary, options)` — returns a PNG `Uint8Array`.
- Types: `RenderWaveformPngOptions`, `RenderMelSpectrogramPngOptions`, `RenderLinearSpectrogramPngOptions` (structurally identical to the SVG render options).

## Internal modules

- `binary.ts` — `crc32`, `buildCrcTable`, `writeUInt32BE`, `asciiBytes`, `concatBytes` (big-endian byte helpers and IEEE CRC32).
- `bitmap.ts` — `Bitmap` interface plus `createBitmap`, `fillBitmap`, `setPixel`, `blendPixel`, `writePixel` (RGBA8 raster buffer with source-over alpha blending).
- `draw.ts` — `drawVerticalLine`, `drawLine` (Bresenham), `fillRect` (vector-to-raster primitives).
- `encoder.ts` — `encodePng`, `encodeIhdr`, `encodeIdat`, `encodeChunk`, `buildRawScanlines`, plus `PNG_SIGNATURE` (PNG chunk layout per RFC 2083).
- `waveform-png.ts` — `renderWaveformPng` orchestration plus `rasterizeWaveformChannel`, `rasterizePeaks`, `rasterizeRms`, `rasterizeAverage`.
- `spectrogram-png.ts` — `renderMelSpectrogramPng` orchestration (delegates cell rasterization to `spectrogram-shared.ts`).
- `linear-spectrogram-png.ts` — `renderLinearSpectrogramPng` orchestration (shares cell rasterization with the Mel path).
- `spectrogram-shared.ts` — `rasterizeSpectrogramCellsPng`, `rasterizeSpectrogramCellPng` (shared raster cell rendering for both Mel and linear spectrograms).
- `types.ts` — PNG render option type aliases.

## Behavior notes

- Waveform geometry and layer resolution are reused from `render/layer.ts`, so SVG and PNG output stay aligned on padding, mid-line, and per-column x positions.
- Spectrogram geometry is reused from `render/spectrogram-svg.ts`; cells are snapped to integer pixel boundaries with `floor`/`ceil` so adjacent cells never leave gaps.
- The RMS layer renders at 0.7 alpha via source-over blending, mirroring the SVG renderer's `opacity="0.7"`.
- Transparent backgrounds are supported (omit `options.background`); pixels default to zero alpha and layers composite over them.
- Scanlines use PNG filter type 0 (None); IDAT is compressed with `zlib.deflateSync` from `node:zlib`.

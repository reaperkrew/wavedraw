# wavedraw v2 PRD

## Summary

Rebuild `wavedraw` as a modern TypeScript npm library for extracting waveform data from WAV audio and rendering waveform images with minimal dependencies. Version 2 should replace the legacy CommonJS implementation with a typed, tested, secure package that supports accurate peak and RMS waveform generation today and establishes a clean foundation for Mel spectrogram rendering later.

The current v1 package is small but brittle: it assumes a fixed 44-byte WAV header, only reliably handles 16-bit PCM mono files, has weak async tests, depends on an old image library chain, and exposes a file-path-centered API that mixes parsing, analysis, rendering, and file output. v2 should be a breaking major release with a clearer API and a smaller, auditable surface area.

## Current State

- Package version: `1.1.0`.
- Entry point: `index.js` re-exports `lib/wavedraw.js`.
- Runtime dependency: `pureimage@^0.1.6`.
- Runtime transitive dependencies from lockfile: `jpeg-js@0.3.4`, `opentype.js@0.4.11`, `pngjs@3.3.3`.
- Dev tooling: Mocha 7, ESLint 6, Airbnb config, `expect.js`.
- Existing features:
  - Read a WAV file from disk.
  - Parse a fixed-position RIFF/WAVE header.
  - Compute per-column maximum, average, RMS, and a basic DFT.
  - Render a PNG waveform to a file path.
- Existing limitations:
  - Assumes audio data starts at byte 44.
  - Does not scan RIFF chunks, so files with metadata or nonstandard chunk order can parse incorrectly.
  - Public docs only promise mono WAV usage.
  - Only 16-bit PCM rendering is supported.
  - Uses `Int16Array` directly over read buffers without explicit endianness handling.
  - Time parsing is string-only and validates against a lossy `{ hours, minutes, seconds }` duration.
  - Rendering and analysis are coupled to filesystem output.
  - Tests do not reliably await rejected promises.
  - No TypeScript types, package exports map, or modern build pipeline.
  - `node`/`npm` were not available in the current execution environment, so live audit and test execution remain implementation gates.

## Goals

1. Ship a major-version TypeScript rewrite with a stable, documented public API.
2. Minimize runtime dependencies, targeting zero runtime dependencies for WAV parsing and waveform analysis.
3. Keep image rendering dependency-light and isolated behind a renderer boundary.
4. Support accurate waveform summaries, including positive and negative peaks and RMS.
5. Support common PCM WAV inputs robustly through chunk-aware RIFF parsing.
6. Provide ESM-first packaging with CJS compatibility where practical.
7. Add comprehensive tests for parsing, sample extraction, waveform statistics, rendering, errors, and package exports.
8. Establish a clean internal architecture for later Mel spectrogram work without overbuilding v2.
9. Publish as a secure package with current dev tooling and zero known audit vulnerabilities at release time.

## Non-Goals For v2.0

- Full Mel spectrogram rendering in the initial v2.0 release.
- MP3, FLAC, OGG, AAC, or browser decoding support.
- Real-time audio streaming.
- Native dependencies.
- Font/text rendering in generated images.
- A CLI unless it falls out naturally after the library API is complete.

## Target Users

- Node.js developers who need server-side waveform previews for WAV files.
- Audio tooling authors who want waveform summary data without committing to a renderer.
- Applications that need deterministic, dependency-light audio visualization in CI or backend jobs.

## Runtime Support

- Node.js LTS baseline: Node 20+.
- TypeScript: generate declarations from source.
- Module output:
  - ESM as the primary target.
  - CJS compatibility via conditional package exports if the build toolchain supports it without complexity.
- Browser support is not required for v2.0, but core analysis code should avoid Node-only APIs when reasonable.

## Proposed Package Shape

```text
src/
  index.ts
  wav/
    parse.ts
    read.ts
    types.ts
  waveform/
    summarize.ts
    rms.ts
    peaks.ts
    types.ts
  render/
    svg.ts
    png.ts
    types.ts
  spectrogram/
    roadmap.ts
test/
  fixtures/
  *.test.ts
docs/
  PRD.md
```

## Dependency Policy

- Core WAV parsing and waveform summarization must have zero runtime dependencies.
- Prefer SVG rendering as the default image output because it can be generated with no runtime dependency.
- PNG rendering should be optional and isolated:
  - Option A: built-in minimal PNG encoder if scope remains small and maintainable.
  - Option B: optional peer dependency for PNG encoding.
  - Option C: separate package later, such as `@wavedraw/png`.
- Avoid canvas libraries, font libraries, native dependencies, and broad image stacks in the core package.
- Dev dependencies should be modern, actively maintained, and limited to essentials:
  - TypeScript.
  - A fast test runner such as Vitest or Node's built-in test runner.
  - A focused build tool such as `tsup` or `tsc` only.
  - A formatter/linter only if it adds clear value.
- Release gate: `npm audit --omit=optional` and full audit must report zero high or critical vulnerabilities.

## Public API Proposal

Prefer functional APIs over a stateful class. Keep path-based convenience functions, but allow buffers for callers that already have audio data.

```ts
import {
  parseWav,
  readWavFile,
  summarizeWaveform,
  renderWaveformSvg,
  renderWaveformPng
} from "wavedraw";
```

### `readWavFile(path, options?)`

Reads and parses a WAV file from disk.

```ts
const audio = await readWavFile("input.wav");
```

Returns:

```ts
interface WavAudio {
  format: WavFormat;
  channels: Float32Array[];
  frames: number;
  durationSeconds: number;
}
```

### `parseWav(input, options?)`

Parses a `Buffer`, `ArrayBuffer`, or `Uint8Array`.

```ts
const audio = parseWav(buffer);
```

### `summarizeWaveform(audio, options)`

Generates per-column waveform data independent of rendering.

```ts
const waveform = summarizeWaveform(audio, {
  width: 1200,
  channel: "mix",
  startSeconds: 0,
  endSeconds: 30,
  metrics: ["peaks", "rms"]
});
```

Returns:

```ts
interface WaveformSummary {
  width: number;
  sampleRate: number;
  startSeconds: number;
  endSeconds: number;
  channels: WaveformChannelSummary[];
}

interface WaveformColumn {
  min: number;      // normalized -1..1
  max: number;      // normalized -1..1
  rms: number;      // normalized 0..1
  avg?: number;     // normalized -1..1
}
```

### `renderWaveformSvg(summary, options)`

Returns an SVG string.

```ts
const svg = renderWaveformSvg(waveform, {
  width: 1200,
  height: 300,
  layers: {
    peaks: { color: "#2563eb" },
    rms: { color: "#60a5fa" }
  },
  background: "#ffffff"
});
```

### `renderWaveformPng(summary, options)`

Returns a PNG `Uint8Array` or `Buffer`. PNG support may be optional if it would require a runtime dependency.

```ts
const png = await renderWaveformPng(waveform, {
  width: 1200,
  height: 300
});
```

### Compatibility Helper

Optionally provide a v1-like helper for migration:

```ts
await drawWave("input.wav", {
  width: 600,
  height: 300,
  rms: true,
  peaks: true,
  output: "wave.svg"
});
```

This should be implemented as a thin wrapper over the new parse, summarize, and render functions.

## WAV Parsing Requirements

Must support:

- RIFF/WAVE PCM files.
- Little-endian PCM sample data.
- `fmt ` and `data` chunks discovered by scanning chunks, not fixed byte offsets.
- Unknown chunks skipped safely.
- Mono and stereo files.
- 8-bit unsigned PCM.
- 16-bit signed PCM.
- 24-bit signed PCM.
- 32-bit signed PCM.
- 32-bit float WAV if implementation cost is reasonable for v2.0; otherwise mark as v2.1.

Must validate:

- RIFF chunk ID.
- WAVE format ID.
- Required `fmt ` chunk.
- Required `data` chunk.
- Supported audio format.
- Valid channel count.
- Valid sample rate.
- Valid block alignment and byte rate consistency.
- Data length aligned to frame size.
- Start/end ranges.
- Width and height as positive integers.

Should expose:

```ts
interface WavFormat {
  audioFormat: "pcm" | "float";
  channels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: 8 | 16 | 24 | 32;
  dataOffset: number;
  dataLength: number;
}
```

## Waveform Requirements

- Per-column summarization should divide the selected frame range evenly across requested width.
- Every selected frame should contribute to exactly one column unless the selection is smaller than the width.
- Columns with no samples should be handled deterministically.
- Peak output should preserve negative minimum and positive maximum.
- RMS should be computed as `sqrt(mean(sample^2))`.
- Multi-channel behavior:
  - `channel: number` uses one channel.
  - `channel: "mix"` averages channels per frame before summarization.
  - `channel: "all"` returns one summary per channel.
- All sample values should be normalized to `[-1, 1]`.
- No `Math.max.apply` over large arrays; use streaming loops to avoid stack and memory problems.

## Rendering Requirements

SVG renderer:

- Default renderer for v2.0.
- Zero runtime dependencies.
- Deterministic output for snapshot tests.
- Render peaks and RMS as separate layers.
- Support transparent or solid background.
- Support configurable colors, stroke widths, and vertical padding.
- Must not require DOM, canvas, or browser APIs.

PNG renderer:

- Optional for v2.0 if dependency-free PNG encoding is not practical.
- Must not pull in a broad canvas or font stack.
- If omitted from v2.0, provide a documented SVG-first migration path and track PNG as v2.1.

## Mel Spectrogram Roadmap

Do not implement in v2.0 unless waveform rewrite finishes cleanly ahead of schedule. Instead, design the API and internal boundaries so spectrogram work has a natural place.

Future spectrogram requirements:

- Frame audio with configurable FFT size and hop length.
- Window functions: Hann required; Hamming optional.
- FFT implementation:
  - Prefer small internal radix-2 FFT if dependency-free and tested.
  - Consider an optional dependency only if accuracy/performance clearly justify it.
- Mel filter bank generation.
- Power-to-dB conversion.
- Colormap rendering.
- SVG may be insufficient for dense spectrograms; PNG support likely becomes more important here.

Reserved future API:

```ts
const spectrogram = computeMelSpectrogram(audio, {
  fftSize: 2048,
  hopLength: 512,
  melBands: 128,
  minHz: 20,
  maxHz: 8000
});
```

## Migration From v1

Breaking changes:

- Package becomes TypeScript-authored.
- Class constructor API is no longer primary.
- Time inputs prefer seconds as numbers over `HH:MM:SS` strings.
- `maximums` should be renamed to `peaks`.
- Rendering no longer writes to `wave.png` by default.
- SVG becomes the default output unless PNG support remains in core.

Migration support:

- Provide a `drawWave()` helper for common v1 usage.
- Document old-to-new option names.
- Keep error messages clear, but do not preserve exact legacy error strings.

## Test Plan

Unit tests:

- WAV parser rejects invalid RIFF/WAVE input.
- WAV parser scans chunks and handles metadata before `data`.
- PCM 8/16/24/32 sample decoding normalizes correctly.
- Mono, stereo, mixdown, and all-channel summaries.
- Peak, average, and RMS calculations on known arrays.
- Selection by `startSeconds` and `endSeconds`.
- Width greater than selected frames.
- Large buffers do not use spread/apply patterns.
- SVG output snapshots.
- Public package exports.

Integration tests:

- Parse fixture WAV files and render SVG.
- Optional PNG output has valid PNG signature and stable dimensions.
- v1-style `drawWave()` helper works for the README example equivalent.

Security and release tests:

- `npm audit` succeeds with no high or critical vulnerabilities.
- `npm pack --dry-run` includes only intended files.
- Type declarations compile in a consumer fixture.
- ESM import works.
- CJS require works if CJS compatibility is shipped.

## Documentation Requirements

- Rewrite README around v2 API.
- Include installation, quick start, waveform data extraction, SVG rendering, optional PNG rendering, and migration notes.
- Document supported WAV formats.
- Document dependency policy.
- Add examples for:
  - Generate SVG from a file.
  - Get waveform JSON only.
  - Render peaks and RMS together.
  - Select a time range.
  - Handle stereo mixdown.

## Release Criteria

- Version bumped to `2.0.0`.
- TypeScript source builds from clean checkout.
- Test suite passes.
- Audit gate passes in an environment with `node` and `npm`.
- README reflects v2 behavior.
- Generated package contains built files, declarations, README, and license only.
- No legacy `dist/` generated artifacts are published unless intentionally used as fixtures.
- Branch is ready for PR review with clear implementation notes and migration guidance.

## Open Decisions

1. Should v2.0 include PNG output, or should v2.0 be SVG-first with PNG in v2.1?
2. Should the package remain named `wavedraw` only, or should optional renderers eventually become subpackages?
3. Should CJS compatibility be required, or is ESM-only acceptable for the major release?
4. Should 32-bit float WAV be required for v2.0 or deferred to v2.1?
5. Should a CLI be included after the library API stabilizes?

## Recommended Implementation Sequence

1. Replace package scaffolding with TypeScript, modern tests, package exports, and version `2.0.0`.
2. Implement chunk-aware WAV parser and normalized PCM decoding.
3. Implement dependency-free waveform summarization for peaks, RMS, and average.
4. Implement SVG renderer.
5. Add v1-style `drawWave()` compatibility helper.
6. Rewrite README and examples.
7. Decide PNG strategy and implement or defer explicitly.
8. Run full build, tests, audit, and package dry run in a Node/npm-capable environment.

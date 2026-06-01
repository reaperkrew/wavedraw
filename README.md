# wavedraw

Dependency-light WAV parsing and waveform rendering for Node.js.

`wavedraw` v2 is a TypeScript rewrite. The core package has no runtime dependencies: it parses WAV data, summarizes peaks/RMS/average waveform columns, and renders SVG directly.

## Installation

```bash
npm install wavedraw
```

## Quick Start

```ts
import { drawWave } from "wavedraw";

await drawWave("input.wav", {
  width: 600,
  height: 300,
  maximums: true,
  rms: true,
  output: "wave.svg",
  colors: {
    maximums: "#2563eb",
    rms: "#60a5fa",
    background: "#ffffff"
  }
});
```

## Extract Waveform Data

```ts
import { readWavFile, summarizeWaveform } from "wavedraw";

const audio = await readWavFile("input.wav");
const waveform = summarizeWaveform(audio, {
  width: 1200,
  channel: "mix",
  metrics: ["peaks", "rms"],
  startSeconds: 0,
  endSeconds: 30
});
```

## Render SVG

```ts
import { renderWaveformSvg } from "wavedraw";

const svg = renderWaveformSvg(waveform, {
  width: 1200,
  height: 300,
  background: "#fff",
  layers: {
    peaks: { color: "#2563eb" },
    rms: { color: "#60a5fa" }
  }
});
```

## Supported WAV Input

- RIFF/WAVE PCM files with chunk-aware parsing.
- Mono and stereo.
- 8-bit unsigned PCM.
- 16-bit signed PCM.
- 24-bit signed PCM.
- 32-bit signed PCM.
- 32-bit float WAV.

## v1 Migration Notes

- The old class API is replaced by functions.
- `maximums` is still accepted by `drawWave()`, but the lower-level API calls this metric `peaks`.
- SVG is the default renderer. PNG output is intentionally not part of the v2.0 core dependency surface.
- Time ranges should use seconds. `drawWave()` still accepts legacy `HH:MM:SS` strings for `start` and `end`.

## Roadmap

- Optional PNG rendering without a broad canvas dependency.
- Mel spectrogram analysis and rendering.

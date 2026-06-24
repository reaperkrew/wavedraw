#!/usr/bin/env node
// Regenerates the README example assets in docs/images/ from wavedraw-example.wav.
// Run after `npm run build` so that ../dist is present:
//
//   npm run build && node scripts/generate-examples.mjs
//
// The source WAV is gitignored and expected at the repo root; it is not shipped
// with the package. The rendered PNGs are committed and consumed by README.md.

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { drawLinearSpectrogram, drawMelSpectrogram, drawWave } from "../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const input = resolve(root, "wavedraw-example.wav");
const imagesDir = resolve(root, "docs", "images");

const waveformOptions = {
  width: 1200,
  height: 300,
  peaks: true,
  rms: true,
  background: "#ffffff",
  colors: { peaks: "#2563eb", rms: "#60a5fa" },
  output: resolve(imagesDir, "waveform.png"),
  format: "png"
};

const melOptions = {
  width: 1200,
  height: 360,
  fftSize: 1024,
  melBands: 80,
  minFrequency: 20,
  maxFrequency: 8000,
  dynamicRangeDb: 80,
  background: "#020617",
  colors: ["#020617", "#0f766e", "#facc15", "#f8fafc"],
  output: resolve(imagesDir, "mel-spectrogram.png"),
  format: "png"
};

const melBase = {
  width: 1200,
  height: 200,
  fftSize: 1024,
  melBands: 80,
  minFrequency: 20,
  maxFrequency: 8000,
  dynamicRangeDb: 80,
  format: "png"
};

const linearOptions = {
  width: 1200,
  height: 360,
  fftSize: 1024,
  bins: 256,
  minFrequency: 20,
  maxFrequency: 8000,
  dynamicRangeDb: 80,
  colormap: "magma",
  output: resolve(imagesDir, "linear-spectrogram.png"),
  format: "png"
};

const axesOptions = {
  width: 1200,
  height: 360,
  fftSize: 1024,
  melBands: 80,
  minFrequency: 20,
  maxFrequency: 8000,
  dynamicRangeDb: 80,
  padding: 48,
  colormap: "viridis",
  background: "#020617",
  axes: { enabled: true },
  output: resolve(imagesDir, "mel-spectrogram-axes.png"),
  format: "png"
};

const colormaps = ["viridis", "magma", "plasma", "inferno", "turbo", "cividis", "grayscale"];

function colormapOptions(colormap) {
  return { ...melBase, colormap, output: resolve(imagesDir, `mel-${colormap}.png`) };
}

async function renderColormaps() {
  for (const colormap of colormaps) {
    await drawMelSpectrogram(input, colormapOptions(colormap));
  }
}

await mkdir(imagesDir, { recursive: true });
await drawWave(input, waveformOptions);
await drawMelSpectrogram(input, melOptions);
await drawMelSpectrogram(input, axesOptions);
await drawLinearSpectrogram(input, linearOptions);
await renderColormaps();
console.log("Generated waveform, mel-spectrogram, mel-spectrogram-axes, linear-spectrogram, and colormap preset PNGs");

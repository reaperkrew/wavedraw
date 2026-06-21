import { clamp } from "../internal/math.js";
import { computePowerSpectrum } from "./spectrum.js";
import type { MelSpectrogramFrame } from "./types.js";

export interface RawMelFrame {
  values: number[];
}

export interface MelFrameAccumulator {
  frames: RawMelFrame[];
  maxDecibels: number;
}

export function computeMelFrames(
  samples: Float32Array,
  startFrame: number,
  endFrame: number,
  width: number,
  fftSize: number,
  window: Float64Array,
  filterbank: number[][]
): MelFrameAccumulator {
  const selectedFrames = endFrame - startFrame;
  const frames: RawMelFrame[] = [];
  let maxDecibels = Number.NEGATIVE_INFINITY;

  for (let x = 0; x < width; x += 1) {
    const frameStart = startFrame + Math.floor((x * selectedFrames) / width);
    const powerSpectrum = computePowerSpectrum(samples, frameStart, endFrame, fftSize, window);
    const values = filterbank.map((weights) => computeBandDecibels(powerSpectrum, weights));
    frames.push({ values });
    maxDecibels = maxValue(values, maxDecibels);
  }

  return { frames, maxDecibels: Number.isFinite(maxDecibels) ? maxDecibels : -120 };
}

export function maxValue(values: number[], fallback: number): number {
  let result = fallback;
  for (const value of values) {
    if (value > result) result = value;
  }
  return result;
}

export function computeBandDecibels(powerSpectrum: number[], weights: number[]): number {
  let energy = 0;
  for (let index = 0; index < weights.length; index += 1) {
    energy += (powerSpectrum[index] ?? 0) * (weights[index] ?? 0);
  }
  return 10 * Math.log10(Math.max(energy, 1e-12));
}

export function normalizeMelFrames(frames: RawMelFrame[], maxDecibels: number, dynamicRangeDb: number): MelSpectrogramFrame[] {
  const minDecibels = maxDecibels - dynamicRangeDb;
  return frames.map((frame) => ({
    values: frame.values.map((value) => clamp((value - minDecibels) / dynamicRangeDb, 0, 1))
  }));
}

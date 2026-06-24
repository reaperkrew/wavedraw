import { clamp } from "../internal/math.js";
import { validatePositiveInteger } from "../internal/validation.js";
import type { WavAudio } from "../wav/types.js";
import { computePowerSpectrum } from "./spectrum.js";
import { maxValue } from "./frames.js";
import { resolveLinearOptions } from "./linear-options.js";
import { createWindow } from "./windows.js";
import { selectSpectrogramSamples } from "./summarize.js";
import type {
  BinRange,
  LinearSpectrogramFrame,
  LinearSpectrogramSummary,
  ResolvedLinearOptions,
  SummarizeLinearSpectrogramOptions
} from "./linear-types.js";

export function summarizeLinearSpectrogram(audio: WavAudio, options: SummarizeLinearSpectrogramOptions): LinearSpectrogramSummary {
  validatePositiveInteger("width", options.width);
  const resolved = resolveLinearOptions(audio, options);
  const startFrame = Math.floor(resolved.startSeconds * audio.format.sampleRate);
  const endFrame = Math.min(audio.frames, Math.ceil(resolved.endSeconds * audio.format.sampleRate));
  const selectedFrames = Math.max(0, endFrame - startFrame);
  const samples = selectSpectrogramSamples(audio, options.channel ?? "mix");
  const window = createWindow(resolved.window, resolved.fftSize);
  const binRanges = buildBinRanges(resolved, audio.format.sampleRate);
  const accumulator = computeLinearFrames(samples, startFrame, endFrame, options.width, resolved.fftSize, window, binRanges);
  const spectrogram = normalizeLinearFrames(accumulator.frames, accumulator.maxDecibels, resolved.dynamicRangeDb);
  return buildLinearSummary(audio, options, resolved, selectedFrames, spectrogram, accumulator.maxDecibels);
}

interface RawLinearFrame {
  values: number[];
}

export interface LinearFrameAccumulator {
  frames: RawLinearFrame[];
  maxDecibels: number;
}

export function computeLinearFrames(
  samples: Float32Array,
  startFrame: number,
  endFrame: number,
  width: number,
  fftSize: number,
  window: Float64Array,
  binRanges: BinRange[]
): LinearFrameAccumulator {
  const selectedFrames = endFrame - startFrame;
  const frames: RawLinearFrame[] = [];
  let maxDecibels = Number.NEGATIVE_INFINITY;
  for (let x = 0; x < width; x += 1) {
    const frameStart = startFrame + Math.floor((x * selectedFrames) / width);
    const powerSpectrum = computePowerSpectrum(samples, frameStart, endFrame, fftSize, window);
    const values = binRanges.map((range) => sumBinDecibels(powerSpectrum, range.start, range.end));
    frames.push({ values });
    maxDecibels = maxValue(values, maxDecibels);
  }
  return { frames, maxDecibels: Number.isFinite(maxDecibels) ? maxDecibels : -120 };
}

export function sumBinDecibels(powerSpectrum: number[], start: number, end: number): number {
  let energy = 0;
  for (let index = start; index <= end; index += 1) {
    energy += powerSpectrum[index] ?? 0;
  }
  return 10 * Math.log10(Math.max(energy, 1e-12));
}

export function buildBinRanges(resolved: ResolvedLinearOptions, sampleRate: number): BinRange[] {
  const maxBin = Math.floor(resolved.fftSize / 2);
  const binWidth = (resolved.maxFrequency - resolved.minFrequency) / resolved.bins;
  return Array.from({ length: resolved.bins }, (_, j) => buildBinRange(resolved.minFrequency + j * binWidth, resolved.minFrequency + (j + 1) * binWidth, resolved.fftSize, sampleRate, maxBin));
}

export function buildBinRange(minFrequency: number, maxFrequency: number, fftSize: number, sampleRate: number, maxBin: number): BinRange {
  const start = clamp(Math.floor((minFrequency * fftSize) / sampleRate), 0, maxBin);
  const end = clamp(Math.ceil((maxFrequency * fftSize) / sampleRate) - 1, 0, maxBin);
  return { start, end: Math.max(start, end) };
}

export function normalizeLinearFrames(frames: RawLinearFrame[], maxDecibels: number, dynamicRangeDb: number): LinearSpectrogramFrame[] {
  const minDecibels = maxDecibels - dynamicRangeDb;
  return frames.map((frame) => ({
    values: frame.values.map((value) => clamp((value - minDecibels) / dynamicRangeDb, 0, 1))
  }));
}

export function buildLinearSummary(
  audio: WavAudio,
  options: SummarizeLinearSpectrogramOptions,
  resolved: ResolvedLinearOptions,
  selectedFrames: number,
  spectrogram: LinearSpectrogramFrame[],
  maxDecibels: number
): LinearSpectrogramSummary {
  return {
    width: options.width,
    sampleRate: audio.format.sampleRate,
    startSeconds: resolved.startSeconds,
    endSeconds: resolved.endSeconds,
    frames: selectedFrames,
    fftSize: resolved.fftSize,
    bins: resolved.bins,
    minFrequency: resolved.minFrequency,
    maxFrequency: resolved.maxFrequency,
    minDecibels: maxDecibels - resolved.dynamicRangeDb,
    maxDecibels,
    spectrogram
  };
}

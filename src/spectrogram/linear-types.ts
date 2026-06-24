import type { SpectrogramChannel } from "./types.js";
import type { WindowType } from "./windows.js";

export interface SummarizeLinearSpectrogramOptions {
  width: number;
  channel?: SpectrogramChannel;
  startSeconds?: number;
  endSeconds?: number;
  fftSize?: number;
  bins?: number;
  minFrequency?: number;
  maxFrequency?: number;
  dynamicRangeDb?: number;
  window?: WindowType;
}

export interface LinearSpectrogramFrame {
  values: number[];
}

export interface LinearSpectrogramSummary {
  width: number;
  sampleRate: number;
  startSeconds: number;
  endSeconds: number;
  frames: number;
  fftSize: number;
  bins: number;
  minFrequency: number;
  maxFrequency: number;
  minDecibels: number;
  maxDecibels: number;
  spectrogram: LinearSpectrogramFrame[];
}

export interface ResolvedLinearOptions {
  fftSize: number;
  bins: number;
  minFrequency: number;
  maxFrequency: number;
  dynamicRangeDb: number;
  startSeconds: number;
  endSeconds: number;
  window: WindowType;
}

export interface BinRange {
  start: number;
  end: number;
}

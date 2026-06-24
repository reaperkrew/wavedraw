import { normalizeTimeRange } from "../internal/time.js";
import { validatePositiveInteger } from "../internal/validation.js";
import type { WavAudio } from "../wav/types.js";
import { resolveDynamicRangeDb, resolveFftSize, resolveFrequencyRange } from "./options.js";
import { resolveWindowType } from "./windows.js";
import type { ResolvedLinearOptions, SummarizeLinearSpectrogramOptions } from "./linear-types.js";

export function resolveLinearOptions(audio: WavAudio, options: SummarizeLinearSpectrogramOptions): ResolvedLinearOptions {
  const fftSize = resolveFftSize(options.fftSize);
  const bins = resolveBins(options.bins, fftSize);
  const frequencies = resolveFrequencyRange(audio.format.sampleRate, options.minFrequency, options.maxFrequency);
  const dynamicRangeDb = resolveDynamicRangeDb(options.dynamicRangeDb);
  const window = resolveWindowType(options.window);
  const timeRange = normalizeTimeRange(audio.durationSeconds, options.startSeconds, options.endSeconds);
  return { fftSize, bins, ...frequencies, dynamicRangeDb, window, ...timeRange };
}

export function resolveBins(value: number | undefined, fftSize: number): number {
  const bins = value ?? Math.floor(fftSize / 2) + 1;
  validatePositiveInteger("bins", bins);
  return bins;
}

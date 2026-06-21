import { validatePositiveInteger } from "../internal/validation.js";
import { normalizeTimeRange } from "../internal/time.js";
import type { WavAudio } from "../wav/types.js";
import { selectChannels, type ChannelSelection } from "./channels.js";
import { summarizeChannel } from "./column.js";
import { resolveWaveformMetrics } from "./metrics.js";
import type { SummarizeWaveformOptions, WaveformMetric, WaveformSummary } from "./types.js";

export function summarizeWaveform(audio: WavAudio, options: SummarizeWaveformOptions): WaveformSummary {
  validatePositiveInteger("width", options.width);
  const range = normalizeTimeRange(audio.durationSeconds, options.startSeconds, options.endSeconds);
  const frames = computeWaveformFrameRange(audio, range.startSeconds, range.endSeconds);
  const metrics = resolveWaveformMetrics(options.metrics);
  const channels = selectChannels(audio, options.channel ?? "mix");
  return buildWaveformSummary(audio, options, range, frames, channels, metrics);
}

export interface WaveformFrameRange {
  startFrame: number;
  endFrame: number;
  selectedFrames: number;
}

export function computeWaveformFrameRange(audio: WavAudio, startSeconds: number, endSeconds: number): WaveformFrameRange {
  const startFrame = Math.floor(startSeconds * audio.format.sampleRate);
  const endFrame = Math.min(audio.frames, Math.ceil(endSeconds * audio.format.sampleRate));
  return { startFrame, endFrame, selectedFrames: Math.max(0, endFrame - startFrame) };
}

export function buildWaveformSummary(
  audio: WavAudio,
  options: SummarizeWaveformOptions,
  range: { startSeconds: number; endSeconds: number },
  frames: WaveformFrameRange,
  channels: ChannelSelection[],
  metrics: Set<WaveformMetric>
): WaveformSummary {
  return {
    width: options.width,
    sampleRate: audio.format.sampleRate,
    startSeconds: range.startSeconds,
    endSeconds: range.endSeconds,
    frames: frames.selectedFrames,
    channels: channels.map((channel) => ({
      channel: channel.channel,
      columns: summarizeChannel(channel.samples, frames.startFrame, frames.endFrame, options.width, metrics)
    }))
  };
}

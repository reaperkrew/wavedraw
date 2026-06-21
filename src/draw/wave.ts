import { normalizeTimeOption } from "../internal/time.js";
import { renderWaveformPng } from "../render/png/waveform-png.js";
import { renderWaveformSvg } from "../render/waveform-svg.js";
import type { RenderWaveformSvgOptions } from "../render/types.js";
import { summarizeWaveform } from "../waveform/summarize.js";
import type { WavAudio } from "../wav/types.js";
import type { SummarizeWaveformOptions, WaveformMetric } from "../waveform/types.js";
import { readWavFile } from "../wav/read.js";
import { resolveOutputFormat, writeDrawOutput, type DrawOutput } from "./output.js";
import type { DrawWaveOptions } from "./types.js";

export async function drawWave(path: string, options: DrawWaveOptions): Promise<DrawOutput> {
  const audio = await readWavFile(path);
  const metrics = resolveWaveMetricsFromFlags(options);
  const summary = summarizeWaveform(audio, buildWaveformSummaryOptions(audio, options, metrics));
  const renderOptions = buildWaveformRenderOptions(options);
  const result = resolveOutputFormat(options) === "png"
    ? renderWaveformPng(summary, renderOptions)
    : renderWaveformSvg(summary, renderOptions);
  await writeDrawOutput(result, options);
  return result;
}

export function resolveWaveMetricsFromFlags(options: DrawWaveOptions): WaveformMetric[] {
  const metrics: WaveformMetric[] = [];
  if (options.maximums || options.peaks) {
    metrics.push("peaks");
  }
  if (options.rms) {
    metrics.push("rms");
  }
  if (options.average) {
    metrics.push("average");
  }
  return metrics.length > 0 ? metrics : ["peaks", "rms"];
}

export function buildWaveformSummaryOptions(
  audio: WavAudio,
  options: DrawWaveOptions,
  metrics: WaveformMetric[]
): SummarizeWaveformOptions {
  return {
    width: options.width,
    channel: options.channel ?? "mix",
    startSeconds: normalizeTimeOption(options.start, 0),
    endSeconds: normalizeTimeOption(options.end, audio.durationSeconds),
    metrics
  };
}

export function buildWaveformRenderOptions(options: DrawWaveOptions): RenderWaveformSvgOptions {
  const renderOptions: RenderWaveformSvgOptions = {
    width: options.width,
    height: options.height,
    layers: {
      peaks: { color: options.colors?.peaks ?? options.colors?.maximums ?? "#2563eb" },
      rms: { color: options.colors?.rms ?? "#60a5fa" },
      average: { color: options.colors?.average ?? "#111827" }
    }
  };
  const background = options.background ?? options.colors?.background;
  if (background !== undefined) {
    renderOptions.background = background;
  }
  return renderOptions;
}

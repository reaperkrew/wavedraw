import { normalizeTimeOption } from "../internal/time.js";
import { renderLinearSpectrogramPng } from "../render/png/linear-spectrogram-png.js";
import { renderLinearSpectrogramSvg } from "../render/linear-spectrogram-svg.js";
import type { RenderLinearSpectrogramSvgOptions } from "../render/types.js";
import { summarizeLinearSpectrogram } from "../spectrogram/linear.js";
import type { SummarizeLinearSpectrogramOptions } from "../spectrogram/linear-types.js";
import type { WavAudio } from "../wav/types.js";
import { loadAudio } from "./load.js";
import { resolveOutputFormat, writeDrawOutput, type DrawOutput } from "./output.js";
import type { DrawLinearSpectrogramOptions } from "./types.js";

export async function drawLinearSpectrogram(path: string, options: DrawLinearSpectrogramOptions): Promise<DrawOutput> {
  const audio = await loadAudio(path);
  const summary = summarizeLinearSpectrogram(audio, buildLinearSummaryOptions(audio, options));
  const renderOptions = buildLinearRenderOptions(options);
  const result = resolveOutputFormat(options) === "png"
    ? renderLinearSpectrogramPng(summary, renderOptions)
    : renderLinearSpectrogramSvg(summary, renderOptions);
  await writeDrawOutput(result, options);
  return result;
}

export function buildLinearSummaryOptions(audio: WavAudio, options: DrawLinearSpectrogramOptions): SummarizeLinearSpectrogramOptions {
  const summaryOptions: SummarizeLinearSpectrogramOptions = {
    width: options.width,
    channel: options.channel ?? "mix",
    startSeconds: normalizeTimeOption(options.start, 0),
    endSeconds: normalizeTimeOption(options.end, audio.durationSeconds)
  };
  if (options.fftSize !== undefined) summaryOptions.fftSize = options.fftSize;
  if (options.bins !== undefined) summaryOptions.bins = options.bins;
  if (options.minFrequency !== undefined) summaryOptions.minFrequency = options.minFrequency;
  if (options.maxFrequency !== undefined) summaryOptions.maxFrequency = options.maxFrequency;
  if (options.dynamicRangeDb !== undefined) summaryOptions.dynamicRangeDb = options.dynamicRangeDb;
  if (options.window !== undefined) summaryOptions.window = options.window;
  return summaryOptions;
}

export function buildLinearRenderOptions(options: DrawLinearSpectrogramOptions): RenderLinearSpectrogramSvgOptions {
  const renderOptions: RenderLinearSpectrogramSvgOptions = {
    width: options.width,
    height: options.height
  };
  if (options.padding !== undefined) renderOptions.padding = options.padding;
  if (options.colors !== undefined) renderOptions.colors = options.colors;
  if (options.colormap !== undefined) renderOptions.colormap = options.colormap;
  if (options.background !== undefined) renderOptions.background = options.background;
  return renderOptions;
}

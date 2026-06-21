import { normalizeTimeOption } from "../internal/time.js";
import { renderMelSpectrogramSvg } from "../render/spectrogram-svg.js";
import type { RenderMelSpectrogramSvgOptions } from "../render/types.js";
import { summarizeMelSpectrogram } from "../spectrogram/summarize.js";
import type { SummarizeMelSpectrogramOptions } from "../spectrogram/types.js";
import { readWavFile } from "../wav/read.js";
import type { WavAudio } from "../wav/types.js";
import { writeSvgOutput } from "./output.js";
import type { DrawMelSpectrogramOptions } from "./types.js";

export async function drawMelSpectrogram(path: string, options: DrawMelSpectrogramOptions): Promise<string> {
  const audio = await readWavFile(path);
  const summary = summarizeMelSpectrogram(audio, buildMelSummaryOptions(audio, options));
  const svg = renderMelSpectrogramSvg(summary, buildMelRenderOptions(options));
  await writeSvgOutput(svg, options);
  return svg;
}

export function buildMelSummaryOptions(audio: WavAudio, options: DrawMelSpectrogramOptions): SummarizeMelSpectrogramOptions {
  const summaryOptions: SummarizeMelSpectrogramOptions = {
    width: options.width,
    channel: options.channel ?? "mix",
    startSeconds: normalizeTimeOption(options.start, 0),
    endSeconds: normalizeTimeOption(options.end, audio.durationSeconds)
  };
  if (options.fftSize !== undefined) summaryOptions.fftSize = options.fftSize;
  if (options.melBands !== undefined) summaryOptions.melBands = options.melBands;
  if (options.minFrequency !== undefined) summaryOptions.minFrequency = options.minFrequency;
  if (options.maxFrequency !== undefined) summaryOptions.maxFrequency = options.maxFrequency;
  if (options.dynamicRangeDb !== undefined) summaryOptions.dynamicRangeDb = options.dynamicRangeDb;
  return summaryOptions;
}

export function buildMelRenderOptions(options: DrawMelSpectrogramOptions): RenderMelSpectrogramSvgOptions {
  const renderOptions: RenderMelSpectrogramSvgOptions = {
    width: options.width,
    height: options.height
  };
  if (options.padding !== undefined) renderOptions.padding = options.padding;
  if (options.colors !== undefined) renderOptions.colors = options.colors;
  if (options.background !== undefined) renderOptions.background = options.background;
  return renderOptions;
}

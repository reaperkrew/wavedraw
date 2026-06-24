import { validatePositiveInteger } from "../internal/validation.js";
import type { MelSpectrogramSummary } from "../spectrogram/types.js";
import { normalizeColorStops, type RgbColor } from "./color.js";
import { resolveSpectrogramColors } from "./colormaps.js";
import { renderSpectrogramCellsSvg } from "./spectrogram-shared.js";
import { closeSvg, openSvg, renderBackground } from "./svg.js";
import type { RenderMelSpectrogramSvgOptions } from "./types.js";

export function renderMelSpectrogramSvg(summary: MelSpectrogramSummary, options: RenderMelSpectrogramSvgOptions): string {
  const geometry = buildSpectrogramGeometry(summary.width, summary.melBands, options);
  const colors = normalizeColorStops(resolveSpectrogramColors(options));
  const elements: string[] = [openSvg(geometry.width, geometry.height, "Mel spectrogram")];
  if (options.background) {
    elements.push(renderBackground(options.background));
  }
  elements.push(...renderSpectrogramCellsSvg(summary.spectrogram, summary.melBands, geometry, colors));
  elements.push(closeSvg);
  return elements.join("");
}

export interface SpectrogramGeometry {
  width: number;
  height: number;
  padding: number;
  columnWidth: number;
  bandHeight: number;
}

export function buildSpectrogramGeometry(
  summaryWidth: number,
  melBands: number,
  options: RenderMelSpectrogramSvgOptions
): SpectrogramGeometry {
  const width = options.width ?? summaryWidth;
  const { height } = options;
  validatePositiveInteger("width", width);
  validatePositiveInteger("height", height);
  const padding = validateSpectrogramPadding(options.padding ?? 0, width, height);
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  return { width, height, padding, columnWidth: plotWidth / summaryWidth, bandHeight: plotHeight / melBands };
}

export function validateSpectrogramPadding(padding: number, width: number, height: number): number {
  if (!Number.isFinite(padding) || padding < 0 || padding * 2 >= height || padding * 2 >= width) {
    throw new Error("padding must be finite, non-negative, and smaller than half the dimensions");
  }
  return padding;
}

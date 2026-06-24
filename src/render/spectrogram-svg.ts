import { clamp } from "../internal/math.js";
import { validatePositiveInteger } from "../internal/validation.js";
import type { MelSpectrogramFrame, MelSpectrogramSummary } from "../spectrogram/types.js";
import { interpolateColorStops, normalizeColorStops, type RgbColor } from "./color.js";
import { resolveSpectrogramColors } from "./colormaps.js";
import { formatNumber } from "./format.js";
import { closeSvg, openSvg, renderBackground } from "./svg.js";
import type { RenderMelSpectrogramSvgOptions } from "./types.js";

export function renderMelSpectrogramSvg(summary: MelSpectrogramSummary, options: RenderMelSpectrogramSvgOptions): string {
  const geometry = buildSpectrogramGeometry(summary.width, summary.melBands, options);
  const colors = normalizeColorStops(resolveSpectrogramColors(options));
  const elements: string[] = [openSvg(geometry.width, geometry.height, "Mel spectrogram")];
  if (options.background) {
    elements.push(renderBackground(options.background));
  }
  elements.push(...renderMelCells(summary, geometry, colors));
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

export function renderMelCells(summary: MelSpectrogramSummary, geometry: SpectrogramGeometry, colors: RgbColor[]): string[] {
  const elements: string[] = [];
  for (let x = 0; x < summary.spectrogram.length; x += 1) {
    const frame = summary.spectrogram[x]!;
    for (let band = 0; band < summary.melBands; band += 1) {
      elements.push(renderMelCell(frame, band, x, summary.melBands, geometry, colors));
    }
  }
  return elements;
}

export function renderMelCell(
  frame: MelSpectrogramFrame,
  band: number,
  x: number,
  melBands: number,
  geometry: SpectrogramGeometry,
  colors: RgbColor[]
): string {
  const value = clamp(frame.values[band] ?? 0, 0, 1);
  const rectX = formatNumber(geometry.padding + x * geometry.columnWidth);
  const rectY = formatNumber(geometry.padding + (melBands - band - 1) * geometry.bandHeight);
  const rectWidth = formatNumber(Math.ceil((x + 1) * geometry.columnWidth) - Math.floor(x * geometry.columnWidth));
  const rectHeight = formatNumber(Math.ceil((band + 1) * geometry.bandHeight) - Math.floor(band * geometry.bandHeight));
  return `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${interpolateColorStops(colors, value)}"/>`;
}

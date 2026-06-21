import { clamp } from "../../internal/math.js";
import type { MelSpectrogramFrame, MelSpectrogramSummary } from "../../spectrogram/types.js";
import { buildSpectrogramGeometry, type SpectrogramGeometry } from "../spectrogram-svg.js";
import { interpolateColorStopsRgb, normalizeColorStops, parseHexColorRgba, type RgbColor } from "../color.js";
import { createBitmap, type Bitmap } from "./bitmap.js";
import { fillRect } from "./draw.js";
import { encodePng } from "./encoder.js";
import type { RenderMelSpectrogramPngOptions } from "../types.js";

export function renderMelSpectrogramPng(summary: MelSpectrogramSummary, options: RenderMelSpectrogramPngOptions): Uint8Array {
  const geometry = buildSpectrogramGeometry(summary.width, summary.melBands, options);
  const colors = normalizeColorStops(options.colors ?? ["#020617", "#0f766e", "#facc15", "#f8fafc"]);
  const background = options.background ? parseHexColorRgba(options.background, 255) : undefined;
  const bitmap = createBitmap(geometry.width, geometry.height, background);
  rasterizeMelCells(summary, geometry, colors, bitmap);
  return encodePng(geometry.width, geometry.height, bitmap.data);
}

export function rasterizeMelCells(
  summary: MelSpectrogramSummary,
  geometry: SpectrogramGeometry,
  colors: RgbColor[],
  bitmap: Bitmap
): void {
  for (let x = 0; x < summary.spectrogram.length; x += 1) {
    const frame = summary.spectrogram[x]!;
    for (let band = 0; band < summary.melBands; band += 1) {
      rasterizeMelCell(frame, band, x, summary.melBands, geometry, colors, bitmap);
    }
  }
}

export function rasterizeMelCell(
  frame: MelSpectrogramFrame,
  band: number,
  x: number,
  melBands: number,
  geometry: SpectrogramGeometry,
  colors: RgbColor[],
  bitmap: Bitmap
): void {
  const value = clamp(frame.values[band] ?? 0, 0, 1);
  const rgb = interpolateColorStopsRgb(colors, value);
  const rectX = Math.floor(geometry.padding + x * geometry.columnWidth);
  const rectEndX = Math.ceil(geometry.padding + (x + 1) * geometry.columnWidth);
  const rectY = Math.floor(geometry.padding + (melBands - band - 1) * geometry.bandHeight);
  const rectEndY = Math.ceil(geometry.padding + (melBands - band) * geometry.bandHeight);
  fillRect(bitmap, rectX, rectY, rectEndX - rectX, rectEndY - rectY, { ...rgb, alpha: 255 });
}

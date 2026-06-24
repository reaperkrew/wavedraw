import { clamp } from "../internal/math.js";
import { interpolateColorStops, type RgbColor } from "./color.js";
import { formatNumber } from "./format.js";
import type { SpectrogramGeometry } from "./spectrogram-svg.js";

export interface SpectrogramFrame {
  values: number[];
}

export function renderSpectrogramCellsSvg(
  frames: SpectrogramFrame[],
  bandCount: number,
  geometry: SpectrogramGeometry,
  colors: RgbColor[]
): string[] {
  const elements: string[] = [];
  for (let x = 0; x < frames.length; x += 1) {
    const frame = frames[x]!;
    for (let band = 0; band < bandCount; band += 1) {
      elements.push(renderSpectrogramCellSvg(frame, band, x, bandCount, geometry, colors));
    }
  }
  return elements;
}

export function renderSpectrogramCellSvg(
  frame: SpectrogramFrame,
  band: number,
  x: number,
  bandCount: number,
  geometry: SpectrogramGeometry,
  colors: RgbColor[]
): string {
  const value = clamp(frame.values[band] ?? 0, 0, 1);
  const rectX = formatNumber(geometry.padding + x * geometry.columnWidth);
  const rectY = formatNumber(geometry.padding + (bandCount - band - 1) * geometry.bandHeight);
  const rectWidth = formatNumber(Math.ceil((x + 1) * geometry.columnWidth) - Math.floor(x * geometry.columnWidth));
  const rectHeight = formatNumber(Math.ceil((band + 1) * geometry.bandHeight) - Math.floor(band * geometry.bandHeight));
  return `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${interpolateColorStops(colors, value)}"/>`;
}

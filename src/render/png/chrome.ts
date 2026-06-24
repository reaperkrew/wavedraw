import { interpolateColorStopsRgb, type RgbColor } from "../color.js";
import type { SpectrogramGeometry } from "../spectrogram-svg.js";
import { fillRect } from "./draw.js";
import type { Bitmap } from "./bitmap.js";

export interface ColorbarPlacement {
  barX: number;
  barWidth: number;
  top: number;
  bottom: number;
}

const SEGMENTS = 48;

export function rasterizeColorbarPng(
  geometry: SpectrogramGeometry,
  colors: RgbColor[],
  bitmap: Bitmap
): void {
  const placement = computeColorbarPlacement(geometry);
  const segmentHeight = (placement.bottom - placement.top) / SEGMENTS;
  for (let segment = 0; segment < SEGMENTS; segment += 1) {
    const ratio = segment / (SEGMENTS - 1);
    const y = Math.floor(placement.bottom - (segment + 1) * segmentHeight);
    const height = Math.ceil(segmentHeight) + 1;
    const rgb = interpolateColorStopsRgb(colors, ratio);
    fillRect(bitmap, placement.barX, y, placement.barWidth, height, { ...rgb, alpha: 255 });
  }
}

export function computeColorbarPlacement(geometry: SpectrogramGeometry): ColorbarPlacement {
  const barX = geometry.width - geometry.padding + 14;
  const barWidth = Math.max(8, geometry.padding - 24);
  return { barX, barWidth, top: geometry.padding, bottom: geometry.height - geometry.padding };
}

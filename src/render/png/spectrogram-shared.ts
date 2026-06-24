import { clamp } from "../../internal/math.js";
import { interpolateColorStopsRgb, type RgbColor } from "../color.js";
import type { SpectrogramGeometry } from "../spectrogram-svg.js";
import type { SpectrogramFrame } from "../spectrogram-shared.js";
import { fillRect } from "./draw.js";
import type { Bitmap } from "./bitmap.js";

export function rasterizeSpectrogramCellsPng(
  frames: SpectrogramFrame[],
  bandCount: number,
  geometry: SpectrogramGeometry,
  colors: RgbColor[],
  bitmap: Bitmap
): void {
  for (let x = 0; x < frames.length; x += 1) {
    const frame = frames[x]!;
    for (let band = 0; band < bandCount; band += 1) {
      rasterizeSpectrogramCellPng(frame, band, x, bandCount, geometry, colors, bitmap);
    }
  }
}

export function rasterizeSpectrogramCellPng(
  frame: SpectrogramFrame,
  band: number,
  x: number,
  bandCount: number,
  geometry: SpectrogramGeometry,
  colors: RgbColor[],
  bitmap: Bitmap
): void {
  const value = clamp(frame.values[band] ?? 0, 0, 1);
  const rgb = interpolateColorStopsRgb(colors, value);
  const rectX = Math.floor(geometry.padding + x * geometry.columnWidth);
  const rectEndX = Math.ceil(geometry.padding + (x + 1) * geometry.columnWidth);
  const rectY = Math.floor(geometry.padding + (bandCount - band - 1) * geometry.bandHeight);
  const rectEndY = Math.ceil(geometry.padding + (bandCount - band) * geometry.bandHeight);
  fillRect(bitmap, rectX, rectY, rectEndX - rectX, rectEndY - rectY, { ...rgb, alpha: 255 });
}

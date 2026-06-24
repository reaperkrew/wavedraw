import type { LinearSpectrogramSummary } from "../../spectrogram/linear-types.js";
import { resolveAxesConfig } from "../axes.js";
import { buildSpectrogramGeometry } from "../spectrogram-svg.js";
import { normalizeColorStops, parseHexColorRgba } from "../color.js";
import { resolveSpectrogramColors } from "../colormaps.js";
import { createBitmap } from "./bitmap.js";
import { rasterizeColorbarPng } from "./chrome.js";
import { encodePng } from "./encoder.js";
import { rasterizeSpectrogramCellsPng } from "./spectrogram-shared.js";
import type { RenderLinearSpectrogramPngOptions } from "../types.js";

export function renderLinearSpectrogramPng(summary: LinearSpectrogramSummary, options: RenderLinearSpectrogramPngOptions): Uint8Array {
  const geometry = buildSpectrogramGeometry(summary.width, summary.bins, options);
  const colors = normalizeColorStops(resolveSpectrogramColors(options));
  const background = options.background ? parseHexColorRgba(options.background, 255) : undefined;
  const bitmap = createBitmap(geometry.width, geometry.height, background);
  rasterizeSpectrogramCellsPng(summary.spectrogram, summary.bins, geometry, colors, bitmap);
  const config = resolveAxesConfig(options.axes);
  if (config.colorbar) {
    rasterizeColorbarPng(geometry, colors, bitmap);
  }
  return encodePng(geometry.width, geometry.height, bitmap.data);
}

import { normalizeColorStops } from "./color.js";
import { resolveSpectrogramColors } from "./colormaps.js";
import { renderSpectrogramCellsSvg } from "./spectrogram-shared.js";
import { buildSpectrogramGeometry } from "./spectrogram-svg.js";
import { closeSvg, openSvg, renderBackground } from "./svg.js";
import type { LinearSpectrogramSummary } from "../spectrogram/linear-types.js";
import type { RenderLinearSpectrogramSvgOptions } from "./types.js";

export function renderLinearSpectrogramSvg(summary: LinearSpectrogramSummary, options: RenderLinearSpectrogramSvgOptions): string {
  const geometry = buildSpectrogramGeometry(summary.width, summary.bins, options);
  const colors = normalizeColorStops(resolveSpectrogramColors(options));
  const elements: string[] = [openSvg(geometry.width, geometry.height, "Linear spectrogram")];
  if (options.background) {
    elements.push(renderBackground(options.background));
  }
  elements.push(...renderSpectrogramCellsSvg(summary.spectrogram, summary.bins, geometry, colors));
  elements.push(closeSvg);
  return elements.join("");
}

import { interpolateColorStops, type RgbColor } from "./color.js";
import { escapeAttribute } from "./format.js";
import { formatNumber } from "./format.js";
import type { SpectrogramGeometry } from "./spectrogram-svg.js";
import {
  formatDecibelLabel,
  formatFrequencyLabel,
  formatTimeLabel,
  type AxesConfig,
  type SpectrogramAxisInfo
} from "./axes.js";

export function renderSpectrogramChromeSvg(
  info: SpectrogramAxisInfo,
  geometry: SpectrogramGeometry,
  colors: RgbColor[],
  config: AxesConfig
): string[] {
  if (!config.enabled) {
    return [];
  }
  const elements: string[] = [];
  if (config.timeAxis) {
    elements.push(...renderTimeAxisSvg(info, geometry, config));
  }
  if (config.frequencyAxis) {
    elements.push(...renderFrequencyAxisSvg(info, geometry, config));
  }
  if (config.colorbar) {
    elements.push(...renderColorbarSvg(info, geometry, colors, config));
  }
  return elements;
}

export function renderTimeAxisSvg(info: SpectrogramAxisInfo, geometry: SpectrogramGeometry, config: AxesConfig): string[] {
  const elements: string[] = [];
  const left = geometry.padding;
  const right = geometry.width - geometry.padding;
  const bottom = geometry.height - geometry.padding;
  elements.push(svgLine(left, bottom, right, bottom, config.color));
  const span = info.endSeconds - info.startSeconds;
  for (let tick = 0; tick <= config.ticks; tick += 1) {
    const ratio = tick / config.ticks;
    const x = left + ratio * (right - left);
    const seconds = info.startSeconds + ratio * span;
    elements.push(svgLine(x, bottom, x, bottom + 4, config.color));
    elements.push(svgText(x, bottom + config.fontSize + 8, formatTimeLabel(seconds), config, "middle"));
  }
  return elements;
}

export function renderFrequencyAxisSvg(info: SpectrogramAxisInfo, geometry: SpectrogramGeometry, config: AxesConfig): string[] {
  const elements: string[] = [];
  const left = geometry.padding;
  const top = geometry.padding;
  const bottom = geometry.height - geometry.padding;
  elements.push(svgLine(left, top, left, bottom, config.color));
  const span = info.maxFrequency - info.minFrequency;
  for (let tick = 0; tick <= config.ticks; tick += 1) {
    const ratio = tick / config.ticks;
    const y = bottom - ratio * (bottom - top);
    const hertz = info.minFrequency + ratio * span;
    elements.push(svgLine(left - 4, y, left, y, config.color));
    elements.push(svgText(left - 8, y + config.fontSize / 3, formatFrequencyLabel(hertz), config, "end"));
  }
  return elements;
}

export function renderColorbarSvg(
  info: SpectrogramAxisInfo,
  geometry: SpectrogramGeometry,
  colors: RgbColor[],
  config: AxesConfig
): string[] {
  const elements: string[] = [];
  const barX = geometry.width - geometry.padding + 14;
  const barWidth = Math.max(8, geometry.padding - 24);
  const top = geometry.padding;
  const bottom = geometry.height - geometry.padding;
  const segments = 24;
  const segmentHeight = (bottom - top) / segments;
  for (let segment = 0; segment < segments; segment += 1) {
    const ratio = segment / (segments - 1);
    const y = bottom - (segment + 1) * segmentHeight;
    elements.push(svgRect(barX, y, barWidth, segmentHeight + 1, interpolateColorStops(colors, ratio)));
  }
  elements.push(svgText(barX + barWidth + 6, top + config.fontSize, formatDecibelLabel(info.maxDecibels), config, "start"));
  elements.push(svgText(barX + barWidth + 6, bottom + config.fontSize / 3, formatDecibelLabel(info.minDecibels), config, "start"));
  return elements;
}

export function svgLine(x1: number, y1: number, x2: number, y2: number, color: string): string {
  return `<line x1="${formatNumber(x1)}" y1="${formatNumber(y1)}" x2="${formatNumber(x2)}" y2="${formatNumber(y2)}" stroke="${color}" stroke-width="1"/>`;
}

export function svgRect(x: number, y: number, width: number, height: number, fill: string): string {
  return `<rect x="${formatNumber(x)}" y="${formatNumber(y)}" width="${formatNumber(width)}" height="${formatNumber(height)}" fill="${fill}"/>`;
}

export function svgText(x: number, y: number, content: string, config: AxesConfig, anchor: "start" | "middle" | "end"): string {
  return `<text x="${formatNumber(x)}" y="${formatNumber(y)}" font-size="${config.fontSize}" fill="${config.color}" font-family="sans-serif" text-anchor="${anchor}">${escapeAttribute(content)}</text>`;
}

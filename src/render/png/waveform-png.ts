import { clamp } from "../../internal/math.js";
import {
  buildWaveformGeometry,
  resolveWaveformLayers,
  type ResolvedWaveformLayers,
  type WaveformGeometry
} from "../layer.js";
import { parseHexColorRgba } from "../color.js";
import type { WaveformLayerStyle } from "../types.js";
import type { WaveformChannelSummary, WaveformColumn, WaveformSummary } from "../../waveform/types.js";
import { createBitmap, type Bitmap } from "./bitmap.js";
import { drawLine, drawVerticalLine } from "./draw.js";
import { encodePng } from "./encoder.js";
import type { RenderWaveformPngOptions } from "../types.js";

type ResolvedLayerStyle = Required<WaveformLayerStyle>;

const RMS_OPACITY = 0.7;

export function renderWaveformPng(summary: WaveformSummary, options: RenderWaveformPngOptions): Uint8Array {
  const geometry = buildWaveformGeometry(summary.width, options);
  const layers = resolveWaveformLayers(options.layers);
  const background = options.background ? parseHexColorRgba(options.background, 255) : undefined;
  const bitmap = createBitmap(geometry.width, geometry.height, background);
  for (const channel of summary.channels) {
    rasterizeWaveformChannel(channel, layers, geometry, bitmap);
  }
  return encodePng(geometry.width, geometry.height, bitmap.data);
}

export function rasterizeWaveformChannel(
  channel: WaveformChannelSummary,
  layers: ResolvedWaveformLayers,
  geometry: WaveformGeometry,
  bitmap: Bitmap
): void {
  if (layers.peaks) {
    rasterizePeaks(channel.columns, layers.peaks, geometry, bitmap);
  }
  if (layers.rms && channel.columns.some(hasRms)) {
    rasterizeRms(channel.columns, layers.rms, geometry, bitmap);
  }
  if (layers.average && channel.columns.some(hasAverage)) {
    rasterizeAverage(channel.columns, layers.average, geometry, bitmap);
  }
}

function hasRms(column: WaveformColumn): boolean {
  return column.rms !== undefined;
}

function hasAverage(column: WaveformColumn): boolean {
  return column.average !== undefined;
}

export function rasterizePeaks(
  columns: WaveformColumn[],
  style: ResolvedLayerStyle,
  geometry: WaveformGeometry,
  bitmap: Bitmap
): void {
  const color = parseHexColorRgba(style.color, 255);
  const thickness = Math.max(1, Math.round(style.strokeWidth));
  for (let x = 0; x < columns.length; x += 1) {
    const column = columns[x]!;
    const cx = (x + 0.5) * geometry.xScale;
    const y1 = geometry.mid - clamp(column.max, -1, 1) * geometry.half;
    const y2 = geometry.mid - clamp(column.min, -1, 1) * geometry.half;
    drawVerticalLine(bitmap, cx, y1, y2, color, thickness);
  }
}

export function rasterizeRms(
  columns: WaveformColumn[],
  style: ResolvedLayerStyle,
  geometry: WaveformGeometry,
  bitmap: Bitmap
): void {
  const color = parseHexColorRgba(style.color, Math.round(RMS_OPACITY * 255));
  const thickness = Math.max(1, Math.round(style.strokeWidth));
  for (let x = 0; x < columns.length; x += 1) {
    const column = columns[x]!;
    const rms = clamp(column.rms ?? 0, 0, 1);
    const cx = (x + 0.5) * geometry.xScale;
    const y1 = geometry.mid - rms * geometry.half;
    const y2 = geometry.mid + rms * geometry.half;
    drawVerticalLine(bitmap, cx, y1, y2, color, thickness);
  }
}

export function rasterizeAverage(
  columns: WaveformColumn[],
  style: ResolvedLayerStyle,
  geometry: WaveformGeometry,
  bitmap: Bitmap
): void {
  const color = parseHexColorRgba(style.color, 255);
  for (let x = 1; x < columns.length; x += 1) {
    const prev = columns[x - 1]!;
    const curr = columns[x]!;
    const x1 = (x - 0.5) * geometry.xScale;
    const x2 = (x + 0.5) * geometry.xScale;
    const y1 = geometry.mid - clamp(prev.average ?? 0, -1, 1) * geometry.half;
    const y2 = geometry.mid - clamp(curr.average ?? 0, -1, 1) * geometry.half;
    drawLine(bitmap, x1, y1, x2, y2, color);
  }
}

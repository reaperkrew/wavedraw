import type { WaveformColumn, WaveformMetric } from "./types.js";

export function summarizeChannel(
  samples: Float32Array,
  startFrame: number,
  endFrame: number,
  width: number,
  metrics: Set<WaveformMetric>
): WaveformColumn[] {
  const selectedFrames = endFrame - startFrame;
  const columns: WaveformColumn[] = [];

  for (let x = 0; x < width; x += 1) {
    const bucketStart = startFrame + Math.floor((x * selectedFrames) / width);
    const bucketEnd = startFrame + Math.floor(((x + 1) * selectedFrames) / width);
    const end = Math.min(Math.max(bucketEnd, bucketStart + 1), endFrame);
    const stats = computeColumnStats(samples, bucketStart, end);
    columns.push(buildColumn(stats, metrics));
  }

  return columns;
}

export interface ColumnStats {
  min: number;
  max: number;
  sum: number;
  sumSquares: number;
  count: number;
}

export function computeColumnStats(samples: Float32Array, start: number, end: number): ColumnStats {
  let min = 1;
  let max = -1;
  let sum = 0;
  let sumSquares = 0;
  let count = 0;

  for (let frame = start; frame < end; frame += 1) {
    const sample = samples[frame] ?? 0;
    if (sample < min) min = sample;
    if (sample > max) max = sample;
    sum += sample;
    sumSquares += sample * sample;
    count += 1;
  }

  return count === 0 ? { min: 0, max: 0, sum: 0, sumSquares: 0, count: 0 } : { min, max, sum, sumSquares, count };
}

export function buildColumn(stats: ColumnStats, metrics: Set<WaveformMetric>): WaveformColumn {
  const column: WaveformColumn = {
    min: metrics.has("peaks") ? stats.min : 0,
    max: metrics.has("peaks") ? stats.max : 0
  };
  if (metrics.has("rms")) {
    column.rms = stats.count > 0 ? Math.sqrt(stats.sumSquares / stats.count) : 0;
  }
  if (metrics.has("average")) {
    column.average = stats.count > 0 ? stats.sum / stats.count : 0;
  }
  return column;
}

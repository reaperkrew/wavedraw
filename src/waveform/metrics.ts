import type { WaveformMetric } from "./types.js";

export function resolveWaveformMetrics(metrics: WaveformMetric[] | undefined): Set<WaveformMetric> {
  return new Set<WaveformMetric>(metrics ?? ["peaks", "rms"]);
}

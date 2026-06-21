export function resolveWaveformMetrics(metrics) {
    return new Set(metrics ?? ["peaks", "rms"]);
}

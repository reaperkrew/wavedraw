import type { WaveformColumn, WaveformMetric } from "./types.js";
export declare function summarizeChannel(samples: Float32Array, startFrame: number, endFrame: number, width: number, metrics: Set<WaveformMetric>): WaveformColumn[];
export interface ColumnStats {
    min: number;
    max: number;
    sum: number;
    sumSquares: number;
    count: number;
}
export declare function computeColumnStats(samples: Float32Array, start: number, end: number): ColumnStats;
export declare function buildColumn(stats: ColumnStats, metrics: Set<WaveformMetric>): WaveformColumn;
//# sourceMappingURL=column.d.ts.map
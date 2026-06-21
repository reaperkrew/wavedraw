import type { MelSpectrogramFrame } from "./types.js";
export interface RawMelFrame {
    values: number[];
}
export interface MelFrameAccumulator {
    frames: RawMelFrame[];
    maxDecibels: number;
}
export declare function computeMelFrames(samples: Float32Array, startFrame: number, endFrame: number, width: number, fftSize: number, window: Float64Array, filterbank: number[][]): MelFrameAccumulator;
export declare function maxValue(values: number[], fallback: number): number;
export declare function computeBandDecibels(powerSpectrum: number[], weights: number[]): number;
export declare function normalizeMelFrames(frames: RawMelFrame[], maxDecibels: number, dynamicRangeDb: number): MelSpectrogramFrame[];
//# sourceMappingURL=frames.d.ts.map
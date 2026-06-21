import type { MelFilterbankOptions } from "./types.js";
export declare function createMelFilterbank(options: MelFilterbankOptions): number[][];
export declare function buildMelPoints(options: MelFilterbankOptions): number[];
export declare function buildFilterWeights(options: MelFilterbankOptions, melPoints: number[], bins: number, band: number): number[];
export declare function computeFilterWeight(frequency: number, lower: number, center: number, upper: number): number;
export declare function hertzToMel(value: number): number;
export declare function melToHertz(value: number): number;
//# sourceMappingURL=filterbank.d.ts.map
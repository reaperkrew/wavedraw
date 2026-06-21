import type { WavFormat } from "./types.js";
export declare function decodeChannels(view: DataView, format: WavFormat, frames: number): Float32Array[];
export declare function readSample(view: DataView, offset: number, format: WavFormat): number;
export declare function readInt24(view: DataView, offset: number): number;
export declare function normalizeSigned(value: number, divisor: number): number;
//# sourceMappingURL=decode.d.ts.map
import { type ScannedChunks } from "./chunks.js";
import type { ParseWavOptions, WavAudio, WavFormat } from "./types.js";
export declare function parseWav(input: Buffer | ArrayBuffer | Uint8Array, _options?: ParseWavOptions): WavAudio;
export declare function buildFormat(scanned: ScannedChunks): WavFormat;
export declare function toUint8Array(input: Buffer | ArrayBuffer | Uint8Array): Uint8Array;
//# sourceMappingURL=parse.d.ts.map
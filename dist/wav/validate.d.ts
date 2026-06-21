import type { WavFormat } from "./types.js";
export declare function validateFormat(format: WavFormat): void;
export declare function validateFormatBasics(format: WavFormat): void;
export declare function validateFormatAlignment(format: WavFormat): void;
export declare function isSupportedBitsPerSample(value: number): value is WavFormat["bitsPerSample"];
//# sourceMappingURL=validate.d.ts.map
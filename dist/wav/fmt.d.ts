import type { WavAudioFormat, WavFormat } from "./types.js";
interface FmtFields {
    audioFormatCode: number;
    channels: number;
    sampleRate: number;
    byteRate: number;
    blockAlign: number;
    bitsPerSample: number;
}
interface ValidatedFmt {
    audioFormat: WavAudioFormat;
    bitsPerSample: WavFormat["bitsPerSample"];
}
export declare function parseFmtChunk(view: DataView, offset: number, size: number): Omit<WavFormat, "dataOffset" | "dataLength">;
export declare function readFmtFields(view: DataView, offset: number): FmtFields;
export declare function validateFmtFields(audioFormatCode: number, bitsPerSample: number): ValidatedFmt;
export {};
//# sourceMappingURL=fmt.d.ts.map
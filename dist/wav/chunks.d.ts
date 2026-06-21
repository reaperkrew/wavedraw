import type { WavFormat } from "./types.js";
export interface ScannedChunks {
    fmt: Omit<WavFormat, "dataOffset" | "dataLength"> | undefined;
    dataOffset: number;
    dataLength: number;
}
export interface ChunkHeader {
    id: string;
    size: number;
    payloadOffset: number;
    nextOffset: number;
}
export declare function scanChunks(bytes: Uint8Array, view: DataView): ScannedChunks;
export declare function readChunkHeader(bytes: Uint8Array, view: DataView, offset: number): ChunkHeader;
export declare function processChunk(state: ScannedChunks, header: ChunkHeader, view: DataView, bytes: Uint8Array): void;
//# sourceMappingURL=chunks.d.ts.map
import { readAscii } from "../internal/ascii.js";
import type { WavFormat } from "./types.js";
import { parseFmtChunk } from "./fmt.js";

const FMT = "fmt ";
const DATA = "data";

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

export function scanChunks(bytes: Uint8Array, view: DataView): ScannedChunks {
  const state: ScannedChunks = { fmt: undefined, dataOffset: -1, dataLength: 0 };
  let offset = 12;

  while (offset + 8 <= bytes.byteLength) {
    const header = readChunkHeader(bytes, view, offset);
    processChunk(state, header, view, bytes);
    offset = header.nextOffset;
  }

  return state;
}

export function readChunkHeader(bytes: Uint8Array, view: DataView, offset: number): ChunkHeader {
  const id = readAscii(bytes, offset, 4);
  const size = view.getUint32(offset + 4, true);
  const payloadOffset = offset + 8;
  return { id, size, payloadOffset, nextOffset: payloadOffset + size + (size % 2) };
}

export function processChunk(state: ScannedChunks, header: ChunkHeader, view: DataView, bytes: Uint8Array): void {
  if (header.payloadOffset + header.size > bytes.byteLength) {
    throw new Error(`Invalid WAV: chunk ${header.id.trim() || "(empty)"} exceeds file length`);
  }
  if (header.id === FMT) {
    state.fmt = parseFmtChunk(view, header.payloadOffset, header.size);
  } else if (header.id === DATA) {
    state.dataOffset = header.payloadOffset;
    state.dataLength = header.size;
  }
}

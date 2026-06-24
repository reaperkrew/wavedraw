import { readAscii } from "../internal/ascii.js";
import { parseCommChunk, type AiffComm } from "./comm.js";
import type { AiffFlavor } from "./header.js";

const COMM = "COMM";
const SSND = "SSND";

export interface ScannedAiff {
  comm: AiffComm | undefined;
  soundOffset: number;
  soundLength: number;
}

export function scanAiffChunks(bytes: Uint8Array, view: DataView, flavor: AiffFlavor): ScannedAiff {
  const state: ScannedAiff = { comm: undefined, soundOffset: -1, soundLength: 0 };
  let offset = 12;
  while (offset + 8 <= bytes.byteLength) {
    const header = readAiffChunkHeader(bytes, view, offset);
    processAiffChunk(state, header, bytes, view, flavor);
    offset = header.nextOffset;
  }
  return state;
}

export interface AiffChunkHeader {
  id: string;
  size: number;
  payloadOffset: number;
  nextOffset: number;
}

export function readAiffChunkHeader(bytes: Uint8Array, view: DataView, offset: number): AiffChunkHeader {
  const id = readAscii(bytes, offset, 4);
  const size = view.getUint32(offset + 4, false);
  const payloadOffset = offset + 8;
  return { id, size, payloadOffset, nextOffset: payloadOffset + size + (size % 2) };
}

export function processAiffChunk(
  state: ScannedAiff,
  header: AiffChunkHeader,
  bytes: Uint8Array,
  view: DataView,
  flavor: AiffFlavor
): void {
  if (header.payloadOffset + header.size > bytes.byteLength) {
    throw new Error(`Invalid AIFF: chunk ${header.id.trim() || "(empty)"} exceeds file length`);
  }
  if (header.id === COMM) {
    state.comm = parseCommChunk(bytes, view, header.payloadOffset, header.size, flavor);
  } else if (header.id === SSND) {
    const ssndBlockOffset = view.getUint32(header.payloadOffset, false);
    state.soundOffset = header.payloadOffset + 8 + ssndBlockOffset;
    state.soundLength = header.size - 8 - ssndBlockOffset;
  }
}

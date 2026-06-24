import { readAscii } from "../internal/ascii.js";
import { readExtended } from "./extended.js";
import type { AiffFlavor } from "./header.js";

export type AiffEncoding = "pcm" | "float";

export interface AiffComm {
  channels: number;
  sampleFrames: number;
  bitsPerSample: number;
  sampleRate: number;
  encoding: AiffEncoding;
}

const COMPRESSION_OFFSET = 18;
const PCM_TYPES = new Set(["NONE", "twos", "TWOS", "sowt", "SOWT"]);
const FLOAT_TYPES = new Set(["fl32", "FL32", "fl64", "FL64"]);

export function parseCommChunk(
  bytes: Uint8Array,
  view: DataView,
  offset: number,
  size: number,
  flavor: AiffFlavor
): AiffComm {
  const channels = view.getUint16(offset, false);
  const sampleFrames = view.getUint32(offset + 2, false);
  const bitsPerSample = view.getUint16(offset + 6, false);
  const sampleRate = readExtended(view, offset + 8);
  const encoding = resolveEncoding(bytes, offset, size, flavor);
  return { channels, sampleFrames, bitsPerSample, sampleRate, encoding };
}

export function resolveEncoding(bytes: Uint8Array, offset: number, size: number, flavor: AiffFlavor): AiffEncoding {
  if (flavor === "aiff") {
    return "pcm";
  }
  if (size < COMPRESSION_OFFSET + 4) {
    throw new Error("Invalid AIFF-C: COMM chunk missing compression type");
  }
  const compression = readAscii(bytes, offset + COMPRESSION_OFFSET, 4);
  if (PCM_TYPES.has(compression)) {
    return "pcm";
  }
  if (FLOAT_TYPES.has(compression)) {
    return "float";
  }
  throw new Error(`Unsupported AIFF-C compression type: ${compression}`);
}

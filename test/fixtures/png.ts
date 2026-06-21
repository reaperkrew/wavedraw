import { inflateSync } from "node:zlib";

// PNG chunk parser used by render/png tests. Walks the chunk stream of a
// well-formed PNG byte buffer and exposes length/type/data/crc per chunk.
// Intentionally minimal: no validation of the PNG signature beyond presence.

export interface PngChunk {
  type: string;
  data: Uint8Array;
  crc: number;
}

const PNG_SIGNATURE_LENGTH = 8;
const LENGTH_BYTES = 4;
const TYPE_BYTES = 4;
const CRC_BYTES = 4;

export function parsePngChunks(bytes: Uint8Array): PngChunk[] {
  const chunks: PngChunk[] = [];
  let offset = PNG_SIGNATURE_LENGTH;
  while (offset < bytes.length) {
    const chunk = readChunk(bytes, offset);
    chunks.push(chunk);
    offset += LENGTH_BYTES + TYPE_BYTES + chunk.data.length + CRC_BYTES;
  }
  return chunks;
}

function readChunk(bytes: Uint8Array, offset: number): PngChunk {
  const length = readUInt32BE(bytes, offset);
  const type = ascii(bytes, offset + LENGTH_BYTES, TYPE_BYTES);
  const dataStart = offset + LENGTH_BYTES + TYPE_BYTES;
  const dataEnd = dataStart + length;
  const crc = readUInt32BE(bytes, dataEnd);
  return { type, data: bytes.subarray(dataStart, dataEnd), crc };
}

function readUInt32BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset]! * 0x1000000) + ((bytes[offset + 1]! << 16) | (bytes[offset + 2]! << 8) | bytes[offset + 3]!)) >>> 0;
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += String.fromCharCode(bytes[offset + i]!);
  }
  return result;
}

export function readIhdr(bytes: Uint8Array): { width: number; height: number; bitDepth: number; colorType: number } {
  const chunks = parsePngChunks(bytes);
  const ihdr = chunks.find((chunk) => chunk.type === "IHDR");
  if (!ihdr) {
    throw new Error("missing IHDR chunk");
  }
  return {
    width: readUInt32BE(ihdr.data, 0),
    height: readUInt32BE(ihdr.data, 4),
    bitDepth: ihdr.data[8]!,
    colorType: ihdr.data[9]!
  };
}

export function inflateIdat(bytes: Uint8Array): Uint8Array {
  const chunks = parsePngChunks(bytes);
  const idat = chunks.filter((chunk) => chunk.type === "IDAT");
  const combined = Buffer.concat(idat.map((chunk) => Buffer.from(chunk.data)));
  return inflateSync(combined);
}

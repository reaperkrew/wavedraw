import { deflateSync } from "node:zlib";
import { asciiBytes, concatBytes, crc32, writeUInt32BE } from "./binary.js";

// PNG_SIGNATURE is the 8-byte PNG file signature (RFC 2083 §11.1).
export const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const IHDR_DATA_LENGTH = 13;
const BIT_DEPTH_8 = 8;
const COLOR_TYPE_RGBA = 6;

export type PngChunkType = "IHDR" | "IDAT" | "IEND";

export function encodePng(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const ihdr = encodeIhdr(width, height);
  const idat = encodeIdat(width, height, rgba);
  const iend = encodeChunk("IEND", new Uint8Array(0));
  return concatBytes([PNG_SIGNATURE, ihdr, idat, iend]);
}

export function encodeIhdr(width: number, height: number): Uint8Array {
  const data = new Uint8Array(IHDR_DATA_LENGTH);
  writeUInt32BE(data, 0, width);
  writeUInt32BE(data, 4, height);
  data[8] = BIT_DEPTH_8;
  data[9] = COLOR_TYPE_RGBA;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return encodeChunk("IHDR", data);
}

export function encodeIdat(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const raw = buildRawScanlines(width, height, rgba);
  return encodeChunk("IDAT", deflateSync(raw));
}

export function buildRawScanlines(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const bytesPerRow = width * 4;
  const raw = new Uint8Array((bytesPerRow + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const srcOffset = y * bytesPerRow;
    const dstOffset = y * (bytesPerRow + 1);
    raw[dstOffset] = 0;
    raw.set(rgba.subarray(srcOffset, srcOffset + bytesPerRow), dstOffset + 1);
  }
  return raw;
}

export function encodeChunk(type: PngChunkType, data: Uint8Array): Uint8Array {
  const typeBytes = asciiBytes(type);
  const length = new Uint8Array(4);
  writeUInt32BE(length, 0, data.length);
  const crc = new Uint8Array(4);
  writeUInt32BE(crc, 0, crc32(concatBytes([typeBytes, data])));
  return concatBytes([length, typeBytes, data, crc]);
}

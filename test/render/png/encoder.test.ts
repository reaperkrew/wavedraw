import { describe, expect, it } from "vitest";
import { crc32, asciiBytes, concatBytes, writeUInt32BE } from "../../../src/render/png/binary.js";
import { encodeChunk, encodeIhdr, encodeIdat, encodePng, PNG_SIGNATURE } from "../../../src/render/png/encoder.js";
import { inflateIdat, parsePngChunks, readIhdr } from "../../fixtures/png.js";

describe("crc32", () => {
  it("matches the canonical CRC32 of \"123456789\"", () => {
    expect(crc32(asciiBytes("123456789"))).toBe(0xcbf43926);
  });
});

describe("writeUInt32BE", () => {
  it("writes bytes in big-endian order", () => {
    const buffer = new Uint8Array(4);
    writeUInt32BE(buffer, 0, 0x01020304);
    expect(Array.from(buffer)).toEqual([0x01, 0x02, 0x03, 0x04]);
  });
});

describe("encodeIhdr", () => {
  it("encodes width, height, 8-bit RGBA, and a valid CRC", () => {
    const png = concatBytes([PNG_SIGNATURE, encodeIhdr(640, 480), encodeChunk("IEND", new Uint8Array(0))]);
    const chunks = parsePngChunks(png);
    const parsed = readIhdr(png);
    expect(parsed.width).toBe(640);
    expect(parsed.height).toBe(480);
    expect(parsed.bitDepth).toBe(8);
    expect(parsed.colorType).toBe(6);
    expect(chunks[0]!.type).toBe("IHDR");
    expect(chunks[0]!.crc).toBe(crc32(concatBytes([asciiBytes("IHDR"), chunks[0]!.data])));
  });
});

describe("encodeIdat", () => {
  it("inflates back to filter-prefixed scanlines", () => {
    const width = 2;
    const height = 2;
    const rgba = new Uint8Array([
      255, 0, 0, 255, 0, 255, 0, 255,
      0, 0, 255, 255, 255, 255, 0, 255
    ]);
    const png = concatBytes([PNG_SIGNATURE, encodeIhdr(width, height), encodeIdat(width, height, rgba), encodeChunk("IEND", new Uint8Array(0))]);
    const inflated = inflateIdat(png);
    expect(inflated.length).toBe((width * 4 + 1) * height);
    expect(inflated[0]).toBe(0);
    expect(inflated[1]).toBe(255);
  });
});

describe("encodePng", () => {
  it("emits signature, IHDR, IDAT, and IEND in order", () => {
    const png = encodePng(2, 2, new Uint8Array(16));
    expect(Array.from(png.subarray(0, 8))).toEqual(Array.from(PNG_SIGNATURE));
    const types = parsePngChunks(png).map((chunk) => chunk.type);
    expect(types).toEqual(["IHDR", "IDAT", "IEND"]);
    expect(readIhdr(png)).toEqual({ width: 2, height: 2, bitDepth: 8, colorType: 6 });
  });
});

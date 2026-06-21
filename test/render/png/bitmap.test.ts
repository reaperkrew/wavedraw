import { describe, expect, it } from "vitest";
import { blendPixel, createBitmap, fillBitmap, setPixel, writePixel } from "../../../src/render/png/bitmap.js";
import { drawLine, drawVerticalLine, fillRect } from "../../../src/render/png/draw.js";

describe("createBitmap", () => {
  it("creates a zeroed RGBA buffer sized to width * height * 4", () => {
    const bitmap = createBitmap(2, 3);
    expect(bitmap.width).toBe(2);
    expect(bitmap.height).toBe(3);
    expect(bitmap.data.length).toBe(24);
    expect(bitmap.data.every((byte) => byte === 0)).toBe(true);
  });

  it("fills the buffer with the background color when supplied", () => {
    const bitmap = createBitmap(1, 1, { red: 10, green: 20, blue: 30, alpha: 255 });
    expect(Array.from(bitmap.data)).toEqual([10, 20, 30, 255]);
  });

  it("rejects non-positive dimensions", () => {
    expect(() => createBitmap(0, 1)).toThrow();
    expect(() => createBitmap(1, 0)).toThrow();
  });
});

describe("fillBitmap", () => {
  it("writes the color to every pixel", () => {
    const bitmap = createBitmap(2, 1);
    fillBitmap(bitmap, { red: 1, green: 2, blue: 3, alpha: 255 });
    expect(Array.from(bitmap.data)).toEqual([1, 2, 3, 255, 1, 2, 3, 255]);
  });
});

describe("setPixel", () => {
  it("writes the blended pixel at the requested coordinate", () => {
    const bitmap = createBitmap(2, 1, { red: 0, green: 0, blue: 0, alpha: 255 });
    setPixel(bitmap, 1, 0, { red: 200, green: 200, blue: 200, alpha: 255 });
    expect(Array.from(bitmap.data)).toEqual([0, 0, 0, 255, 200, 200, 200, 255]);
  });

  it("ignores coordinates outside the bitmap bounds", () => {
    const bitmap = createBitmap(1, 1);
    setPixel(bitmap, 5, 5, { red: 255, green: 0, blue: 0, alpha: 255 });
    expect(Array.from(bitmap.data)).toEqual([0, 0, 0, 0]);
  });
});

describe("blendPixel", () => {
  it("composites a semi-transparent source over an opaque destination", () => {
    const data = new Uint8Array([0, 0, 0, 255]);
    blendPixel(data, 0, { red: 255, green: 255, blue: 255, alpha: 128 });
    expect(data[0]!).toBeGreaterThan(0);
    expect(data[3]!).toBe(255);
  });
});

describe("drawVerticalLine", () => {
  it("paints every row between y1 and y2 at column x", () => {
    const bitmap = createBitmap(1, 4);
    drawVerticalLine(bitmap, 0, 1, 3, { red: 255, green: 255, blue: 255, alpha: 255 }, 1);
    expect(bitmap.data[0]).toBe(0);
    expect(bitmap.data[4]).toBe(255);
    expect(bitmap.data[8]).toBe(255);
    expect(bitmap.data[12]).toBe(255);
  });
});

describe("drawLine", () => {
  it("connects two points without leaving gaps along the major axis", () => {
    const bitmap = createBitmap(5, 1);
    drawLine(bitmap, 0, 0, 4, 0, { red: 1, green: 1, blue: 1, alpha: 255 });
    for (let x = 0; x < 5; x += 1) {
      expect(bitmap.data[x * 4]!).toBe(1);
    }
  });
});

describe("fillRect", () => {
  it("fills a rectangular region", () => {
    const bitmap = createBitmap(2, 2);
    fillRect(bitmap, 0, 0, 2, 2, { red: 9, green: 9, blue: 9, alpha: 255 });
    expect(bitmap.data.every((byte, i) => (i % 4 === 3 ? byte === 255 : byte === 9))).toBe(true);
  });
});

describe("writePixel", () => {
  it("clamps byte values into [0, 255]", () => {
    const data = new Uint8Array(4);
    writePixel(data, 0, { red: -10, green: 300, blue: 128, alpha: 1000 });
    expect(Array.from(data)).toEqual([0, 255, 128, 255]);
  });
});

import { clamp } from "../../internal/math.js";
import { validatePositiveInteger } from "../../internal/validation.js";
import type { RgbaColor } from "../color.js";

// A simple RGBA8 raster buffer. Pure data plus pure pixel mutators; the only
// "state" is the underlying byte array, which is mutated in place by setters.
export interface Bitmap {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

export function createBitmap(width: number, height: number, background?: RgbaColor): Bitmap {
  validatePositiveInteger("width", width);
  validatePositiveInteger("height", height);
  const bitmap: Bitmap = { width, height, data: new Uint8Array(4 * width * height) };
  if (background) {
    fillBitmap(bitmap, background);
  }
  return bitmap;
}

export function fillBitmap(bitmap: Bitmap, color: RgbaColor): void {
  for (let offset = 0; offset < bitmap.data.length; offset += 4) {
    writePixel(bitmap.data, offset, color);
  }
}

export function writePixel(data: Uint8Array, offset: number, color: RgbaColor): void {
  data[offset] = clampByte(color.red);
  data[offset + 1] = clampByte(color.green);
  data[offset + 2] = clampByte(color.blue);
  data[offset + 3] = clampByte(color.alpha);
}

export function setPixel(bitmap: Bitmap, x: number, y: number, color: RgbaColor): void {
  if (x < 0 || y < 0 || x >= bitmap.width || y >= bitmap.height) {
    return;
  }
  blendPixel(bitmap.data, (y * bitmap.width + x) * 4, color);
}

export function blendPixel(data: Uint8Array, offset: number, source: RgbaColor): void {
  const srcA = clamp(source.alpha, 0, 255) / 255;
  const dstR = data[offset] ?? 0;
  const dstG = data[offset + 1] ?? 0;
  const dstB = data[offset + 2] ?? 0;
  const dstA = (data[offset + 3] ?? 0) / 255;
  const outA = srcA + dstA * (1 - srcA);
  data[offset] = blendChannel(clampByte(source.red), dstR, srcA, dstA, outA);
  data[offset + 1] = blendChannel(clampByte(source.green), dstG, srcA, dstA, outA);
  data[offset + 2] = blendChannel(clampByte(source.blue), dstB, srcA, dstA, outA);
  data[offset + 3] = clampByte(outA * 255);
}

function blendChannel(src: number, dst: number, srcA: number, dstA: number, outA: number): number {
  if (outA <= 0) {
    return 0;
  }
  return Math.round((src * srcA + dst * dstA * (1 - srcA)) / outA);
}

function clampByte(value: number): number {
  return Math.round(clamp(value, 0, 255));
}

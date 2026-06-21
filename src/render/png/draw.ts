import type { Bitmap } from "./bitmap.js";
import { setPixel } from "./bitmap.js";
import type { RgbaColor } from "../color.js";

// Vector-to-raster drawing primitives. All operations rasterize directly into
// the supplied Bitmap's pixel buffer via source-over blending (see bitmap.ts).

export function drawVerticalLine(
  bitmap: Bitmap,
  x: number,
  y1: number,
  y2: number,
  color: RgbaColor,
  thickness: number
): void {
  const start = Math.round(x - (thickness - 1) / 2);
  const top = Math.round(Math.min(y1, y2));
  const bottom = Math.round(Math.max(y1, y2));
  for (let t = 0; t < thickness; t += 1) {
    drawColumn(bitmap, start + t, top, bottom, color);
  }
}

function drawColumn(bitmap: Bitmap, x: number, top: number, bottom: number, color: RgbaColor): void {
  for (let y = top; y <= bottom; y += 1) {
    setPixel(bitmap, x, y, color);
  }
}

export function drawLine(bitmap: Bitmap, x1: number, y1: number, x2: number, y2: number, color: RgbaColor): void {
  const ctx = initBresenham(x1, y1, x2, y2);
  setPixel(bitmap, ctx.x, ctx.y, color);
  while (ctx.x !== ctx.endX || ctx.y !== ctx.endY) {
    advanceBresenham(ctx);
    setPixel(bitmap, ctx.x, ctx.y, color);
  }
}

interface BresenhamContext {
  x: number;
  y: number;
  endX: number;
  endY: number;
  dx: number;
  dy: number;
  sx: number;
  sy: number;
  err: number;
}

function initBresenham(x1: number, y1: number, x2: number, y2: number): BresenhamContext {
  const x = Math.round(x1);
  const y = Math.round(y1);
  const endX = Math.round(x2);
  const endY = Math.round(y2);
  return {
    x,
    y,
    endX,
    endY,
    dx: Math.abs(endX - x),
    dy: Math.abs(endY - y),
    sx: x < endX ? 1 : -1,
    sy: y < endY ? 1 : -1,
    err: Math.abs(endX - x) - Math.abs(endY - y)
  };
}

function advanceBresenham(ctx: BresenhamContext): void {
  const e2 = 2 * ctx.err;
  if (e2 > -ctx.dy) {
    ctx.err -= ctx.dy;
    ctx.x += ctx.sx;
  }
  if (e2 < ctx.dx) {
    ctx.err += ctx.dx;
    ctx.y += ctx.sy;
  }
}

export function fillRect(bitmap: Bitmap, x: number, y: number, width: number, height: number, color: RgbaColor): void {
  const start = Math.round(x);
  const top = Math.round(y);
  const w = Math.round(width);
  const h = Math.round(height);
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) {
      setPixel(bitmap, start + dx, top + dy, color);
    }
  }
}

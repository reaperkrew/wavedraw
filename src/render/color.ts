import { clamp } from "../internal/math.js";

export interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

export interface RgbaColor extends RgbColor {
  alpha: number;
}

export function normalizeColorStops(colors: string[]): RgbColor[] {
  if (colors.length < 2) {
    throw new Error("colors must include at least two color stops");
  }
  return colors.map(parseHexColor);
}

export function parseHexColor(color: string): RgbColor {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/iu.exec(color);
  if (!match) {
    throw new Error("colors must be hex strings in #rgb or #rrggbb format");
  }
  const hex = match[1]!;
  const normalized = hex.length === 3 ? hex.split("").map((part) => part + part).join("") : hex;
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

export function interpolateColorStops(colors: RgbColor[], value: number): string {
  return rgbToHex(interpolateColorStopsRgb(colors, value));
}

export function interpolateColorStopsRgb(colors: RgbColor[], value: number): RgbColor {
  const scaled = clamp(value, 0, 1) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const ratio = scaled - index;
  const start = colors[index]!;
  const end = colors[index + 1]!;
  return {
    red: Math.round(start.red + (end.red - start.red) * ratio),
    green: Math.round(start.green + (end.green - start.green) * ratio),
    blue: Math.round(start.blue + (end.blue - start.blue) * ratio)
  };
}

export function withAlpha(color: RgbColor, alpha: number): RgbaColor {
  return { red: color.red, green: color.green, blue: color.blue, alpha };
}

export function parseHexColorRgba(color: string, alpha = 255): RgbaColor {
  return withAlpha(parseHexColor(color), alpha);
}

export function rgbToHex(color: RgbColor): string {
  return `#${toHexByte(color.red)}${toHexByte(color.green)}${toHexByte(color.blue)}`;
}

export function toHexByte(value: number): string {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
}

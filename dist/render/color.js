import { clamp } from "../internal/math.js";
export function normalizeColorStops(colors) {
    if (colors.length < 2) {
        throw new Error("colors must include at least two color stops");
    }
    return colors.map(parseHexColor);
}
export function parseHexColor(color) {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/iu.exec(color);
    if (!match) {
        throw new Error("colors must be hex strings in #rgb or #rrggbb format");
    }
    const hex = match[1];
    const normalized = hex.length === 3 ? hex.split("").map((part) => part + part).join("") : hex;
    return {
        red: Number.parseInt(normalized.slice(0, 2), 16),
        green: Number.parseInt(normalized.slice(2, 4), 16),
        blue: Number.parseInt(normalized.slice(4, 6), 16)
    };
}
export function interpolateColorStops(colors, value) {
    const scaled = clamp(value, 0, 1) * (colors.length - 1);
    const index = Math.min(colors.length - 2, Math.floor(scaled));
    const ratio = scaled - index;
    const start = colors[index];
    const end = colors[index + 1];
    return rgbToHex({
        red: Math.round(start.red + (end.red - start.red) * ratio),
        green: Math.round(start.green + (end.green - start.green) * ratio),
        blue: Math.round(start.blue + (end.blue - start.blue) * ratio)
    });
}
export function rgbToHex(color) {
    return `#${toHexByte(color.red)}${toHexByte(color.green)}${toHexByte(color.blue)}`;
}
export function toHexByte(value) {
    return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
}

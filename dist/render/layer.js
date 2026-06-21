import { validatePositiveInteger } from "../internal/validation.js";
export function resolveWaveformLayers(config) {
    return {
        peaks: resolveLayer(config?.peaks, "#2563eb"),
        rms: resolveLayer(config?.rms, "#60a5fa"),
        average: resolveLayer(config?.average, "#111827")
    };
}
export function resolveLayer(style, defaultColor) {
    if (style === false) {
        return false;
    }
    if (style === undefined) {
        return { color: defaultColor, strokeWidth: 1 };
    }
    return normalizeLayer(style);
}
export function normalizeLayer(style) {
    return {
        color: style.color ?? "#2563eb",
        strokeWidth: style.strokeWidth ?? 1
    };
}
export function buildWaveformGeometry(summaryWidth, options) {
    const width = options.width ?? summaryWidth;
    const { height } = options;
    validatePositiveInteger("width", width);
    validatePositiveInteger("height", height);
    const padding = validateWaveformPadding(options.padding ?? 0, height);
    const half = (height - padding * 2) / 2;
    const mid = padding + half;
    const xScale = width / summaryWidth;
    return { width, height, padding, half, mid, xScale };
}
export function validateWaveformPadding(padding, height) {
    if (!Number.isFinite(padding) || padding < 0 || padding * 2 >= height) {
        throw new Error("padding must be finite, non-negative, and smaller than half the height");
    }
    return padding;
}

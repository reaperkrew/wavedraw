import { clamp } from "../internal/math.js";
import { validatePositiveInteger } from "../internal/validation.js";
import { interpolateColorStops, normalizeColorStops } from "./color.js";
import { formatNumber } from "./format.js";
import { closeSvg, openSvg, renderBackground } from "./svg.js";
export function renderMelSpectrogramSvg(summary, options) {
    const geometry = buildSpectrogramGeometry(summary.width, summary.melBands, options);
    const colors = normalizeColorStops(options.colors ?? ["#020617", "#0f766e", "#facc15", "#f8fafc"]);
    const elements = [openSvg(geometry.width, geometry.height, "Mel spectrogram")];
    if (options.background) {
        elements.push(renderBackground(options.background));
    }
    elements.push(...renderMelCells(summary, geometry, colors));
    elements.push(closeSvg);
    return elements.join("");
}
export function buildSpectrogramGeometry(summaryWidth, melBands, options) {
    const width = options.width ?? summaryWidth;
    const { height } = options;
    validatePositiveInteger("width", width);
    validatePositiveInteger("height", height);
    const padding = validateSpectrogramPadding(options.padding ?? 0, width, height);
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;
    return { width, height, padding, columnWidth: plotWidth / summaryWidth, bandHeight: plotHeight / melBands };
}
export function validateSpectrogramPadding(padding, width, height) {
    if (!Number.isFinite(padding) || padding < 0 || padding * 2 >= height || padding * 2 >= width) {
        throw new Error("padding must be finite, non-negative, and smaller than half the dimensions");
    }
    return padding;
}
export function renderMelCells(summary, geometry, colors) {
    const elements = [];
    for (let x = 0; x < summary.spectrogram.length; x += 1) {
        const frame = summary.spectrogram[x];
        for (let band = 0; band < summary.melBands; band += 1) {
            elements.push(renderMelCell(frame, band, x, summary.melBands, geometry, colors));
        }
    }
    return elements;
}
export function renderMelCell(frame, band, x, melBands, geometry, colors) {
    const value = clamp(frame.values[band] ?? 0, 0, 1);
    const rectX = formatNumber(geometry.padding + x * geometry.columnWidth);
    const rectY = formatNumber(geometry.padding + (melBands - band - 1) * geometry.bandHeight);
    const rectWidth = formatNumber(Math.ceil((x + 1) * geometry.columnWidth) - Math.floor(x * geometry.columnWidth));
    const rectHeight = formatNumber(Math.ceil((band + 1) * geometry.bandHeight) - Math.floor(band * geometry.bandHeight));
    return `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${interpolateColorStops(colors, value)}"/>`;
}

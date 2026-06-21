import { clamp } from "../internal/math.js";
import { escapeAttribute, formatNumber } from "./format.js";
import { buildWaveformGeometry, resolveWaveformLayers } from "./layer.js";
import { closeSvg, openSvg, renderBackground } from "./svg.js";
export function renderWaveformSvg(summary, options) {
    const geometry = buildWaveformGeometry(summary.width, options);
    const layers = resolveWaveformLayers(options.layers);
    const elements = [openSvg(geometry.width, geometry.height, "Audio waveform")];
    if (options.background) {
        elements.push(renderBackground(options.background));
    }
    for (const channel of summary.channels) {
        elements.push(...renderWaveformLayers(channel, layers, geometry));
    }
    elements.push(closeSvg);
    return elements.join("");
}
export function renderWaveformLayers(channel, layers, geometry) {
    const elements = [];
    if (layers.peaks) {
        elements.push(renderPeaksLayer(channel.columns, layers.peaks, geometry));
    }
    if (layers.rms && channel.columns.some((column) => column.rms !== undefined)) {
        elements.push(renderRmsLayer(channel.columns, layers.rms, geometry));
    }
    if (layers.average && channel.columns.some((column) => column.average !== undefined)) {
        elements.push(renderAverageLayer(channel.columns, layers.average, geometry));
    }
    return elements;
}
export function renderPeaksLayer(columns, style, geometry) {
    const lines = columns.map((column, x) => {
        const px = formatNumber((x + 0.5) * geometry.xScale);
        const y1 = formatNumber(geometry.mid - clamp(column.max, -1, 1) * geometry.half);
        const y2 = formatNumber(geometry.mid - clamp(column.min, -1, 1) * geometry.half);
        return `<line x1="${px}" y1="${y1}" x2="${px}" y2="${y2}"/>`;
    });
    return `<g stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" stroke-linecap="butt">${lines.join("")}</g>`;
}
export function renderRmsLayer(columns, style, geometry) {
    const lines = columns.map((column, x) => {
        const rms = column.rms ?? 0;
        const px = formatNumber((x + 0.5) * geometry.xScale);
        const y1 = formatNumber(geometry.mid - clamp(rms, 0, 1) * geometry.half);
        const y2 = formatNumber(geometry.mid + clamp(rms, 0, 1) * geometry.half);
        return `<line x1="${px}" y1="${y1}" x2="${px}" y2="${y2}"/>`;
    });
    return `<g stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" stroke-linecap="butt" opacity="0.7">${lines.join("")}</g>`;
}
export function renderAverageLayer(columns, style, geometry) {
    const points = columns.map((column, x) => {
        const px = formatNumber((x + 0.5) * geometry.xScale);
        const py = formatNumber(geometry.mid - clamp(column.average ?? 0, -1, 1) * geometry.half);
        return `${px},${py}`;
    });
    return `<polyline fill="none" stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" points="${points.join(" ")}"/>`;
}

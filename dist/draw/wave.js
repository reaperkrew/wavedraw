import { normalizeTimeOption } from "../internal/time.js";
import { renderWaveformSvg } from "../render/waveform-svg.js";
import { summarizeWaveform } from "../waveform/summarize.js";
import { readWavFile } from "../wav/read.js";
import { writeSvgOutput } from "./output.js";
export async function drawWave(path, options) {
    const audio = await readWavFile(path);
    const metrics = resolveWaveMetricsFromFlags(options);
    const summary = summarizeWaveform(audio, buildWaveformSummaryOptions(audio, options, metrics));
    const svg = renderWaveformSvg(summary, buildWaveformRenderOptions(options));
    await writeSvgOutput(svg, options);
    return svg;
}
export function resolveWaveMetricsFromFlags(options) {
    const metrics = [];
    if (options.maximums || options.peaks) {
        metrics.push("peaks");
    }
    if (options.rms) {
        metrics.push("rms");
    }
    if (options.average) {
        metrics.push("average");
    }
    return metrics.length > 0 ? metrics : ["peaks", "rms"];
}
export function buildWaveformSummaryOptions(audio, options, metrics) {
    return {
        width: options.width,
        channel: options.channel ?? "mix",
        startSeconds: normalizeTimeOption(options.start, 0),
        endSeconds: normalizeTimeOption(options.end, audio.durationSeconds),
        metrics
    };
}
export function buildWaveformRenderOptions(options) {
    const renderOptions = {
        width: options.width,
        height: options.height,
        layers: {
            peaks: { color: options.colors?.peaks ?? options.colors?.maximums ?? "#2563eb" },
            rms: { color: options.colors?.rms ?? "#60a5fa" },
            average: { color: options.colors?.average ?? "#111827" }
        }
    };
    const background = options.background ?? options.colors?.background;
    if (background !== undefined) {
        renderOptions.background = background;
    }
    return renderOptions;
}

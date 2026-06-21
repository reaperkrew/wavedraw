import { normalizeTimeOption } from "../internal/time.js";
import { renderMelSpectrogramSvg } from "../render/spectrogram-svg.js";
import { summarizeMelSpectrogram } from "../spectrogram/summarize.js";
import { readWavFile } from "../wav/read.js";
import { writeSvgOutput } from "./output.js";
export async function drawMelSpectrogram(path, options) {
    const audio = await readWavFile(path);
    const summary = summarizeMelSpectrogram(audio, buildMelSummaryOptions(audio, options));
    const svg = renderMelSpectrogramSvg(summary, buildMelRenderOptions(options));
    await writeSvgOutput(svg, options);
    return svg;
}
export function buildMelSummaryOptions(audio, options) {
    const summaryOptions = {
        width: options.width,
        channel: options.channel ?? "mix",
        startSeconds: normalizeTimeOption(options.start, 0),
        endSeconds: normalizeTimeOption(options.end, audio.durationSeconds)
    };
    if (options.fftSize !== undefined)
        summaryOptions.fftSize = options.fftSize;
    if (options.melBands !== undefined)
        summaryOptions.melBands = options.melBands;
    if (options.minFrequency !== undefined)
        summaryOptions.minFrequency = options.minFrequency;
    if (options.maxFrequency !== undefined)
        summaryOptions.maxFrequency = options.maxFrequency;
    if (options.dynamicRangeDb !== undefined)
        summaryOptions.dynamicRangeDb = options.dynamicRangeDb;
    return summaryOptions;
}
export function buildMelRenderOptions(options) {
    const renderOptions = {
        width: options.width,
        height: options.height
    };
    if (options.padding !== undefined)
        renderOptions.padding = options.padding;
    if (options.colors !== undefined)
        renderOptions.colors = options.colors;
    if (options.background !== undefined)
        renderOptions.background = options.background;
    return renderOptions;
}

import { readFile, writeFile } from "node:fs/promises";
const RIFF = "RIFF";
const WAVE = "WAVE";
const FMT = "fmt ";
const DATA = "data";
const PCM_FORMAT = 1;
const FLOAT_FORMAT = 3;
export async function readWavFile(path, options = {}) {
    const input = await readFile(path);
    return parseWav(input, options);
}
export function parseWav(input, _options = {}) {
    const bytes = toUint8Array(input);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (bytes.byteLength < 12) {
        throw new Error("Invalid WAV: file is too small");
    }
    if (readAscii(bytes, 0, 4) !== RIFF) {
        throw new Error("Invalid WAV: missing RIFF header");
    }
    if (readAscii(bytes, 8, 4) !== WAVE) {
        throw new Error("Invalid WAV: missing WAVE format");
    }
    let fmt;
    let dataOffset = -1;
    let dataLength = 0;
    let offset = 12;
    while (offset + 8 <= bytes.byteLength) {
        const id = readAscii(bytes, offset, 4);
        const size = view.getUint32(offset + 4, true);
        const payloadOffset = offset + 8;
        const nextOffset = payloadOffset + size + (size % 2);
        if (payloadOffset + size > bytes.byteLength) {
            throw new Error(`Invalid WAV: chunk ${id.trim() || "(empty)"} exceeds file length`);
        }
        if (id === FMT) {
            fmt = parseFmtChunk(view, payloadOffset, size);
        }
        else if (id === DATA) {
            dataOffset = payloadOffset;
            dataLength = size;
        }
        offset = nextOffset;
    }
    if (!fmt) {
        throw new Error("Invalid WAV: missing fmt chunk");
    }
    if (dataOffset < 0) {
        throw new Error("Invalid WAV: missing data chunk");
    }
    const format = {
        ...fmt,
        dataOffset,
        dataLength
    };
    validateFormat(format);
    const frames = Math.floor(dataLength / format.blockAlign);
    const channels = decodeChannels(view, format, frames);
    return {
        format,
        channels,
        frames,
        durationSeconds: frames / format.sampleRate
    };
}
export function summarizeWaveform(audio, options) {
    validatePositiveInteger("width", options.width);
    const { startSeconds, endSeconds } = normalizeTimeRange(audio, options.startSeconds, options.endSeconds);
    const startFrame = Math.floor(startSeconds * audio.format.sampleRate);
    const endFrame = Math.min(audio.frames, Math.ceil(endSeconds * audio.format.sampleRate));
    const selectedFrames = Math.max(0, endFrame - startFrame);
    const metrics = new Set(options.metrics ?? ["peaks", "rms"]);
    const selectedChannels = selectChannels(audio, options.channel ?? "mix");
    return {
        width: options.width,
        sampleRate: audio.format.sampleRate,
        startSeconds,
        endSeconds,
        frames: selectedFrames,
        channels: selectedChannels.map((channel) => ({
            channel: channel.channel,
            columns: summarizeChannel(channel.samples, startFrame, endFrame, options.width, metrics)
        }))
    };
}
export function summarizeMelSpectrogram(audio, options) {
    validatePositiveInteger("width", options.width);
    const fftSize = options.fftSize ?? 1024;
    validatePositiveInteger("fftSize", fftSize);
    if (fftSize < 2) {
        throw new Error("fftSize must be at least 2");
    }
    const melBands = options.melBands ?? 64;
    validatePositiveInteger("melBands", melBands);
    const minFrequency = options.minFrequency ?? 0;
    const maxFrequency = options.maxFrequency ?? audio.format.sampleRate / 2;
    validateFrequencyRange(audio.format.sampleRate, minFrequency, maxFrequency);
    const dynamicRangeDb = options.dynamicRangeDb ?? 80;
    if (!Number.isFinite(dynamicRangeDb) || dynamicRangeDb <= 0) {
        throw new Error("dynamicRangeDb must be a finite number greater than 0");
    }
    const { startSeconds, endSeconds } = normalizeTimeRange(audio, options.startSeconds, options.endSeconds);
    const startFrame = Math.floor(startSeconds * audio.format.sampleRate);
    const endFrame = Math.min(audio.frames, Math.ceil(endSeconds * audio.format.sampleRate));
    const selectedFrames = Math.max(0, endFrame - startFrame);
    const selectedChannels = selectChannels(audio, options.channel ?? "mix");
    const samples = selectedChannels[0].samples;
    const window = hannWindow(fftSize);
    const filterbank = createMelFilterbank({
        fftSize,
        melBands,
        sampleRate: audio.format.sampleRate,
        minFrequency,
        maxFrequency
    });
    const rawFrames = [];
    let maxDecibels = Number.NEGATIVE_INFINITY;
    for (let x = 0; x < options.width; x += 1) {
        const frameStart = startFrame + Math.floor((x * selectedFrames) / options.width);
        const powerSpectrum = computePowerSpectrum(samples, frameStart, endFrame, fftSize, window);
        const melValues = filterbank.map((weights) => {
            let energy = 0;
            for (let index = 0; index < weights.length; index += 1) {
                energy += (powerSpectrum[index] ?? 0) * (weights[index] ?? 0);
            }
            const decibels = 10 * Math.log10(Math.max(energy, 1e-12));
            if (decibels > maxDecibels) {
                maxDecibels = decibels;
            }
            return decibels;
        });
        rawFrames.push(melValues);
    }
    if (!Number.isFinite(maxDecibels)) {
        maxDecibels = -120;
    }
    const minDecibels = maxDecibels - dynamicRangeDb;
    return {
        width: options.width,
        sampleRate: audio.format.sampleRate,
        startSeconds,
        endSeconds,
        frames: selectedFrames,
        fftSize,
        melBands,
        minFrequency,
        maxFrequency,
        minDecibels,
        maxDecibels,
        spectrogram: rawFrames.map((values) => ({
            values: values.map((value) => clamp((value - minDecibels) / dynamicRangeDb, 0, 1))
        }))
    };
}
export function renderWaveformSvg(summary, options) {
    const width = options.width ?? summary.width;
    const { height } = options;
    validatePositiveInteger("width", width);
    validatePositiveInteger("height", height);
    const padding = options.padding ?? 0;
    if (!Number.isFinite(padding) || padding < 0 || padding * 2 >= height) {
        throw new Error("padding must be finite, non-negative, and smaller than half the height");
    }
    const layers = {
        peaks: options.layers?.peaks ?? { color: "#2563eb", strokeWidth: 1 },
        rms: options.layers?.rms ?? { color: "#60a5fa", strokeWidth: 1 },
        average: options.layers?.average ?? { color: "#111827", strokeWidth: 1 }
    };
    const half = (height - padding * 2) / 2;
    const mid = padding + half;
    const xScale = width / summary.width;
    const elements = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Audio waveform">`
    ];
    if (options.background) {
        elements.push(`<rect width="100%" height="100%" fill="${escapeAttribute(options.background)}"/>`);
    }
    for (const channel of summary.channels) {
        if (layers.peaks) {
            const style = normalizeLayer(layers.peaks);
            const lines = channel.columns.map((column, x) => {
                const px = formatNumber((x + 0.5) * xScale);
                const y1 = formatNumber(mid - clamp(column.max, -1, 1) * half);
                const y2 = formatNumber(mid - clamp(column.min, -1, 1) * half);
                return `<line x1="${px}" y1="${y1}" x2="${px}" y2="${y2}"/>`;
            });
            elements.push(`<g stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" stroke-linecap="butt">${lines.join("")}</g>`);
        }
        if (layers.rms && channel.columns.some((column) => column.rms !== undefined)) {
            const style = normalizeLayer(layers.rms);
            const lines = channel.columns.map((column, x) => {
                const rms = column.rms ?? 0;
                const px = formatNumber((x + 0.5) * xScale);
                const y1 = formatNumber(mid - clamp(rms, 0, 1) * half);
                const y2 = formatNumber(mid + clamp(rms, 0, 1) * half);
                return `<line x1="${px}" y1="${y1}" x2="${px}" y2="${y2}"/>`;
            });
            elements.push(`<g stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" stroke-linecap="butt" opacity="0.7">${lines.join("")}</g>`);
        }
        if (layers.average && channel.columns.some((column) => column.average !== undefined)) {
            const style = normalizeLayer(layers.average);
            const points = channel.columns.map((column, x) => {
                const px = formatNumber((x + 0.5) * xScale);
                const py = formatNumber(mid - clamp(column.average ?? 0, -1, 1) * half);
                return `${px},${py}`;
            });
            elements.push(`<polyline fill="none" stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" points="${points.join(" ")}"/>`);
        }
    }
    elements.push("</svg>");
    return elements.join("");
}
export function renderMelSpectrogramSvg(summary, options) {
    const width = options.width ?? summary.width;
    const { height } = options;
    validatePositiveInteger("width", width);
    validatePositiveInteger("height", height);
    const padding = options.padding ?? 0;
    if (!Number.isFinite(padding) || padding < 0 || padding * 2 >= height || padding * 2 >= width) {
        throw new Error("padding must be finite, non-negative, and smaller than half the dimensions");
    }
    const colors = normalizeColorStops(options.colors ?? ["#020617", "#0f766e", "#facc15", "#f8fafc"]);
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;
    const columnWidth = plotWidth / summary.width;
    const bandHeight = plotHeight / summary.melBands;
    const elements = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Mel spectrogram">`
    ];
    if (options.background) {
        elements.push(`<rect width="100%" height="100%" fill="${escapeAttribute(options.background)}"/>`);
    }
    for (let x = 0; x < summary.spectrogram.length; x += 1) {
        const frame = summary.spectrogram[x];
        for (let band = 0; band < summary.melBands; band += 1) {
            const value = clamp(frame.values[band] ?? 0, 0, 1);
            const rectX = formatNumber(padding + x * columnWidth);
            const rectY = formatNumber(padding + (summary.melBands - band - 1) * bandHeight);
            const rectWidth = formatNumber(Math.ceil((x + 1) * columnWidth) - Math.floor(x * columnWidth));
            const rectHeight = formatNumber(Math.ceil((band + 1) * bandHeight) - Math.floor(band * bandHeight));
            elements.push(`<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${interpolateColorStops(colors, value)}"/>`);
        }
    }
    elements.push("</svg>");
    return elements.join("");
}
export async function drawWave(path, options) {
    const audio = await readWavFile(path);
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
    const summary = summarizeWaveform(audio, {
        width: options.width,
        channel: options.channel ?? "mix",
        startSeconds: normalizeTimeOption(options.start, 0),
        endSeconds: normalizeTimeOption(options.end, audio.durationSeconds),
        metrics: metrics.length > 0 ? metrics : ["peaks", "rms"]
    });
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
    const svg = renderWaveformSvg(summary, renderOptions);
    const output = options.output ?? options.filename;
    if (output) {
        await writeFile(output, svg);
    }
    return svg;
}
export async function drawMelSpectrogram(path, options) {
    const audio = await readWavFile(path);
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
    const summary = summarizeMelSpectrogram(audio, summaryOptions);
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
    const svg = renderMelSpectrogramSvg(summary, renderOptions);
    const output = options.output ?? options.filename;
    if (output) {
        await writeFile(output, svg);
    }
    return svg;
}
function toUint8Array(input) {
    if (input instanceof Uint8Array) {
        return input;
    }
    return new Uint8Array(input);
}
function parseFmtChunk(view, offset, size) {
    if (size < 16) {
        throw new Error("Invalid WAV: fmt chunk is too small");
    }
    const audioFormatCode = view.getUint16(offset, true);
    const channels = view.getUint16(offset + 2, true);
    const sampleRate = view.getUint32(offset + 4, true);
    const byteRate = view.getUint32(offset + 8, true);
    const blockAlign = view.getUint16(offset + 12, true);
    const bitsPerSample = view.getUint16(offset + 14, true);
    if (audioFormatCode !== PCM_FORMAT && audioFormatCode !== FLOAT_FORMAT) {
        throw new Error(`Unsupported WAV audio format: ${audioFormatCode}`);
    }
    if (!isSupportedBitsPerSample(bitsPerSample)) {
        throw new Error(`Unsupported WAV bits per sample: ${bitsPerSample}`);
    }
    return {
        audioFormat: audioFormatCode === PCM_FORMAT ? "pcm" : "float",
        channels,
        sampleRate,
        byteRate,
        blockAlign,
        bitsPerSample
    };
}
function validateFormat(format) {
    if (format.channels < 1 || !Number.isInteger(format.channels)) {
        throw new Error("Invalid WAV: channel count must be a positive integer");
    }
    if (format.sampleRate < 1 || !Number.isInteger(format.sampleRate)) {
        throw new Error("Invalid WAV: sample rate must be a positive integer");
    }
    if (format.audioFormat === "float" && format.bitsPerSample !== 32) {
        throw new Error("Unsupported WAV: float audio must use 32 bits per sample");
    }
    const expectedBlockAlign = format.channels * (format.bitsPerSample / 8);
    if (format.blockAlign !== expectedBlockAlign) {
        throw new Error("Invalid WAV: blockAlign does not match channel count and bit depth");
    }
    const expectedByteRate = format.sampleRate * format.blockAlign;
    if (format.byteRate !== expectedByteRate) {
        throw new Error("Invalid WAV: byteRate does not match sampleRate and blockAlign");
    }
    if (format.dataLength % format.blockAlign !== 0) {
        throw new Error("Invalid WAV: data chunk is not aligned to frame size");
    }
}
function decodeChannels(view, format, frames) {
    const channels = Array.from({ length: format.channels }, () => new Float32Array(frames));
    const bytesPerSample = format.bitsPerSample / 8;
    for (let frame = 0; frame < frames; frame += 1) {
        const frameOffset = format.dataOffset + frame * format.blockAlign;
        for (let channel = 0; channel < format.channels; channel += 1) {
            const sampleOffset = frameOffset + channel * bytesPerSample;
            channels[channel][frame] = readSample(view, sampleOffset, format);
        }
    }
    return channels;
}
function readSample(view, offset, format) {
    if (format.audioFormat === "float") {
        return clamp(view.getFloat32(offset, true), -1, 1);
    }
    switch (format.bitsPerSample) {
        case 8:
            return (view.getUint8(offset) - 128) / 128;
        case 16:
            return normalizeSigned(view.getInt16(offset, true), 32768);
        case 24:
            return normalizeSigned(readInt24(view, offset), 8388608);
        case 32:
            return normalizeSigned(view.getInt32(offset, true), 2147483648);
    }
}
function readInt24(view, offset) {
    const value = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
    return value & 0x800000 ? value | 0xff000000 : value;
}
function normalizeSigned(value, divisor) {
    return Math.max(-1, Math.min(1, value / divisor));
}
function selectChannels(audio, channel) {
    if (channel === "all") {
        return audio.channels.map((samples, index) => ({ channel: index, samples }));
    }
    if (channel === "mix") {
        if (audio.channels.length === 1) {
            return [{ channel: 0, samples: audio.channels[0] }];
        }
        const mixed = new Float32Array(audio.frames);
        for (let frame = 0; frame < audio.frames; frame += 1) {
            let sum = 0;
            for (const samples of audio.channels) {
                sum += samples[frame] ?? 0;
            }
            mixed[frame] = sum / audio.channels.length;
        }
        return [{ channel: "mix", samples: mixed }];
    }
    if (!Number.isInteger(channel) || channel < 0 || channel >= audio.channels.length) {
        throw new Error(`channel must be "mix", "all", or an integer from 0 to ${audio.channels.length - 1}`);
    }
    return [{ channel, samples: audio.channels[channel] }];
}
function summarizeChannel(samples, startFrame, endFrame, width, metrics) {
    const selectedFrames = endFrame - startFrame;
    const columns = [];
    for (let x = 0; x < width; x += 1) {
        const bucketStart = startFrame + Math.floor((x * selectedFrames) / width);
        const bucketEnd = startFrame + Math.floor(((x + 1) * selectedFrames) / width);
        const actualEnd = Math.max(bucketEnd, bucketStart + 1);
        const end = Math.min(actualEnd, endFrame);
        let min = 1;
        let max = -1;
        let sum = 0;
        let sumSquares = 0;
        let count = 0;
        for (let frame = bucketStart; frame < end; frame += 1) {
            const sample = samples[frame] ?? 0;
            if (sample < min)
                min = sample;
            if (sample > max)
                max = sample;
            sum += sample;
            sumSquares += sample * sample;
            count += 1;
        }
        if (count === 0) {
            min = 0;
            max = 0;
        }
        const column = {
            min: metrics.has("peaks") ? min : 0,
            max: metrics.has("peaks") ? max : 0
        };
        if (metrics.has("rms")) {
            column.rms = count > 0 ? Math.sqrt(sumSquares / count) : 0;
        }
        if (metrics.has("average")) {
            column.average = count > 0 ? sum / count : 0;
        }
        columns.push(column);
    }
    return columns;
}
function normalizeTimeRange(audio, startSecondsOption, endSecondsOption) {
    const startSeconds = startSecondsOption ?? 0;
    const endSeconds = endSecondsOption ?? audio.durationSeconds;
    if (!Number.isFinite(startSeconds) || startSeconds < 0) {
        throw new Error("startSeconds must be a finite number greater than or equal to 0");
    }
    if (!Number.isFinite(endSeconds) || endSeconds <= startSeconds) {
        throw new Error("endSeconds must be greater than startSeconds");
    }
    if (endSeconds > audio.durationSeconds) {
        throw new Error("endSeconds exceeds audio duration");
    }
    return { startSeconds, endSeconds };
}
function validateFrequencyRange(sampleRate, minFrequency, maxFrequency) {
    const nyquist = sampleRate / 2;
    if (!Number.isFinite(minFrequency) || minFrequency < 0) {
        throw new Error("minFrequency must be a finite number greater than or equal to 0");
    }
    if (!Number.isFinite(maxFrequency) || maxFrequency <= minFrequency) {
        throw new Error("maxFrequency must be greater than minFrequency");
    }
    if (maxFrequency > nyquist) {
        throw new Error("maxFrequency cannot exceed the Nyquist frequency");
    }
}
function createMelFilterbank(options) {
    const melMin = hertzToMel(options.minFrequency);
    const melMax = hertzToMel(options.maxFrequency);
    const melPoints = Array.from({ length: options.melBands + 2 }, (_, index) => {
        const ratio = index / (options.melBands + 1);
        return melToHertz(melMin + (melMax - melMin) * ratio);
    });
    const bins = Math.floor(options.fftSize / 2) + 1;
    return Array.from({ length: options.melBands }, (_, band) => {
        const lower = melPoints[band];
        const center = melPoints[band + 1];
        const upper = melPoints[band + 2];
        const weights = new Array(bins).fill(0);
        for (let bin = 0; bin < bins; bin += 1) {
            const frequency = (bin * options.sampleRate) / options.fftSize;
            if (frequency >= lower && frequency <= center && center > lower) {
                weights[bin] = (frequency - lower) / (center - lower);
            }
            else if (frequency > center && frequency <= upper && upper > center) {
                weights[bin] = (upper - frequency) / (upper - center);
            }
        }
        const sum = weights.reduce((total, weight) => total + weight, 0);
        return sum > 0 ? weights.map((weight) => weight / sum) : weights;
    });
}
function computePowerSpectrum(samples, frameStart, endFrame, fftSize, window) {
    const bins = Math.floor(fftSize / 2) + 1;
    const spectrum = new Array(bins).fill(0);
    for (let bin = 0; bin < bins; bin += 1) {
        let real = 0;
        let imaginary = 0;
        for (let index = 0; index < fftSize; index += 1) {
            const sampleIndex = frameStart + index;
            const sample = sampleIndex < endFrame ? samples[sampleIndex] ?? 0 : 0;
            const windowed = sample * window[index];
            const angle = (2 * Math.PI * bin * index) / fftSize;
            real += windowed * Math.cos(angle);
            imaginary -= windowed * Math.sin(angle);
        }
        spectrum[bin] = (real * real + imaginary * imaginary) / fftSize;
    }
    return spectrum;
}
function hannWindow(size) {
    if (size === 1) {
        return new Float64Array([1]);
    }
    return Float64Array.from({ length: size }, (_, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (size - 1)));
}
function hertzToMel(value) {
    return 2595 * Math.log10(1 + value / 700);
}
function melToHertz(value) {
    return 700 * (10 ** (value / 2595) - 1);
}
function normalizeColorStops(colors) {
    if (colors.length < 2) {
        throw new Error("colors must include at least two color stops");
    }
    return colors.map(parseHexColor);
}
function parseHexColor(color) {
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
function interpolateColorStops(colors, value) {
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
function rgbToHex(color) {
    return `#${toHexByte(color.red)}${toHexByte(color.green)}${toHexByte(color.blue)}`;
}
function toHexByte(value) {
    return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
}
function normalizeLayer(style) {
    return {
        color: style.color ?? "#2563eb",
        strokeWidth: style.strokeWidth ?? 1
    };
}
function normalizeTimeOption(value, fallback) {
    if (value === undefined || value === "START" || value === "END") {
        return fallback;
    }
    if (typeof value === "number") {
        return value;
    }
    const parts = value.split(":").map((part) => Number.parseInt(part, 10));
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
        throw new Error("time strings must use HH:MM:SS format");
    }
    return parts[0] * 60 * 60 + parts[1] * 60 + parts[2];
}
function readAscii(bytes, offset, length) {
    let result = "";
    for (let i = 0; i < length; i += 1) {
        result += String.fromCharCode(bytes[offset + i] ?? 0);
    }
    return result;
}
function isSupportedBitsPerSample(value) {
    return value === 8 || value === 16 || value === 24 || value === 32;
}
function validatePositiveInteger(name, value) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${name} must be a positive integer`);
    }
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function escapeAttribute(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("\"", "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

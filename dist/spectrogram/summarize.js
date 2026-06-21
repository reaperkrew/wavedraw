import { validatePositiveInteger } from "../internal/validation.js";
import { computeMelFrames, normalizeMelFrames } from "./frames.js";
import { resolveMelOptions } from "./options.js";
import { createMelFilterbank } from "./filterbank.js";
import { hannWindow } from "./spectrum.js";
export function summarizeMelSpectrogram(audio, options) {
    validatePositiveInteger("width", options.width);
    const resolved = resolveMelOptions(audio, options);
    const startFrame = Math.floor(resolved.startSeconds * audio.format.sampleRate);
    const endFrame = Math.min(audio.frames, Math.ceil(resolved.endSeconds * audio.format.sampleRate));
    const selectedFrames = Math.max(0, endFrame - startFrame);
    const samples = selectSpectrogramSamples(audio, options.channel ?? "mix");
    const pipeline = buildMelPipeline(audio, resolved);
    const accumulator = computeMelFrames(samples, startFrame, endFrame, options.width, resolved.fftSize, pipeline.window, pipeline.filterbank);
    const spectrogram = normalizeMelFrames(accumulator.frames, accumulator.maxDecibels, resolved.dynamicRangeDb);
    return buildMelSummary(audio, options, resolved, selectedFrames, spectrogram, accumulator.maxDecibels);
}
export function selectSpectrogramSamples(audio, channel) {
    if (channel === "mix") {
        return mixSpectrogramChannels(audio);
    }
    if (!Number.isInteger(channel) || channel < 0 || channel >= audio.channels.length) {
        throw new Error(`channel must be "mix" or an integer from 0 to ${audio.channels.length - 1}`);
    }
    return audio.channels[channel];
}
export function mixSpectrogramChannels(audio) {
    if (audio.channels.length === 1) {
        return audio.channels[0];
    }
    const mixed = new Float32Array(audio.frames);
    for (let frame = 0; frame < audio.frames; frame += 1) {
        let sum = 0;
        for (const samples of audio.channels) {
            sum += samples[frame] ?? 0;
        }
        mixed[frame] = sum / audio.channels.length;
    }
    return mixed;
}
export function buildMelPipeline(audio, resolved) {
    return {
        window: hannWindow(resolved.fftSize),
        filterbank: createMelFilterbank({
            fftSize: resolved.fftSize,
            melBands: resolved.melBands,
            sampleRate: audio.format.sampleRate,
            minFrequency: resolved.minFrequency,
            maxFrequency: resolved.maxFrequency
        })
    };
}
export function buildMelSummary(audio, options, resolved, selectedFrames, spectrogram, maxDecibels) {
    return {
        width: options.width,
        sampleRate: audio.format.sampleRate,
        startSeconds: resolved.startSeconds,
        endSeconds: resolved.endSeconds,
        frames: selectedFrames,
        fftSize: resolved.fftSize,
        melBands: resolved.melBands,
        minFrequency: resolved.minFrequency,
        maxFrequency: resolved.maxFrequency,
        minDecibels: maxDecibels - resolved.dynamicRangeDb,
        maxDecibels,
        spectrogram
    };
}

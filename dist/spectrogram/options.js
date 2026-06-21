import { normalizeTimeRange } from "../internal/time.js";
import { validatePositiveInteger } from "../internal/validation.js";
export function resolveMelOptions(audio, options) {
    const fftSize = resolveFftSize(options.fftSize);
    const melBands = resolveMelBands(options.melBands);
    const frequencies = resolveFrequencyRange(audio.format.sampleRate, options.minFrequency, options.maxFrequency);
    const dynamicRangeDb = resolveDynamicRangeDb(options.dynamicRangeDb);
    const timeRange = normalizeTimeRange(audio.durationSeconds, options.startSeconds, options.endSeconds);
    return { fftSize, melBands, ...frequencies, dynamicRangeDb, ...timeRange };
}
export function resolveFftSize(value) {
    const fftSize = value ?? 1024;
    validatePositiveInteger("fftSize", fftSize);
    if (fftSize < 2) {
        throw new Error("fftSize must be at least 2");
    }
    return fftSize;
}
export function resolveMelBands(value) {
    const melBands = value ?? 64;
    validatePositiveInteger("melBands", melBands);
    return melBands;
}
export function resolveFrequencyRange(sampleRate, minOption, maxOption) {
    const minFrequency = minOption ?? 0;
    const maxFrequency = maxOption ?? sampleRate / 2;
    validateFrequencyRange(sampleRate, minFrequency, maxFrequency);
    return { minFrequency, maxFrequency };
}
export function resolveDynamicRangeDb(value) {
    const dynamicRangeDb = value ?? 80;
    if (!Number.isFinite(dynamicRangeDb) || dynamicRangeDb <= 0) {
        throw new Error("dynamicRangeDb must be a finite number greater than 0");
    }
    return dynamicRangeDb;
}
export function validateFrequencyRange(sampleRate, minFrequency, maxFrequency) {
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

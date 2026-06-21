import { clamp } from "../internal/math.js";
export function decodeChannels(view, format, frames) {
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
export function readSample(view, offset, format) {
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
export function readInt24(view, offset) {
    const value = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
    return value & 0x800000 ? value | 0xff000000 : value;
}
export function normalizeSigned(value, divisor) {
    return Math.max(-1, Math.min(1, value / divisor));
}

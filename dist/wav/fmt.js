import { isSupportedBitsPerSample } from "./validate.js";
const PCM_FORMAT = 1;
const FLOAT_FORMAT = 3;
export function parseFmtChunk(view, offset, size) {
    if (size < 16) {
        throw new Error("Invalid WAV: fmt chunk is too small");
    }
    const fields = readFmtFields(view, offset);
    const validated = validateFmtFields(fields.audioFormatCode, fields.bitsPerSample);
    return { ...fields, ...validated };
}
export function readFmtFields(view, offset) {
    return {
        audioFormatCode: view.getUint16(offset, true),
        channels: view.getUint16(offset + 2, true),
        sampleRate: view.getUint32(offset + 4, true),
        byteRate: view.getUint32(offset + 8, true),
        blockAlign: view.getUint16(offset + 12, true),
        bitsPerSample: view.getUint16(offset + 14, true)
    };
}
export function validateFmtFields(audioFormatCode, bitsPerSample) {
    if (audioFormatCode !== PCM_FORMAT && audioFormatCode !== FLOAT_FORMAT) {
        throw new Error(`Unsupported WAV audio format: ${audioFormatCode}`);
    }
    if (!isSupportedBitsPerSample(bitsPerSample)) {
        throw new Error(`Unsupported WAV bits per sample: ${bitsPerSample}`);
    }
    return {
        audioFormat: audioFormatCode === PCM_FORMAT ? "pcm" : "float",
        bitsPerSample
    };
}

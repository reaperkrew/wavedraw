import { readAscii } from "../internal/ascii.js";
const RIFF = "RIFF";
const WAVE = "WAVE";
export function parseRiffHeader(bytes) {
    if (bytes.byteLength < 12) {
        throw new Error("Invalid WAV: file is too small");
    }
    if (readAscii(bytes, 0, 4) !== RIFF) {
        throw new Error("Invalid WAV: missing RIFF header");
    }
    if (readAscii(bytes, 8, 4) !== WAVE) {
        throw new Error("Invalid WAV: missing WAVE format");
    }
}

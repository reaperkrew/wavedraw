import type { WavFormat } from "./types.js";

export function validateFormat(format: WavFormat): void {
  validateFormatBasics(format);
  validateFormatAlignment(format);
}

export function validateFormatBasics(format: WavFormat): void {
  if (format.channels < 1 || !Number.isInteger(format.channels)) {
    throw new Error("Invalid WAV: channel count must be a positive integer");
  }
  if (format.sampleRate < 1 || !Number.isInteger(format.sampleRate)) {
    throw new Error("Invalid WAV: sample rate must be a positive integer");
  }
  if (format.audioFormat === "float" && format.bitsPerSample !== 32) {
    throw new Error("Unsupported WAV: float audio must use 32 bits per sample");
  }
}

export function validateFormatAlignment(format: WavFormat): void {
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

export function isSupportedBitsPerSample(value: number): value is WavFormat["bitsPerSample"] {
  return value === 8 || value === 16 || value === 24 || value === 32;
}

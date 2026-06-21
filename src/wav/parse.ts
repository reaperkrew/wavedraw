import { decodeChannels } from "./decode.js";
import { scanChunks, type ScannedChunks } from "./chunks.js";
import { parseRiffHeader } from "./header.js";
import { validateFormat } from "./validate.js";
import type { ParseWavOptions, WavAudio, WavFormat } from "./types.js";

export function parseWav(input: Buffer | ArrayBuffer | Uint8Array, _options: ParseWavOptions = {}): WavAudio {
  const bytes = toUint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  parseRiffHeader(bytes);
  const format = buildFormat(scanChunks(bytes, view));
  validateFormat(format);

  const frames = Math.floor(format.dataLength / format.blockAlign);
  const channels = decodeChannels(view, format, frames);

  return { format, channels, frames, durationSeconds: frames / format.sampleRate };
}

export function buildFormat(scanned: ScannedChunks): WavFormat {
  if (!scanned.fmt) {
    throw new Error("Invalid WAV: missing fmt chunk");
  }
  if (scanned.dataOffset < 0) {
    throw new Error("Invalid WAV: missing data chunk");
  }
  return { ...scanned.fmt, dataOffset: scanned.dataOffset, dataLength: scanned.dataLength };
}

export function toUint8Array(input: Buffer | ArrayBuffer | Uint8Array): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }
  return new Uint8Array(input);
}

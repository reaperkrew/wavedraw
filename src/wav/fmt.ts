import type { WavAudioFormat, WavFormat } from "./types.js";
import { isSupportedBitsPerSample } from "./validate.js";

const PCM_FORMAT = 1;
const FLOAT_FORMAT = 3;
const EXTENSIBLE_FORMAT = 0xfffe;

const EXTENSIBLE_SUBFORMAT_OFFSET = 24;
const EXTENSIBLE_MIN_SIZE = 40;

interface FmtFields {
  audioFormatCode: number;
  channels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
}

interface ValidatedFmt {
  audioFormat: WavAudioFormat;
  bitsPerSample: WavFormat["bitsPerSample"];
}

export function parseFmtChunk(view: DataView, offset: number, size: number): Omit<WavFormat, "dataOffset" | "dataLength"> {
  if (size < 16) {
    throw new Error("Invalid WAV: fmt chunk is too small");
  }
  const fields = readFmtFields(view, offset);
  const effectiveCode = resolveAudioFormatCode(view, offset, size, fields.audioFormatCode);
  const validated = validateFmtFields(effectiveCode, fields.bitsPerSample);
  return { ...fields, ...validated };
}

export function resolveAudioFormatCode(view: DataView, offset: number, size: number, code: number): number {
  if (code !== EXTENSIBLE_FORMAT) {
    return code;
  }
  if (size < EXTENSIBLE_MIN_SIZE) {
    throw new Error("Invalid WAV: WAVE_FORMAT_EXTENSIBLE fmt chunk is too small");
  }
  return view.getUint16(offset + EXTENSIBLE_SUBFORMAT_OFFSET, true);
}

export function readFmtFields(view: DataView, offset: number): FmtFields {
  return {
    audioFormatCode: view.getUint16(offset, true),
    channels: view.getUint16(offset + 2, true),
    sampleRate: view.getUint32(offset + 4, true),
    byteRate: view.getUint32(offset + 8, true),
    blockAlign: view.getUint16(offset + 12, true),
    bitsPerSample: view.getUint16(offset + 14, true)
  };
}

export function validateFmtFields(audioFormatCode: number, bitsPerSample: number): ValidatedFmt {
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

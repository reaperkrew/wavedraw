import { makeWav } from "./wav.js";

export interface MakeExtensibleWavOptions {
  channels: number;
  sampleRate: number;
  bitsPerSample: 8 | 16 | 24 | 32 | 64;
  samples: number[][];
  subFormatCode: 1 | 3;
}

// KSDATAFORMAT_SUBTYPE tail (bytes 2..15) is identical for PCM and IEEE_FLOAT:
// 00 00 00 00 00 10 00 80 00 00 aa 00 38 9b 71. The first two bytes carry the
// real format code (little-endian), which resolveAudioFormatCode reads.
const SUBFORMAT_TAIL = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x80, 0x00, 0x00, 0xaa, 0x00, 0x38, 0x9b, 0x71]);

export function makeExtensibleWav(options: MakeExtensibleWavOptions): Buffer {
  const { channels, sampleRate, bitsPerSample, samples, subFormatCode } = options;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = channels * bytesPerSample;
  const frames = samples[0]?.length ?? 0;
  const dataSize = frames * blockAlign;
  const fmtSize = 40;
  const fileSize = 12 + 8 + fmtSize + 8 + dataSize;
  const buffer = Buffer.alloc(fileSize);
  let offset = writeExtensibleHeader(buffer, { fileSize, channels, sampleRate, blockAlign, bitsPerSample, subFormatCode, fmtSize });

  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = samples[channel]![frame] ?? 0;
      offset = writeExtensibleSample(buffer, offset, sample, subFormatCode, bitsPerSample);
    }
  }
  return buffer;
}

interface ExtensibleHeader {
  fileSize: number;
  channels: number;
  sampleRate: number;
  blockAlign: number;
  bitsPerSample: number;
  subFormatCode: 1 | 3;
  fmtSize: number;
}

function writeExtensibleHeader(buffer: Buffer, h: ExtensibleHeader): number {
  let offset = 0;
  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(h.fileSize - 8, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(h.fmtSize, offset); offset += 4;
  buffer.writeUInt16LE(0xfffe, offset); offset += 2;
  buffer.writeUInt16LE(h.channels, offset); offset += 2;
  buffer.writeUInt32LE(h.sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(h.sampleRate * h.blockAlign, offset); offset += 4;
  buffer.writeUInt16LE(h.blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(h.bitsPerSample, offset); offset += 2;
  buffer.writeUInt16LE(22, offset); offset += 2; // cbSize
  buffer.writeUInt16LE(h.bitsPerSample, offset); offset += 2; // validBitsPerSample
  buffer.writeUInt32LE(0, offset); offset += 4; // channelMask
  buffer.writeUInt16LE(h.subFormatCode, offset); offset += 2; // subFormat[0..2]
  SUBFORMAT_TAIL.copy(buffer, offset); offset += SUBFORMAT_TAIL.length; // subFormat[2..16]
  return offset;
}

function writeExtensibleSample(buffer: Buffer, offset: number, sample: number, code: 1 | 3, bits: number): number {
  if (code === 3) {
    if (bits === 64) buffer.writeDoubleLE(sample, offset);
    else buffer.writeFloatLE(sample, offset);
  } else if (bits === 8) {
    buffer.writeUInt8(sample, offset);
  } else if (bits === 16) {
    buffer.writeInt16LE(sample, offset);
  } else if (bits === 24) {
    buffer.writeUIntLE(sample < 0 ? sample + 0x1000000 : sample, offset, 3);
  } else {
    buffer.writeInt32LE(sample, offset);
  }
  return offset + bits / 8;
}

export interface MakeFloat64WavOptions {
  channels: number;
  sampleRate: number;
  samples: number[][];
}

export function makeFloat64Wav(options: MakeFloat64WavOptions): Buffer {
  const { channels, sampleRate, samples } = options;
  const bytesPerSample = 8;
  const blockAlign = channels * bytesPerSample;
  const frames = samples[0]?.length ?? 0;
  const dataSize = frames * blockAlign;
  const fileSize = 12 + 24 + 8 + dataSize;
  const buffer = Buffer.alloc(fileSize);
  let offset = 0;
  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(3, offset); offset += 2;
  buffer.writeUInt16LE(channels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(sampleRate * blockAlign, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(64, offset); offset += 2;
  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      buffer.writeDoubleLE(samples[channel]![frame] ?? 0, offset);
      offset += bytesPerSample;
    }
  }
  return buffer;
}

export { makeWav };

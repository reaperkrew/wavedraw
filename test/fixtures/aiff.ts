export interface MakeAiffOptions {
  channels: number;
  sampleRate: number;
  bitsPerSample: 8 | 16 | 24 | 32;
  samples: number[][];
}

export interface MakeAiffCOptions extends MakeAiffOptions {
  compression: "NONE" | "twos" | "fl32" | "fl64";
  bitsPerSample: 8 | 16 | 24 | 32 | 64;
}

export function makeAiff(options: MakeAiffOptions): Buffer {
  return makeAiffC({ ...options, compression: "NONE" });
}

export function makeAiffC(options: MakeAiffCOptions): Buffer {
  const { channels, sampleRate, bitsPerSample, samples, compression } = options;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = channels * bytesPerSample;
  const frames = samples[0]?.length ?? 0;
  const dataSize = frames * blockAlign + 8;
  const formType = compression === "NONE" || compression === "twos" ? "AIFF" : "AIFC";
  const commSize = formType === "AIFC" ? 24 : 18;
  const fileSize = 12 + 8 + commSize + 8 + dataSize;
  const buffer = Buffer.alloc(fileSize);
  let offset = 0;
  buffer.write("FORM", offset); offset += 4;
  buffer.writeUInt32BE(fileSize - 8, offset); offset += 4;
  buffer.write(formType, offset); offset += 4;
  offset = writeComm(buffer, offset, { channels, sampleRate, bitsPerSample, frames, commSize, formType, compression });
  offset = writeSsndHeader(buffer, offset, dataSize);
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      offset = writeAiffSample(buffer, offset, samples[channel]![frame] ?? 0, compression, bitsPerSample);
    }
  }
  return buffer;
}

interface CommFields {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  frames: number;
  commSize: number;
  formType: string;
  compression: string;
}

function writeComm(buffer: Buffer, offset: number, f: CommFields): number {
  buffer.write("COMM", offset); offset += 4;
  buffer.writeUInt32BE(f.commSize, offset); offset += 4;
  buffer.writeUInt16BE(f.channels, offset); offset += 2;
  buffer.writeUInt32BE(f.frames, offset); offset += 4;
  buffer.writeUInt16BE(f.bitsPerSample, offset); offset += 2;
  offset = writeExtended(buffer, offset, f.sampleRate);
  if (f.formType === "AIFC") {
    buffer.write(f.compression.padEnd(4, " "), offset); offset += 4;
    buffer.writeUInt8(0, offset); offset += 1; // pstring length 0
    buffer.writeUInt8(0, offset); offset += 1; // pstring pad to even
  }
  return offset;
}

function writeSsndHeader(buffer: Buffer, offset: number, dataSize: number): number {
  buffer.write("SSND", offset); offset += 4;
  buffer.writeUInt32BE(dataSize, offset); offset += 4;
  buffer.writeUInt32BE(0, offset); offset += 4; // ssnd block offset
  buffer.writeUInt32BE(0, offset); offset += 4; // ssnd block size
  return offset;
}

function writeAiffSample(buffer: Buffer, offset: number, sample: number, compression: string, bits: number): number {
  if (compression === "fl64") buffer.writeDoubleBE(sample, offset);
  else if (compression === "fl32") buffer.writeFloatBE(sample, offset);
  else if (bits === 8) buffer.writeInt8(sample, offset);
  else if (bits === 16) buffer.writeInt16BE(sample, offset);
  else if (bits === 24) buffer.writeIntBE(sample, offset, 3);
  else buffer.writeInt32BE(sample, offset);
  return offset + bits / 8;
}

export function writeExtended(buffer: Buffer, offset: number, value: number): number {
  if (value <= 0 || !Number.isInteger(value)) {
    throw new Error("writeExtended requires a positive integer sample rate");
  }
  const unbiased = value.toString(2).length - 1;
  const mantissa = BigInt(value) << BigInt(63 - unbiased);
  const stored = (unbiased + 16383) & 0x7fff;
  buffer.writeUInt16BE(stored, offset); offset += 2;
  buffer.writeBigUInt64BE(mantissa, offset); offset += 8;
  return offset;
}

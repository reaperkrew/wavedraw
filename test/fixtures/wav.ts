export interface MakePcmWavOptions {
  channels: number;
  sampleRate: number;
  bitsPerSample: 8 | 16 | 24 | 32;
  samples: number[][];
  junkChunk?: Uint8Array;
}

export interface MakeFloatWavOptions {
  channels: number;
  sampleRate: number;
  samples: number[][];
}

export function makePcmWav(options: MakePcmWavOptions): Buffer {
  return makeWav({ ...options, audioFormat: 1 });
}

export function makeFloatWav(options: MakeFloatWavOptions): Buffer {
  return makeWav({ ...options, audioFormat: 3, bitsPerSample: 32 });
}

export function makeWav(options: MakePcmWavOptions & { audioFormat: 1 | 3 }): Buffer {
  const frames = options.samples[0]?.length ?? 0;
  const bytesPerSample = options.bitsPerSample / 8;
  const blockAlign = options.channels * bytesPerSample;
  const byteRate = options.sampleRate * blockAlign;
  const dataSize = frames * blockAlign;
  const junkSize = options.junkChunk?.byteLength ?? 0;
  const junkTotal = options.junkChunk ? 8 + junkSize + (junkSize % 2) : 0;
  const fileSize = 12 + 24 + junkTotal + 8 + dataSize;
  const buffer = Buffer.alloc(fileSize);
  let offset = 0;

  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(options.audioFormat, offset); offset += 2;
  buffer.writeUInt16LE(options.channels, offset); offset += 2;
  buffer.writeUInt32LE(options.sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(options.bitsPerSample, offset); offset += 2;

  if (options.junkChunk) {
    buffer.write("JUNK", offset); offset += 4;
    buffer.writeUInt32LE(junkSize, offset); offset += 4;
    Buffer.from(options.junkChunk).copy(buffer, offset); offset += junkSize;
    if (junkSize % 2) offset += 1;
  }

  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < options.channels; channel += 1) {
      const sample = options.samples[channel]![frame] ?? 0;
      if (options.audioFormat === 3) {
        buffer.writeFloatLE(sample, offset);
      } else if (options.bitsPerSample === 8) {
        buffer.writeUInt8(sample, offset);
      } else if (options.bitsPerSample === 16) {
        buffer.writeInt16LE(sample, offset);
      } else if (options.bitsPerSample === 24) {
        buffer.writeUIntLE(sample < 0 ? sample + 0x1000000 : sample, offset, 3);
      } else {
        buffer.writeInt32LE(sample, offset);
      }
      offset += bytesPerSample;
    }
  }

  return buffer;
}

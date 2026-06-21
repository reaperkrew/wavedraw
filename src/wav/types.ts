export type WavAudioFormat = "pcm" | "float";

export interface WavFormat {
  audioFormat: WavAudioFormat;
  channels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: 8 | 16 | 24 | 32;
  dataOffset: number;
  dataLength: number;
}

export interface WavAudio {
  format: WavFormat;
  channels: Float32Array[];
  frames: number;
  durationSeconds: number;
}

export interface ParseWavOptions {
  copy?: boolean;
}

export interface ReadWavFileOptions extends ParseWavOptions {}

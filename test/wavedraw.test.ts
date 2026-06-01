import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { drawMelSpectrogram, drawWave, parseWav, renderMelSpectrogramSvg, renderWaveformSvg, summarizeMelSpectrogram, summarizeWaveform } from "../src/index.js";

describe("parseWav", () => {
  it("parses 16-bit mono PCM and normalizes samples", () => {
    const wav = makePcmWav({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      samples: [[-32768, 0, 32767]]
    });

    const audio = parseWav(wav);

    expect(audio.format).toMatchObject({
      audioFormat: "pcm",
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      dataOffset: 44,
      dataLength: 6
    });
    expect(audio.frames).toBe(3);
    expect(audio.durationSeconds).toBe(3 / 8000);
    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0, 32767 / 32768]);
  });

  it("scans chunks instead of assuming data starts at byte 44", () => {
    const wav = makePcmWav({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      samples: [[1000, -1000]],
      junkChunk: new Uint8Array([1, 2, 3, 4])
    });

    const audio = parseWav(wav);

    expect(audio.format.dataOffset).toBeGreaterThan(44);
    expect(Array.from(audio.channels[0]!)).toEqual([1000 / 32768, -1000 / 32768]);
  });

  it("parses stereo and preserves channels", () => {
    const wav = makePcmWav({
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 16,
      samples: [
        [32767, 0],
        [-32768, 16384]
      ]
    });

    const audio = parseWav(wav);

    expect(audio.channels).toHaveLength(2);
    expect(Array.from(audio.channels[0]!)).toEqual([32767 / 32768, 0]);
    expect(Array.from(audio.channels[1]!)).toEqual([-1, 0.5]);
  });

  it("supports 8-bit unsigned PCM", () => {
    const wav = makePcmWav({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 8,
      samples: [[0, 128, 255]]
    });

    const audio = parseWav(wav);

    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0, 127 / 128]);
  });

  it("supports 24-bit signed PCM", () => {
    const wav = makePcmWav({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 24,
      samples: [[-8388608, 0, 8388607]]
    });

    const audio = parseWav(wav);

    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0, 8388607 / 8388608]);
  });

  it("supports 32-bit float WAV", () => {
    const wav = makeFloatWav({
      channels: 1,
      sampleRate: 8000,
      samples: [[-1, 0.25, 2]]
    });

    const audio = parseWav(wav);

    expect(audio.format.audioFormat).toBe("float");
    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0.25, 1]);
  });

  it("rejects invalid input clearly", () => {
    expect(() => parseWav(new Uint8Array([1, 2, 3]))).toThrow("Invalid WAV: file is too small");
    expect(() => parseWav(Buffer.from("NOPE0000WAVE"))).toThrow("Invalid WAV: missing RIFF header");
  });
});

describe("summarizeWaveform", () => {
  it("computes peaks, RMS, and average per column", () => {
    const audio = parseWav(makePcmWav({
      channels: 1,
      sampleRate: 4,
      bitsPerSample: 16,
      samples: [[-32768, 32767, 0, 16384]]
    }));

    const summary = summarizeWaveform(audio, {
      width: 2,
      metrics: ["peaks", "rms", "average"],
      channel: 0
    });

    expect(summary.channels[0]!.columns).toHaveLength(2);
    expect(summary.channels[0]!.columns[0]!.min).toBe(-1);
    expect(summary.channels[0]!.columns[0]!.max).toBe(32767 / 32768);
    expect(summary.channels[0]!.columns[0]!.rms).toBeCloseTo(Math.sqrt((1 + (32767 / 32768) ** 2) / 2), 6);
    expect(summary.channels[0]!.columns[0]!.average).toBeCloseTo((-1 + 32767 / 32768) / 2, 6);
    expect(summary.channels[0]!.columns[1]!.min).toBe(0);
    expect(summary.channels[0]!.columns[1]!.max).toBe(0.5);
    expect(summary.channels[0]!.columns[1]!.rms).toBeCloseTo(Math.sqrt(0.25 / 2), 6);
    expect(summary.channels[0]!.columns[1]!.average).toBeCloseTo(0.25, 6);
  });

  it("mixes stereo channels on request", () => {
    const audio = parseWav(makePcmWav({
      channels: 2,
      sampleRate: 2,
      bitsPerSample: 16,
      samples: [
        [32767, 32767],
        [-32768, 0]
      ]
    }));

    const summary = summarizeWaveform(audio, {
      width: 2,
      channel: "mix",
      metrics: ["peaks"]
    });

    expect(summary.channels[0]!.channel).toBe("mix");
    expect(summary.channels[0]!.columns[0]!.max).toBeCloseTo((-1 + 32767 / 32768) / 2, 6);
    expect(summary.channels[0]!.columns[1]!.max).toBeCloseTo((32767 / 32768) / 2, 6);
  });

  it("returns all channels on request", () => {
    const audio = parseWav(makePcmWav({
      channels: 2,
      sampleRate: 2,
      bitsPerSample: 16,
      samples: [
        [1000, 2000],
        [3000, 4000]
      ]
    }));

    const summary = summarizeWaveform(audio, { width: 2, channel: "all" });

    expect(summary.channels.map((channel) => channel.channel)).toEqual([0, 1]);
  });

  it("validates ranges and dimensions", () => {
    const audio = parseWav(makePcmWav({
      channels: 1,
      sampleRate: 2,
      bitsPerSample: 16,
      samples: [[0, 0]]
    }));

    expect(() => summarizeWaveform(audio, { width: 0 })).toThrow("width must be a positive integer");
    expect(() => summarizeWaveform(audio, { width: 1, startSeconds: 1, endSeconds: 1 })).toThrow("endSeconds must be greater than startSeconds");
    expect(() => summarizeWaveform(audio, { width: 1, endSeconds: 2 })).toThrow("endSeconds exceeds audio duration");
  });
});

describe("renderWaveformSvg", () => {
  it("renders deterministic SVG with peaks and RMS layers", () => {
    const audio = parseWav(makePcmWav({
      channels: 1,
      sampleRate: 4,
      bitsPerSample: 16,
      samples: [[-32768, 32767, 0, 16384]]
    }));
    const summary = summarizeWaveform(audio, { width: 2, metrics: ["peaks", "rms"] });

    const svg = renderWaveformSvg(summary, {
      width: 2,
      height: 10,
      background: "#fff"
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("<rect width=\"100%\" height=\"100%\" fill=\"#fff\"");
    expect(svg).toContain("stroke=\"#2563eb\"");
    expect(svg).toContain("stroke=\"#60a5fa\"");
    expect(svg).toContain("</svg>");
  });
});


describe("summarizeMelSpectrogram", () => {
  it("computes normalized Mel energy frames", () => {
    const samples = Array.from({ length: 64 }, (_, frame) => Math.round(Math.sin((2 * Math.PI * frame) / 8) * 24000));
    const audio = parseWav(makePcmWav({
      channels: 1,
      sampleRate: 64,
      bitsPerSample: 16,
      samples: [samples]
    }));

    const summary = summarizeMelSpectrogram(audio, {
      width: 4,
      fftSize: 16,
      melBands: 6,
      minFrequency: 0,
      maxFrequency: 32,
      dynamicRangeDb: 60
    });

    expect(summary.width).toBe(4);
    expect(summary.fftSize).toBe(16);
    expect(summary.melBands).toBe(6);
    expect(summary.spectrogram).toHaveLength(4);
    expect(summary.spectrogram[0]!.values).toHaveLength(6);
    expect(summary.maxDecibels).toBeGreaterThan(summary.minDecibels);
    expect(summary.spectrogram.flatMap((frame) => frame.values).every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it("validates Mel spectrogram options", () => {
    const audio = parseWav(makePcmWav({
      channels: 1,
      sampleRate: 16,
      bitsPerSample: 16,
      samples: [[0, 0, 0, 0]]
    }));

    expect(() => summarizeMelSpectrogram(audio, { width: 0 })).toThrow("width must be a positive integer");
    expect(() => summarizeMelSpectrogram(audio, { width: 1, fftSize: 1 })).toThrow("fftSize must be at least 2");
    expect(() => summarizeMelSpectrogram(audio, { width: 1, maxFrequency: 9 })).toThrow("maxFrequency cannot exceed the Nyquist frequency");
  });
});

describe("renderMelSpectrogramSvg", () => {
  it("renders deterministic SVG rectangles with interpolated colors", () => {
    const svg = renderMelSpectrogramSvg({
      width: 2,
      sampleRate: 16,
      startSeconds: 0,
      endSeconds: 1,
      frames: 16,
      fftSize: 8,
      melBands: 2,
      minFrequency: 0,
      maxFrequency: 8,
      minDecibels: -80,
      maxDecibels: 0,
      spectrogram: [
        { values: [0, 0.5] },
        { values: [1, 0.25] }
      ]
    }, {
      width: 20,
      height: 10,
      background: "#000",
      colors: ["#000000", "#ffffff"]
    });

    expect(svg).toContain('aria-label="Mel spectrogram"');
    expect(svg).toContain('fill="#000"');
    expect(svg).toContain('fill="#808080"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain("</svg>");
  });
});


describe("drawWave", () => {
  it("writes an SVG file and returns the SVG", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wavedraw-"));
    const wavPath = join(dir, "input.wav");
    const svgPath = join(dir, "wave.svg");

    try {
      await writeFile(wavPath, makePcmWav({
        channels: 1,
        sampleRate: 4,
        bitsPerSample: 16,
        samples: [[-32768, 0, 32767, 0]]
      }));

      const svg = await drawWave(wavPath, {
        width: 4,
        height: 20,
        output: svgPath,
        maximums: true,
        rms: true
      });

      expect(svg).toContain("<svg");
      await expect(readFile(svgPath, "utf8")).resolves.toBe(svg);
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });
});


describe("drawMelSpectrogram", () => {
  it("writes an SVG file and returns the SVG", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wavedraw-"));
    const wavPath = join(dir, "input.wav");
    const svgPath = join(dir, "mel.svg");

    try {
      await writeFile(wavPath, makePcmWav({
        channels: 1,
        sampleRate: 32,
        bitsPerSample: 16,
        samples: [Array.from({ length: 32 }, (_, frame) => Math.round(Math.sin((2 * Math.PI * frame) / 4) * 20000))]
      }));

      const svg = await drawMelSpectrogram(wavPath, {
        width: 4,
        height: 20,
        output: svgPath,
        fftSize: 8,
        melBands: 4
      });

      expect(svg).toContain('aria-label="Mel spectrogram"');
      await expect(readFile(svgPath, "utf8")).resolves.toBe(svg);
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });
});

interface MakePcmWavOptions {
  channels: number;
  sampleRate: number;
  bitsPerSample: 8 | 16 | 24 | 32;
  samples: number[][];
  junkChunk?: Uint8Array;
}

interface MakeFloatWavOptions {
  channels: number;
  sampleRate: number;
  samples: number[][];
}

function makePcmWav(options: MakePcmWavOptions): Buffer {
  return makeWav({ ...options, audioFormat: 1 });
}

function makeFloatWav(options: MakeFloatWavOptions): Buffer {
  return makeWav({ ...options, audioFormat: 3, bitsPerSample: 32 });
}

function makeWav(options: MakePcmWavOptions & { audioFormat: 1 | 3 }): Buffer {
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

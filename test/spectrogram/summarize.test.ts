import { describe, expect, it } from "vitest";
import { parseWav, summarizeMelSpectrogram } from "../../src/index.js";
import { makePcmWav } from "../fixtures/wav.js";

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

  it("honors the window option and defaults to hann", () => {
    const samples = Array.from({ length: 64 }, (_, frame) => Math.round(Math.sin((2 * Math.PI * frame) / 8) * 24000));
    const audio = parseWav(makePcmWav({ channels: 1, sampleRate: 64, bitsPerSample: 16, samples: [samples] }));

    const base = { width: 4, fftSize: 16, melBands: 6, minFrequency: 0, maxFrequency: 32, dynamicRangeDb: 60 };
    const hann = summarizeMelSpectrogram(audio, base);
    const hannExplicit = summarizeMelSpectrogram(audio, { ...base, window: "hann" });
    const hamming = summarizeMelSpectrogram(audio, { ...base, window: "hamming" });

    expect(hannExplicit.spectrogram).toEqual(hann.spectrogram);
    expect(hamming.spectrogram).not.toEqual(hann.spectrogram);
  });
});

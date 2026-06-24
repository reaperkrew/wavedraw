import { describe, expect, it } from "vitest";
import { parseWav, summarizeLinearSpectrogram } from "../../src/index.js";
import { makePcmWav } from "../fixtures/wav.js";

describe("summarizeLinearSpectrogram", () => {
  it("computes normalized linear-frequency frames with the requested bin count", () => {
    const samples = Array.from({ length: 128 }, (_, frame) => Math.round(Math.sin((2 * Math.PI * frame) / 8) * 24000));
    const audio = parseWav(makePcmWav({ channels: 1, sampleRate: 128, bitsPerSample: 16, samples: [samples] }));

    const summary = summarizeLinearSpectrogram(audio, {
      width: 4,
      fftSize: 32,
      bins: 16,
      minFrequency: 0,
      maxFrequency: 64,
      dynamicRangeDb: 60
    });

    expect(summary.width).toBe(4);
    expect(summary.bins).toBe(16);
    expect(summary.fftSize).toBe(32);
    expect(summary.spectrogram).toHaveLength(4);
    expect(summary.spectrogram[0]!.values).toHaveLength(16);
    expect(summary.maxDecibels).toBeGreaterThan(summary.minDecibels);
    const all = summary.spectrogram.flatMap((frame) => frame.values);
    expect(all.every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it("concentrates energy in a low-frequency bin for a low-frequency sine", () => {
    // 16 Hz sine at 128 Hz sample rate, Nyquist 64 Hz, 16 bins => each bin = 4 Hz,
    // so the 16 Hz peak should land near output bin 4.
    const samples = Array.from({ length: 128 }, (_, frame) => Math.round(Math.sin((2 * Math.PI * frame) / 8) * 24000));
    const audio = parseWav(makePcmWav({ channels: 1, sampleRate: 128, bitsPerSample: 16, samples: [samples] }));

    const summary = summarizeLinearSpectrogram(audio, {
      width: 1,
      fftSize: 32,
      bins: 16,
      minFrequency: 0,
      maxFrequency: 64,
      dynamicRangeDb: 60
    });

    const values = summary.spectrogram[0]!.values;
    const peakBin = values.indexOf(Math.max(...values));
    expect(peakBin).toBeLessThan(values.length / 2);
    expect(peakBin).toBeGreaterThanOrEqual(3);
    expect(peakBin).toBeLessThanOrEqual(5);
  });

  it("defaults bins to fftSize/2 + 1 when omitted", () => {
    const audio = parseWav(makePcmWav({ channels: 1, sampleRate: 32, bitsPerSample: 16, samples: [[0, 0, 0, 0]] }));
    const summary = summarizeLinearSpectrogram(audio, { width: 2, fftSize: 16 });
    expect(summary.bins).toBe(9);
  });

  it("validates linear spectrogram options", () => {
    const audio = parseWav(makePcmWav({ channels: 1, sampleRate: 16, bitsPerSample: 16, samples: [[0, 0, 0, 0]] }));

    expect(() => summarizeLinearSpectrogram(audio, { width: 0 })).toThrow("width must be a positive integer");
    expect(() => summarizeLinearSpectrogram(audio, { width: 1, fftSize: 1 })).toThrow("fftSize must be at least 2");
    expect(() => summarizeLinearSpectrogram(audio, { width: 1, bins: 0 })).toThrow("bins must be a positive integer");
    expect(() => summarizeLinearSpectrogram(audio, { width: 1, maxFrequency: 9 })).toThrow("maxFrequency cannot exceed the Nyquist frequency");
  });
});

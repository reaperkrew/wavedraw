import { describe, expect, it } from "vitest";
import { parseWav, summarizeWaveform } from "../../src/index.js";
import { makePcmWav } from "../fixtures/wav.js";

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

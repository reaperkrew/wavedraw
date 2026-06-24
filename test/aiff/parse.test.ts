import { describe, expect, it } from "vitest";
import { parseAiff } from "../../src/index.js";
import { makeAiff, makeAiffC } from "../fixtures/aiff.js";

describe("parseAiff", () => {
  it("parses 16-bit mono AIFF PCM (big-endian, signed) and normalizes samples", () => {
    const aiff = makeAiff({
      channels: 1,
      sampleRate: 44100,
      bitsPerSample: 16,
      samples: [[-32768, 0, 32767]]
    });

    const audio = parseAiff(aiff);

    expect(audio.format).toMatchObject({
      audioFormat: "pcm",
      channels: 1,
      sampleRate: 44100,
      bitsPerSample: 16
    });
    expect(audio.frames).toBe(3);
    expect(audio.durationSeconds).toBe(3 / 44100);
    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0, 32767 / 32768]);
  });

  it("parses 8-bit AIFF PCM as signed (unlike WAV's unsigned 8-bit)", () => {
    const aiff = makeAiff({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 8,
      samples: [[-128, 0, 127]]
    });

    const audio = parseAiff(aiff);

    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0, 127 / 128]);
  });

  it("parses 24-bit AIFF PCM", () => {
    const aiff = makeAiff({
      channels: 1,
      sampleRate: 48000,
      bitsPerSample: 24,
      samples: [[-8388608, 0, 8388607]]
    });

    const audio = parseAiff(aiff);

    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0, 8388607 / 8388608]);
  });

  it("preserves stereo channels in AIFF", () => {
    const aiff = makeAiff({
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 16,
      samples: [
        [32767, 0],
        [-32768, 16384]
      ]
    });

    const audio = parseAiff(aiff);

    expect(audio.channels).toHaveLength(2);
    expect(Array.from(audio.channels[0]!)).toEqual([32767 / 32768, 0]);
    expect(Array.from(audio.channels[1]!)).toEqual([-1, 0.5]);
  });

  it("parses AIFC 32-bit float (big-endian)", () => {
    const aiff = makeAiffC({
      channels: 1,
      sampleRate: 44100,
      bitsPerSample: 32,
      compression: "fl32",
      samples: [[-1, 0.25, 2]]
    });

    const audio = parseAiff(aiff);

    expect(audio.format.audioFormat).toBe("float");
    expect(audio.format.bitsPerSample).toBe(32);
    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0.25, 1]);
  });

  it("parses AIFC 64-bit float (big-endian)", () => {
    const aiff = makeAiffC({
      channels: 1,
      sampleRate: 48000,
      bitsPerSample: 64,
      compression: "fl64",
      samples: [[-1, 0.5, 0]]
    });

    const audio = parseAiff(aiff);

    expect(audio.format.audioFormat).toBe("float");
    expect(audio.format.bitsPerSample).toBe(64);
    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0.5, 0]);
  });

  it("rejects non-AIFF input clearly", () => {
    expect(() => parseAiff(new Uint8Array([1, 2, 3]))).toThrow("Invalid AIFF: file is too small");
    expect(() => parseAiff(Buffer.from("RIFF0000WAVE"))).toThrow("Invalid AIFF: missing FORM header");
  });

  it("rejects unsupported AIFF form types", () => {
    const buffer = Buffer.alloc(12);
    buffer.write("FORM", 0);
    buffer.writeUInt32BE(0, 4);
    buffer.write("AIFX", 8);
    expect(() => parseAiff(buffer)).toThrow("unsupported form type AIFX");
  });
});

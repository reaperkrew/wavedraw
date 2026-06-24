import { describe, expect, it } from "vitest";
import { parseWav } from "../../src/index.js";
import { makeFloatWav, makePcmWav } from "../fixtures/wav.js";
import { makeExtensibleWav, makeFloat64Wav } from "../fixtures/wav-extended.js";

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

  it("supports WAVE_FORMAT_EXTENSIBLE PCM via subFormat GUID", () => {
    const wav = makeExtensibleWav({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      samples: [[-32768, 0, 32767]],
      subFormatCode: 1
    });

    const audio = parseWav(wav);

    expect(audio.format.audioFormat).toBe("pcm");
    expect(audio.format.bitsPerSample).toBe(16);
    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0, 32767 / 32768]);
  });

  it("supports WAVE_FORMAT_EXTENSIBLE float via subFormat GUID", () => {
    const wav = makeExtensibleWav({
      channels: 2,
      sampleRate: 48000,
      bitsPerSample: 32,
      samples: [[-0.5, 0.5], [0.25, -0.25]],
      subFormatCode: 3
    });

    const audio = parseWav(wav);

    expect(audio.format.audioFormat).toBe("float");
    expect(audio.format.channels).toBe(2);
    expect(Array.from(audio.channels[0]!)).toEqual([-0.5, 0.5]);
    expect(Array.from(audio.channels[1]!)).toEqual([0.25, -0.25]);
  });

  it("supports 64-bit float WAV", () => {
    const wav = makeFloat64Wav({
      channels: 1,
      sampleRate: 8000,
      samples: [[-1, 0.25, 2]]
    });

    const audio = parseWav(wav);

    expect(audio.format.audioFormat).toBe("float");
    expect(audio.format.bitsPerSample).toBe(64);
    expect(Array.from(audio.channels[0]!)).toEqual([-1, 0.25, 1]);
  });

  it("rejects PCM audio claiming 64-bit depth", () => {
    const wav = makeExtensibleWav({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 64,
      samples: [[0, 0]],
      subFormatCode: 1
    });

    expect(() => parseWav(wav)).toThrow("is invalid for pcm audio");
  });

  it("rejects invalid input clearly", () => {
    expect(() => parseWav(new Uint8Array([1, 2, 3]))).toThrow("Invalid WAV: file is too small");
    expect(() => parseWav(Buffer.from("NOPE0000WAVE"))).toThrow("Invalid WAV: missing RIFF header");
  });
});

import { describe, expect, it } from "vitest";
import { parseAudio } from "../../src/index.js";
import { makePcmWav } from "../fixtures/wav.js";
import { makeAiff } from "../fixtures/aiff.js";

describe("parseAudio dispatcher", () => {
  it("routes RIFF files to the WAV parser", () => {
    const wav = makePcmWav({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      samples: [[1000, -1000]]
    });

    const audio = parseAudio(wav);

    expect(audio.format.audioFormat).toBe("pcm");
    expect(audio.format.bitsPerSample).toBe(16);
    expect(Array.from(audio.channels[0]!)).toEqual([1000 / 32768, -1000 / 32768]);
  });

  it("routes FORM files to the AIFF parser", () => {
    const aiff = makeAiff({
      channels: 1,
      sampleRate: 44100,
      bitsPerSample: 16,
      samples: [[1000, -1000]]
    });

    const audio = parseAudio(aiff);

    expect(audio.format.audioFormat).toBe("pcm");
    expect(audio.format.sampleRate).toBe(44100);
    expect(Array.from(audio.channels[0]!)).toEqual([1000 / 32768, -1000 / 32768]);
  });

  it("defaults non-FORM input to the WAV parser (preserving WAV error messages)", () => {
    expect(() => parseAudio(new Uint8Array([1, 2, 3]))).toThrow("Invalid WAV: file is too small");
  });
});

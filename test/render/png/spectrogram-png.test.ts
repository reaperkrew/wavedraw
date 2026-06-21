import { describe, expect, it } from "vitest";
import { renderMelSpectrogramPng } from "../../../src/index.js";
import { readIhdr } from "../../fixtures/png.js";

describe("renderMelSpectrogramPng", () => {
  it("renders an RGBA PNG with the requested dimensions", () => {
    const png = renderMelSpectrogramPng({
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
      background: "#000000",
      colors: ["#000000", "#ffffff"]
    });
    const ihdr = readIhdr(png);
    expect(ihdr.width).toBe(20);
    expect(ihdr.height).toBe(10);
    expect(ihdr.bitDepth).toBe(8);
    expect(ihdr.colorType).toBe(6);
  });

  it("renders without a background as a transparent PNG", () => {
    const png = renderMelSpectrogramPng({
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
      spectrogram: [{ values: [0, 1] }, { values: [1, 0] }]
    }, { width: 8, height: 8, colors: ["#000000", "#ffffff"] });
    expect(readIhdr(png).width).toBe(8);
  });
});

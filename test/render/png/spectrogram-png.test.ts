import { describe, expect, it } from "vitest";
import { renderMelSpectrogramPng } from "../../../src/index.js";
import { inflateIdat, readIhdr } from "../../fixtures/png.js";

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

  it("draws a colorbar gradient in the right padding region when axes.colorbar is enabled", () => {
    const summary = {
      width: 4,
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
      spectrogram: [{ values: [0, 1] }, { values: [1, 0] }, { values: [0.5, 0.5] }, { values: [0.2, 0.8] }]
    };
    const width = 200;
    const height = 120;
    const padding = 40;
    const options = { width, height, padding, background: "#000000", colors: ["#000000", "#ffffff"] };

    const without = renderMelSpectrogramPng(summary, options);
    const withBar = renderMelSpectrogramPng(summary, { ...options, axes: { enabled: true, timeAxis: false, frequencyAxis: false, colorbar: true } });

    // barX = width - padding + 14 = 174; barWidth = padding - 24 = 16 → check x=182 (mid-colorbar)
    const rowWithout = rgbaAt(inflateIdat(without), width, 182, 60);
    const rowWith = rgbaAt(inflateIdat(withBar), width, 182, 60);
    expect(rowWithout).toEqual([0, 0, 0, 255]); // background black
    expect(rowWith).not.toEqual([0, 0, 0, 255]); // colorbar gradient pixel
  });
});

function rgbaAt(raw: Uint8Array, width: number, x: number, y: number): [number, number, number, number] {
  const rowStart = y * (width * 4 + 1) + 1;
  const i = rowStart + x * 4;
  return [raw[i]!, raw[i + 1]!, raw[i + 2]!, raw[i + 3]!];
}

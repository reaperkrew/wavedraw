import { describe, expect, it } from "vitest";
import { renderMelSpectrogramSvg } from "../../src/index.js";

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

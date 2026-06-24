import { describe, expect, it } from "vitest";
import { renderLinearSpectrogramSvg } from "../../src/index.js";

describe("renderLinearSpectrogramSvg", () => {
  it("renders SVG cells labelled as a Linear spectrogram", () => {
    const svg = renderLinearSpectrogramSvg({
      width: 2,
      sampleRate: 16,
      startSeconds: 0,
      endSeconds: 1,
      frames: 16,
      fftSize: 8,
      bins: 2,
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

    expect(svg).toContain('aria-label="Linear spectrogram"');
    expect(svg).toContain('fill="#000"');
    expect(svg).toContain('fill="#808080"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain("</svg>");
  });

  it("honors the colormap option", () => {
    const svg = renderLinearSpectrogramSvg({
      width: 1,
      sampleRate: 16,
      startSeconds: 0,
      endSeconds: 1,
      frames: 16,
      fftSize: 8,
      bins: 1,
      minFrequency: 0,
      maxFrequency: 8,
      minDecibels: -80,
      maxDecibels: 0,
      spectrogram: [{ values: [0] }]
    }, { width: 10, height: 10, colormap: "viridis" });

    expect(svg).toContain('fill="#440154"');
  });
});

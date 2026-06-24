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

  it("applies a named colormap when provided, overriding colors", () => {
    const summary = {
      width: 1,
      sampleRate: 16,
      startSeconds: 0,
      endSeconds: 1,
      frames: 16,
      fftSize: 8,
      melBands: 1,
      minFrequency: 0,
      maxFrequency: 8,
      minDecibels: -80,
      maxDecibels: 0,
      spectrogram: [{ values: [0] }]
    };

    const defaultSvg = renderMelSpectrogramSvg(summary, { width: 10, height: 10, colors: ["#000000", "#ffffff"] });
    const viridisSvg = renderMelSpectrogramSvg(summary, { width: 10, height: 10, colormap: "viridis" });

    // value 0 maps to viridis's first stop (#440154), not the grayscale 0 (#000000)
    expect(viridisSvg).toContain('fill="#440154"');
    expect(viridisSvg).not.toEqual(defaultSvg);
  });
});

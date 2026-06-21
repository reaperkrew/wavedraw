import { describe, expect, it } from "vitest";
import { parseWav, renderWaveformSvg, summarizeWaveform } from "../../src/index.js";
import { makePcmWav } from "../fixtures/wav.js";

describe("renderWaveformSvg", () => {
  it("renders deterministic SVG with peaks and RMS layers", () => {
    const audio = parseWav(makePcmWav({
      channels: 1,
      sampleRate: 4,
      bitsPerSample: 16,
      samples: [[-32768, 32767, 0, 16384]]
    }));
    const summary = summarizeWaveform(audio, { width: 2, metrics: ["peaks", "rms"] });

    const svg = renderWaveformSvg(summary, {
      width: 2,
      height: 10,
      background: "#fff"
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("<rect width=\"100%\" height=\"100%\" fill=\"#fff\"");
    expect(svg).toContain("stroke=\"#2563eb\"");
    expect(svg).toContain("stroke=\"#60a5fa\"");
    expect(svg).toContain("</svg>");
  });
});

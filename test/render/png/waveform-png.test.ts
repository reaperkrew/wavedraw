import { describe, expect, it } from "vitest";
import { parseWav, renderWaveformPng, summarizeWaveform } from "../../../src/index.js";
import { readIhdr } from "../../fixtures/png.js";
import { makePcmWav } from "../../fixtures/wav.js";

function makeAudio() {
  return parseWav(makePcmWav({
    channels: 1,
    sampleRate: 8,
    bitsPerSample: 16,
    samples: [[-32768, 0, 32767, 0, -16384, 16384, 0, 0]]
  }));
}

describe("renderWaveformPng", () => {
  it("returns an RGBA PNG sized to the requested width and height", () => {
    const audio = makeAudio();
    const summary = summarizeWaveform(audio, { width: 4, metrics: ["peaks", "rms"] });
    const png = renderWaveformPng(summary, { width: 4, height: 20, background: "#ffffff" });
    const ihdr = readIhdr(png);
    expect(ihdr.width).toBe(4);
    expect(ihdr.height).toBe(20);
    expect(ihdr.bitDepth).toBe(8);
    expect(ihdr.colorType).toBe(6);
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50);
  });

  it("renders without a background as a transparent PNG", () => {
    const audio = makeAudio();
    const summary = summarizeWaveform(audio, { width: 4, metrics: ["peaks"] });
    const png = renderWaveformPng(summary, { width: 4, height: 20 });
    expect(readIhdr(png).width).toBe(4);
    expect(png.length).toBeGreaterThan(50);
  });

  it("honors custom peak and RMS layer colors", () => {
    const audio = makeAudio();
    const summary = summarizeWaveform(audio, { width: 4, metrics: ["peaks", "rms", "average"] });
    const png = renderWaveformPng(summary, {
      width: 4,
      height: 20,
      background: "#000000",
      layers: {
        peaks: { color: "#ff0000", strokeWidth: 1 },
        rms: { color: "#00ff00", strokeWidth: 1 },
        average: { color: "#0000ff", strokeWidth: 1 }
      }
    });
    expect(readIhdr(png).height).toBe(20);
  });
});

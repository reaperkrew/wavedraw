import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { drawLinearSpectrogram } from "../../src/index.js";
import { makePcmWav } from "../fixtures/wav.js";

const sineSamples = (sampleRate: number, frames: number, periodSamples: number) =>
  Array.from({ length: frames }, (_, frame) => Math.round(Math.sin((2 * Math.PI * frame) / periodSamples) * 20000));

describe("drawLinearSpectrogram", () => {
  it("writes an SVG file and returns the SVG", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wavedraw-"));
    const wavPath = join(dir, "input.wav");
    const svgPath = join(dir, "linear.svg");
    try {
      await writeFile(wavPath, makePcmWav({ channels: 1, sampleRate: 32, bitsPerSample: 16, samples: [sineSamples(32, 32, 4)] }));
      const svg = await drawLinearSpectrogram(wavPath, { width: 4, height: 20, output: svgPath, fftSize: 8, bins: 4 });

      expect(typeof svg).toBe("string");
      expect(svg).toContain('aria-label="Linear spectrogram"');
      await expect(readFile(svgPath, "utf8")).resolves.toBe(svg);
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });

  it("writes a PNG file when output ends in .png", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wavedraw-"));
    const wavPath = join(dir, "input.wav");
    const pngPath = join(dir, "linear.png");
    try {
      await writeFile(wavPath, makePcmWav({ channels: 1, sampleRate: 32, bitsPerSample: 16, samples: [sineSamples(32, 32, 4)] }));
      const png = await drawLinearSpectrogram(wavPath, {
        width: 4,
        height: 20,
        output: pngPath,
        fftSize: 8,
        bins: 4,
        background: "#020617"
      });

      expect(png).toBeInstanceOf(Uint8Array);
      expect(png[0]).toBe(0x89);
      expect(png[1]).toBe(0x50);
      const onDisk = await readFile(pngPath);
      expect(Buffer.from(png)).toEqual(onDisk);
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });
});

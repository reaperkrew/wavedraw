import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { drawMelSpectrogram, drawWave } from "../../src/index.js";
import { makePcmWav } from "../fixtures/wav.js";

describe("drawWave", () => {
  it("writes an SVG file and returns the SVG", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wavedraw-"));
    const wavPath = join(dir, "input.wav");
    const svgPath = join(dir, "wave.svg");

    try {
      await writeFile(wavPath, makePcmWav({
        channels: 1,
        sampleRate: 4,
        bitsPerSample: 16,
        samples: [[-32768, 0, 32767, 0]]
      }));

      const svg = await drawWave(wavPath, {
        width: 4,
        height: 20,
        output: svgPath,
        maximums: true,
        rms: true
      });

      expect(svg).toContain("<svg");
      await expect(readFile(svgPath, "utf8")).resolves.toBe(svg);
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });
});

describe("drawMelSpectrogram", () => {
  it("writes an SVG file and returns the SVG", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wavedraw-"));
    const wavPath = join(dir, "input.wav");
    const svgPath = join(dir, "mel.svg");

    try {
      await writeFile(wavPath, makePcmWav({
        channels: 1,
        sampleRate: 32,
        bitsPerSample: 16,
        samples: [Array.from({ length: 32 }, (_, frame) => Math.round(Math.sin((2 * Math.PI * frame) / 4) * 20000))]
      }));

      const svg = await drawMelSpectrogram(wavPath, {
        width: 4,
        height: 20,
        output: svgPath,
        fftSize: 8,
        melBands: 4
      });

      expect(svg).toContain('aria-label="Mel spectrogram"');
      await expect(readFile(svgPath, "utf8")).resolves.toBe(svg);
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });
});

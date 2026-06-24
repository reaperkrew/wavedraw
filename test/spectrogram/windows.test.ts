import { describe, expect, it } from "vitest";
import { blackmanWindow, bartlettWindow, createWindow, hammingWindow, hannWindow, rectangularWindow } from "../../src/spectrogram/windows.js";

describe("spectrogram windows", () => {
  it("hann window is byte-identical to the previous formula", () => {
    const size = 8;
    const window = hannWindow(size);
    const expected = Float64Array.from({ length: size }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1)));
    expect(Array.from(window)).toEqual(Array.from(expected));
  });

  it("returns [1] for size === 1 in every window", () => {
    for (const make of [hannWindow, hammingWindow, blackmanWindow, bartlettWindow, rectangularWindow]) {
      expect(Array.from(make(1))).toEqual([1]);
    }
  });

  it("rectangular window is all ones", () => {
    const window = rectangularWindow(16);
    expect(window.every((value) => value === 1)).toBe(true);
    expect(window).toHaveLength(16);
  });

  it("bartlett window peaks at 1 in the middle and tapers to 0 at the ends", () => {
    const window = bartlettWindow(5);
    expect(window[0]).toBeCloseTo(0, 10);
    expect(window[2]).toBeCloseTo(1, 10);
    expect(window[4]).toBeCloseTo(0, 10);
  });

  it("hamming window endpoints equal 0.08 (0.54 - 0.46)", () => {
    const window = hammingWindow(32);
    expect(window[0]).toBeCloseTo(0.08, 10);
    expect(window[31]).toBeCloseTo(0.08, 10);
  });

  it("blackman window endpoints are 0.42 - 0.5 + 0.08 = 0 and peaks at the center", () => {
    const window = blackmanWindow(64);
    expect(window[0]).toBeCloseTo(0, 10);
    expect(window[63]).toBeCloseTo(0, 10);
    expect(Math.max(...window)).toBeGreaterThan(0.99);
  });

  it("createWindow defaults to hann when type is undefined", () => {
    expect(Array.from(createWindow(undefined, 16))).toEqual(Array.from(hannWindow(16)));
  });

  it("createWindow dispatches to the requested window type", () => {
    expect(Array.from(createWindow("hamming", 16))).toEqual(Array.from(hammingWindow(16)));
    expect(Array.from(createWindow("rectangular", 16))).toEqual(Array.from(rectangularWindow(16)));
    expect(Array.from(createWindow("blackman", 16))).toEqual(Array.from(blackmanWindow(16)));
    expect(Array.from(createWindow("bartlett", 16))).toEqual(Array.from(bartlettWindow(16)));
  });

  it("every window is symmetric", () => {
    const size = 17;
    for (const make of [hannWindow, hammingWindow, blackmanWindow, bartlettWindow]) {
      const window = make(size);
      for (let i = 0; i < size; i += 1) {
        expect(window[i]).toBeCloseTo(window[size - 1 - i]!, 10);
      }
    }
  });
});

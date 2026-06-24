import { describe, expect, it } from "vitest";
import {
  DEFAULT_SPECTRUM_COLORS,
  isColormapName,
  resolveColormap,
  resolveSpectrogramColors
} from "../../src/render/colormaps.js";
import type { ColormapName } from "../../src/index.js";

const COLORMAPS: ColormapName[] = ["viridis", "magma", "plasma", "inferno", "turbo", "cividis", "grayscale"];

describe("colormaps", () => {
  it("every preset exposes at least two valid #rrggbb stops", () => {
    for (const name of COLORMAPS) {
      const stops = resolveColormap(name);
      expect(stops.length).toBeGreaterThanOrEqual(2);
      for (const stop of stops) {
        expect(stop).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("resolveColormap is stable (returns the same reference for a name)", () => {
    expect(resolveColormap("viridis")).toEqual(resolveColormap("viridis"));
  });

  it("isColormapName narrows known names and rejects unknown ones", () => {
    expect(isColormapName("viridis")).toBe(true);
    expect(isColormapName("not-a-colormap")).toBe(false);
  });

  it("resolveColormap throws on an unknown name", () => {
    expect(() => resolveColormap("rainbow" as ColormapName)).toThrow("Unknown colormap");
  });

  it("resolveSpectrogramColors precedence: colormap > colors > default", () => {
    expect(resolveSpectrogramColors({ colormap: "viridis" })).toEqual(resolveColormap("viridis"));
    expect(resolveSpectrogramColors({ colors: ["#000000", "#ffffff"] })).toEqual(["#000000", "#ffffff"]);
    expect(resolveSpectrogramColors({})).toEqual(DEFAULT_SPECTRUM_COLORS);
  });

  it("colormap overrides explicit colors when both are set", () => {
    const result = resolveSpectrogramColors({ colormap: "magma", colors: ["#000000", "#ffffff"] });
    expect(result).toEqual(resolveColormap("magma"));
    expect(result).not.toEqual(["#000000", "#ffffff"]);
  });
});

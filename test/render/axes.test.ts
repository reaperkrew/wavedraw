import { describe, expect, it } from "vitest";
import {
  disabledAxesConfig,
  formatDecibelLabel,
  formatFrequencyLabel,
  formatTimeLabel,
  resolveAxesConfig
} from "../../src/render/axes.js";

describe("axes config", () => {
  it("resolves to disabled when axes is undefined or enabled is false", () => {
    expect(resolveAxesConfig(undefined).enabled).toBe(false);
    expect(resolveAxesConfig({ enabled: false }).enabled).toBe(false);
  });

  it("enables every chrome element by default when enabled", () => {
    const config = resolveAxesConfig({ enabled: true });
    expect(config).toMatchObject({ enabled: true, timeAxis: true, frequencyAxis: true, colorbar: true });
    expect(config.ticks).toBe(5);
    expect(config.fontSize).toBe(11);
  });

  it("honors per-element overrides and styling", () => {
    const config = resolveAxesConfig({ enabled: true, colorbar: false, ticks: 3, color: "#ff0000", fontSize: 14 });
    expect(config.colorbar).toBe(false);
    expect(config.ticks).toBe(3);
    expect(config.color).toBe("#ff0000");
    expect(config.fontSize).toBe(14);
  });

  it("disabledAxesConfig has all chrome elements off", () => {
    const config = disabledAxesConfig();
    expect(config.timeAxis || config.frequencyAxis || config.colorbar).toBe(false);
  });
});

describe("axes label formatters", () => {
  it("formats sub-second times as milliseconds", () => {
    expect(formatTimeLabel(0)).toBe("0ms");
    expect(formatTimeLabel(0.25)).toBe("250ms");
  });

  it("formats seconds under a minute with one decimal", () => {
    expect(formatTimeLabel(5)).toBe("5.0s");
    expect(formatTimeLabel(12.5)).toBe("12.5s");
  });

  it("formats minutes and seconds as M:SS", () => {
    expect(formatTimeLabel(65)).toBe("1:05");
    expect(formatTimeLabel(125)).toBe("2:05");
  });

  it("formats frequencies in Hz below 1000 and kHz at/above 1000", () => {
    expect(formatFrequencyLabel(0)).toBe("0");
    expect(formatFrequencyLabel(440)).toBe("440");
    expect(formatFrequencyLabel(1000)).toBe("1.0k");
    expect(formatFrequencyLabel(8000)).toBe("8.0k");
    expect(formatFrequencyLabel(20000)).toBe("20k");
  });

  it("formats decibels as rounded integers", () => {
    expect(formatDecibelLabel(-79.6)).toBe("-80");
    expect(formatDecibelLabel(0)).toBe("0");
  });
});

import type { AxesOptions } from "./types.js";

export interface AxesConfig {
  enabled: boolean;
  timeAxis: boolean;
  frequencyAxis: boolean;
  colorbar: boolean;
  ticks: number;
  color: string;
  fontSize: number;
}

export interface SpectrogramAxisInfo {
  startSeconds: number;
  endSeconds: number;
  minFrequency: number;
  maxFrequency: number;
  minDecibels: number;
  maxDecibels: number;
}

const DEFAULT_TICKS = 5;
const DEFAULT_COLOR = "#6b7280";
const DEFAULT_FONT_SIZE = 11;

export function resolveAxesConfig(axes: AxesOptions | undefined): AxesConfig {
  if (!axes?.enabled) {
    return disabledAxesConfig();
  }
  return {
    enabled: true,
    timeAxis: axes.timeAxis ?? true,
    frequencyAxis: axes.frequencyAxis ?? true,
    colorbar: axes.colorbar ?? true,
    ticks: axes.ticks ?? DEFAULT_TICKS,
    color: axes.color ?? DEFAULT_COLOR,
    fontSize: axes.fontSize ?? DEFAULT_FONT_SIZE
  };
}

export function disabledAxesConfig(): AxesConfig {
  return {
    enabled: false,
    timeAxis: false,
    frequencyAxis: false,
    colorbar: false,
    ticks: DEFAULT_TICKS,
    color: DEFAULT_COLOR,
    fontSize: DEFAULT_FONT_SIZE
  };
}

export function formatTimeLabel(seconds: number): string {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`;
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function formatFrequencyLabel(hertz: number): string {
  if (hertz >= 1000) {
    return `${(hertz / 1000).toFixed(hertz >= 10000 ? 0 : 1)}k`;
  }
  return `${Math.round(hertz)}`;
}

export function formatDecibelLabel(decibels: number): string {
  return `${Math.round(decibels)}`;
}

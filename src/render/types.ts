import type { ColormapName } from "./colormaps.js";

export interface WaveformLayerStyle {
  color?: string;
  strokeWidth?: number;
}

export interface WaveformLayerConfig {
  peaks?: WaveformLayerStyle | false;
  rms?: WaveformLayerStyle | false;
  average?: WaveformLayerStyle | false;
}

export interface AxesOptions {
  enabled?: boolean;
  timeAxis?: boolean;
  frequencyAxis?: boolean;
  colorbar?: boolean;
  ticks?: number;
  color?: string;
  fontSize?: number;
}

export interface RenderWaveformSvgOptions {
  width?: number;
  height: number;
  background?: string;
  padding?: number;
  layers?: WaveformLayerConfig;
}

export interface RenderMelSpectrogramSvgOptions {
  width?: number;
  height: number;
  background?: string;
  padding?: number;
  colors?: string[];
  colormap?: ColormapName;
  axes?: AxesOptions;
}

// PNG render options are structurally identical to the SVG render options:
// width/height/background/padding and per-layer or color-stop styling carry
// over unchanged. The aliases give the PNG API a correctly-named surface.
export type RenderWaveformPngOptions = RenderWaveformSvgOptions;
export type RenderMelSpectrogramPngOptions = RenderMelSpectrogramSvgOptions;
export type RenderLinearSpectrogramSvgOptions = RenderMelSpectrogramSvgOptions;
export type RenderLinearSpectrogramPngOptions = RenderMelSpectrogramSvgOptions;

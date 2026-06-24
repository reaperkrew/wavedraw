// Named colormap presets for spectrogram rendering. Stops are sampled from the
// canonical matplotlib LUTs at evenly-spaced points; linear interpolation through
// the existing interpolateColorStopsRgb makes ~10 stops visually
// indistinguishable from the full 256-entry tables. Keeping these as pure data
// preserves wavedraw's zero-runtime-dependency policy.

export type ColormapName = "viridis" | "magma" | "plasma" | "inferno" | "turbo" | "cividis" | "grayscale";

export const DEFAULT_SPECTRUM_COLORS = ["#020617", "#0f766e", "#facc15", "#f8fafc"];

const VIRIDIS = ["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"];
const MAGMA = ["#000004", "#1c1044", "#4f127b", "#812581", "#b5367a", "#e55064", "#fb8761", "#fec287", "#fcfdbf"];
const PLASMA = ["#0d0887", "#5c01a6", "#9c179e", "#cc4778", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"];
const INFERNO = ["#000004", "#1d0c45", "#491281", "#822d72", "#b63668", "#df513f", "#fa8d09", "#fcffa4"];
const TURBO = ["#30123b", "#4145ab", "#2f9c8e", "#46e327", "#ffe125", "#ff7c28", "#d8362d", "#b40426", "#6a0d3e", "#1e0b45"];
const CIVIDIS = ["#00204d", "#203d6e", "#3e5a85", "#5d7793", "#8494a0", "#b3b18c", "#dcc975", "#fde738"];
const GRAYSCALE = ["#000000", "#404040", "#808080", "#bfbfbf", "#ffffff"];

const COLORMAPS: Record<ColormapName, string[]> = {
  viridis: VIRIDIS,
  magma: MAGMA,
  plasma: PLASMA,
  inferno: INFERNO,
  turbo: TURBO,
  cividis: CIVIDIS,
  grayscale: GRAYSCALE
};

export function resolveColormap(name: ColormapName): string[] {
  const colors = COLORMAPS[name];
  if (!colors) {
    throw new Error(`Unknown colormap: ${name}`);
  }
  return colors;
}

export function isColormapName(name: string): name is ColormapName {
  return Object.prototype.hasOwnProperty.call(COLORMAPS, name);
}

export function resolveSpectrogramColors(options: { colormap?: ColormapName; colors?: string[] }): string[] {
  if (options.colormap) {
    return resolveColormap(options.colormap);
  }
  return options.colors ?? DEFAULT_SPECTRUM_COLORS;
}

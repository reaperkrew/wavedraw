// Spectral analysis windows. All windows are symmetric (denominator `size - 1`)
// to match the original Hann implementation, keeping default output byte-stable
// when `window` is unset. `hannWindow` is moved here from `spectrum.ts`.

export type WindowType = "hann" | "hamming" | "blackman" | "bartlett" | "rectangular";

const DEFAULT_WINDOW: WindowType = "hann";

export function createWindow(type: WindowType | undefined, size: number): Float64Array {
  switch (type ?? DEFAULT_WINDOW) {
    case "hann":
      return hannWindow(size);
    case "hamming":
      return hammingWindow(size);
    case "blackman":
      return blackmanWindow(size);
    case "bartlett":
      return bartlettWindow(size);
    case "rectangular":
      return rectangularWindow(size);
    default:
      return hannWindow(size);
  }
}

export function resolveWindowType(value: WindowType | undefined): WindowType {
  return value ?? DEFAULT_WINDOW;
}

export function hannWindow(size: number): Float64Array {
  if (size === 1) {
    return new Float64Array([1]);
  }
  return Float64Array.from({ length: size }, (_, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (size - 1)));
}

export function hammingWindow(size: number): Float64Array {
  if (size === 1) {
    return new Float64Array([1]);
  }
  return Float64Array.from({ length: size }, (_, index) => 0.54 - 0.46 * Math.cos((2 * Math.PI * index) / (size - 1)));
}

export function blackmanWindow(size: number): Float64Array {
  if (size === 1) {
    return new Float64Array([1]);
  }
  return Float64Array.from({ length: size }, (_, index) => blackmanValue(index, size));
}

export function blackmanValue(index: number, size: number): number {
  const factor = (2 * Math.PI * index) / (size - 1);
  return 0.42 - 0.5 * Math.cos(factor) + 0.08 * Math.cos(2 * factor);
}

export function bartlettWindow(size: number): Float64Array {
  if (size === 1) {
    return new Float64Array([1]);
  }
  return Float64Array.from({ length: size }, (_, index) => 1 - Math.abs((2 * index - (size - 1)) / (size - 1)));
}

export function rectangularWindow(size: number): Float64Array {
  const window = new Float64Array(size);
  window.fill(1);
  return window;
}

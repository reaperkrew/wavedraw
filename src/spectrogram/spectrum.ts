export function computePowerSpectrum(
  samples: Float32Array,
  frameStart: number,
  endFrame: number,
  fftSize: number,
  window: Float64Array
): number[] {
  const bins = Math.floor(fftSize / 2) + 1;
  return Array.from({ length: bins }, (_, bin) => computeBinMagnitude(samples, frameStart, endFrame, fftSize, window, bin));
}

export function computeBinMagnitude(
  samples: Float32Array,
  frameStart: number,
  endFrame: number,
  fftSize: number,
  window: Float64Array,
  bin: number
): number {
  let real = 0;
  let imaginary = 0;

  for (let index = 0; index < fftSize; index += 1) {
    const sampleIndex = frameStart + index;
    const sample = sampleIndex < endFrame ? samples[sampleIndex] ?? 0 : 0;
    const windowed = sample * window[index]!;
    const angle = (2 * Math.PI * bin * index) / fftSize;
    real += windowed * Math.cos(angle);
    imaginary -= windowed * Math.sin(angle);
  }

  return (real * real + imaginary * imaginary) / fftSize;
}

# spectrogram

Reduces a `WavAudio` buffer into Mel-scale spectrogram frames. Implemented with a dependency-light direct DFT (no FFT package): fine for the moderate `fftSize` values used in waveform previews, and keeps the runtime dependency surface at zero.

## Public exports

- `summarizeMelSpectrogram(audio, options)` — returns a `MelSpectrogramSummary` with normalized `[0, 1]` per-band values.
- Types: `SpectrogramChannel`, `SummarizeMelSpectrogramOptions`, `MelSpectrogramFrame`, `MelSpectrogramSummary`, `WindowType`.

## Internal modules

- `types.ts` — public types plus `MelFilterbankOptions` and `ResolvedMelOptions`.
- `filterbank.ts` — `createMelFilterbank`, `buildMelPoints`, `buildFilterWeights`, `computeFilterWeight`, `hertzToMel`, `melToHertz`.
- `spectrum.ts` — `computePowerSpectrum`, `computeBinMagnitude`.
- `windows.ts` — `createWindow`, `resolveWindowType`, `hannWindow`, `hammingWindow`, `blackmanWindow`, `bartlettWindow`, `rectangularWindow`, `WindowType`.
- `frames.ts` — `computeMelFrames`, `computeBandDecibels`, `normalizeMelFrames`, `maxValue`.
- `options.ts` — `resolveMelOptions`, `resolveFftSize`, `resolveMelBands`, `resolveFrequencyRange`, `resolveDynamicRangeDb`, `resolveWindowType`, `validateFrequencyRange`.
- `summarize.ts` — `summarizeMelSpectrogram` orchestration, plus `selectSpectrogramSamples`, `mixSpectrogramChannels`, `buildMelPipeline`, `buildMelSummary`.

## Behavior notes

- Spectrogram channel selection supports `"mix"` (default) or a single channel index; `"all"` is intentionally not supported because the summary shape is single-channel.
- Power spectrum uses a direct DFT over the requested `fftSize`, windowed with a selectable analysis window via `options.window` (`"hann"` default, also `"hamming"`, `"blackman"`, `"bartlett"`, `"rectangular"`). All windows are symmetric to keep the default Hann output byte-stable.
- Per-band energy from the Mel filterbank is converted to decibels, then normalized against the run's `maxDecibels` and `dynamicRangeDb` into `[0, 1]`.
- `minDecibels` in the summary is always `maxDecibels - dynamicRangeDb`.

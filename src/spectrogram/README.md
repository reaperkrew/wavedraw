# spectrogram

Reduces a `WavAudio` buffer into spectrogram frames. Two flavors share the same windowed-direct-DFT core: **Mel-scale** (`summarizeMelSpectrogram`) for perceptual analysis, and **linear-frequency STFT** (`summarizeLinearSpectrogram`) for evenly-spaced Hz bins. Implemented with a dependency-light direct DFT (no FFT package): fine for the moderate `fftSize` values used in waveform previews, and keeps the runtime dependency surface at zero.

## Public exports

- `summarizeMelSpectrogram(audio, options)` — returns a `MelSpectrogramSummary` with normalized `[0, 1]` per-band values.
- `summarizeLinearSpectrogram(audio, options)` — returns a `LinearSpectrogramSummary` with normalized `[0, 1]` per-bin values; `bins` evenly-spaced frequency bins span `[minFrequency, maxFrequency]`.
- Types: `SpectrogramChannel`, `SummarizeMelSpectrogramOptions`, `MelSpectrogramFrame`, `MelSpectrogramSummary`, `SummarizeLinearSpectrogramOptions`, `LinearSpectrogramFrame`, `LinearSpectrogramSummary`, `WindowType`.

## Internal modules

- `types.ts` — Mel public types plus `MelFilterbankOptions` and `ResolvedMelOptions`.
- `linear-types.ts` — linear public types plus `ResolvedLinearOptions` and `BinRange`.
- `filterbank.ts` — `createMelFilterbank`, `buildMelPoints`, `buildFilterWeights`, `computeFilterWeight`, `hertzToMel`, `melToHertz`.
- `spectrum.ts` — `computePowerSpectrum`, `computeBinMagnitude`.
- `windows.ts` — `createWindow`, `resolveWindowType`, `hannWindow`, `hammingWindow`, `blackmanWindow`, `bartlettWindow`, `rectangularWindow`, `WindowType`.
- `frames.ts` — `computeMelFrames`, `computeBandDecibels`, `normalizeMelFrames`, `maxValue`.
- `options.ts` — `resolveMelOptions`, `resolveFftSize`, `resolveMelBands`, `resolveFrequencyRange`, `resolveDynamicRangeDb`, `resolveWindowType`, `validateFrequencyRange`.
- `linear-options.ts` — `resolveLinearOptions`, `resolveBins`.
- `linear.ts` — `summarizeLinearSpectrogram` orchestration plus `computeLinearFrames`, `sumBinDecibels`, `buildBinRanges`, `buildBinRange`, `normalizeLinearFrames`, `buildLinearSummary`.
- `summarize.ts` — `summarizeMelSpectrogram` orchestration, plus `selectSpectrogramSamples`, `mixSpectrogramChannels`, `buildMelPipeline`, `buildMelSummary`.

## Behavior notes

- Spectrogram channel selection supports `"mix"` (default) or a single channel index; `"all"` is intentionally not supported because the summary shape is single-channel.
- Power spectrum uses a direct DFT over the requested `fftSize`, windowed with a selectable analysis window via `options.window` (`"hann"` default, also `"hamming"`, `"blackman"`, `"bartlett"`, `"rectangular"`). All windows are symmetric to keep the default Hann output byte-stable.
- Linear bins map evenly across `[minFrequency, maxFrequency]`; each output bin sums the FFT power in its frequency band, then converts to dB. `bins` defaults to `fftSize/2 + 1`.
- Per-band/per-bin energy is converted to decibels, then normalized against the run's `maxDecibels` and `dynamicRangeDb` into `[0, 1]`.
- `minDecibels` in either summary is always `maxDecibels - dynamicRangeDb`.

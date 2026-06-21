# waveform

Reduces a `WavAudio` buffer into `width` per-column waveform statistics. Pure and dependency-light; safe to call from analysis code that never renders.

## Public exports

- `summarizeWaveform(audio, options)` — returns a `WaveformSummary`.
- Types: `WaveformChannel`, `WaveformMetric`, `SummarizeWaveformOptions`, `WaveformColumn`, `WaveformChannelSummary`, `WaveformSummary`.

## Internal modules

- `types.ts` — public types.
- `metrics.ts` — `resolveWaveformMetrics` (defaults + dedupes requested metrics).
- `channels.ts` — `selectChannels` (mix / all / single), `mixChannels`, `selectSingleChannel`.
- `column.ts` — `summarizeChannel`, `computeColumnStats`, `buildColumn`.
- `summarize.ts` — `summarizeWaveform` orchestration.

## Behavior notes

- Each selected frame contributes to exactly one column; empty buckets are deterministic zeros.
- `peaks` preserves negative minimum and positive maximum in `[-1, 1]`.
- `rms` is `sqrt(mean(sample^2))`.
- `channel: "mix"` averages channels per frame before summarization.
- `channel: "all"` produces one `WaveformChannelSummary` per source channel.

import type { RenderWaveformSvgOptions } from "../render/types.js";
import type { WavAudio } from "../wav/types.js";
import type { SummarizeWaveformOptions, WaveformMetric } from "../waveform/types.js";
import type { DrawWaveOptions } from "./types.js";
export declare function drawWave(path: string, options: DrawWaveOptions): Promise<string>;
export declare function resolveWaveMetricsFromFlags(options: DrawWaveOptions): WaveformMetric[];
export declare function buildWaveformSummaryOptions(audio: WavAudio, options: DrawWaveOptions, metrics: WaveformMetric[]): SummarizeWaveformOptions;
export declare function buildWaveformRenderOptions(options: DrawWaveOptions): RenderWaveformSvgOptions;
//# sourceMappingURL=wave.d.ts.map
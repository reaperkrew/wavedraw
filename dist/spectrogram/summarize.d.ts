import type { WavAudio } from "../wav/types.js";
import type { MelSpectrogramFrame, MelSpectrogramSummary, ResolvedMelOptions, SpectrogramChannel, SummarizeMelSpectrogramOptions } from "./types.js";
export declare function summarizeMelSpectrogram(audio: WavAudio, options: SummarizeMelSpectrogramOptions): MelSpectrogramSummary;
export declare function selectSpectrogramSamples(audio: WavAudio, channel: SpectrogramChannel): Float32Array;
export declare function mixSpectrogramChannels(audio: WavAudio): Float32Array;
interface MelPipeline {
    window: Float64Array;
    filterbank: number[][];
}
export declare function buildMelPipeline(audio: WavAudio, resolved: ResolvedMelOptions): MelPipeline;
export declare function buildMelSummary(audio: WavAudio, options: SummarizeMelSpectrogramOptions, resolved: ResolvedMelOptions, selectedFrames: number, spectrogram: MelSpectrogramFrame[], maxDecibels: number): MelSpectrogramSummary;
export {};
//# sourceMappingURL=summarize.d.ts.map
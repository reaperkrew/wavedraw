import type { WavAudio } from "../wav/types.js";
import type { ResolvedMelOptions, SummarizeMelSpectrogramOptions } from "./types.js";
export declare function resolveMelOptions(audio: WavAudio, options: SummarizeMelSpectrogramOptions): ResolvedMelOptions;
export declare function resolveFftSize(value: number | undefined): number;
export declare function resolveMelBands(value: number | undefined): number;
export declare function resolveFrequencyRange(sampleRate: number, minOption: number | undefined, maxOption: number | undefined): {
    minFrequency: number;
    maxFrequency: number;
};
export declare function resolveDynamicRangeDb(value: number | undefined): number;
export declare function validateFrequencyRange(sampleRate: number, minFrequency: number, maxFrequency: number): void;
//# sourceMappingURL=options.d.ts.map
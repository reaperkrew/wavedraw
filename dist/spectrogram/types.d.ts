export type SpectrogramChannel = number | "mix";
export interface SummarizeMelSpectrogramOptions {
    width: number;
    channel?: SpectrogramChannel;
    startSeconds?: number;
    endSeconds?: number;
    fftSize?: number;
    melBands?: number;
    minFrequency?: number;
    maxFrequency?: number;
    dynamicRangeDb?: number;
}
export interface MelSpectrogramFrame {
    values: number[];
}
export interface MelSpectrogramSummary {
    width: number;
    sampleRate: number;
    startSeconds: number;
    endSeconds: number;
    frames: number;
    fftSize: number;
    melBands: number;
    minFrequency: number;
    maxFrequency: number;
    minDecibels: number;
    maxDecibels: number;
    spectrogram: MelSpectrogramFrame[];
}
export interface MelFilterbankOptions {
    fftSize: number;
    melBands: number;
    sampleRate: number;
    minFrequency: number;
    maxFrequency: number;
}
export interface ResolvedMelOptions {
    fftSize: number;
    melBands: number;
    minFrequency: number;
    maxFrequency: number;
    dynamicRangeDb: number;
    startSeconds: number;
    endSeconds: number;
}
//# sourceMappingURL=types.d.ts.map
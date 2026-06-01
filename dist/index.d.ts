export type WavAudioFormat = "pcm" | "float";
export interface WavFormat {
    audioFormat: WavAudioFormat;
    channels: number;
    sampleRate: number;
    byteRate: number;
    blockAlign: number;
    bitsPerSample: 8 | 16 | 24 | 32;
    dataOffset: number;
    dataLength: number;
}
export interface WavAudio {
    format: WavFormat;
    channels: Float32Array[];
    frames: number;
    durationSeconds: number;
}
export interface ParseWavOptions {
    copy?: boolean;
}
export interface ReadWavFileOptions extends ParseWavOptions {
}
export type WaveformChannel = number | "mix" | "all";
export type SpectrogramChannel = number | "mix";
export type WaveformMetric = "peaks" | "rms" | "average";
export interface SummarizeWaveformOptions {
    width: number;
    channel?: WaveformChannel;
    startSeconds?: number;
    endSeconds?: number;
    metrics?: WaveformMetric[];
}
export interface WaveformColumn {
    min: number;
    max: number;
    rms?: number;
    average?: number;
}
export interface WaveformChannelSummary {
    channel: number | "mix";
    columns: WaveformColumn[];
}
export interface WaveformSummary {
    width: number;
    sampleRate: number;
    startSeconds: number;
    endSeconds: number;
    frames: number;
    channels: WaveformChannelSummary[];
}
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
export interface WaveformLayerStyle {
    color?: string;
    strokeWidth?: number;
}
export interface RenderWaveformSvgOptions {
    width?: number;
    height: number;
    background?: string;
    padding?: number;
    layers?: {
        peaks?: WaveformLayerStyle | false;
        rms?: WaveformLayerStyle | false;
        average?: WaveformLayerStyle | false;
    };
}
export interface RenderMelSpectrogramSvgOptions {
    width?: number;
    height: number;
    background?: string;
    padding?: number;
    colors?: string[];
}
type TimeOption = "START" | "END" | number | string;
export interface DrawWaveOptions extends Omit<SummarizeWaveformOptions, "startSeconds" | "endSeconds" | "metrics"> {
    height: number;
    output?: string;
    filename?: string;
    background?: string;
    colors?: {
        background?: string;
        peaks?: string;
        maximums?: string;
        rms?: string;
        average?: string;
    };
    maximums?: boolean;
    peaks?: boolean;
    rms?: boolean;
    average?: boolean;
    start?: TimeOption;
    end?: TimeOption;
}
export interface DrawMelSpectrogramOptions extends Omit<SummarizeMelSpectrogramOptions, "startSeconds" | "endSeconds"> {
    height: number;
    output?: string;
    filename?: string;
    background?: string;
    colors?: string[];
    padding?: number;
    start?: TimeOption;
    end?: TimeOption;
}
export declare function readWavFile(path: string, options?: ReadWavFileOptions): Promise<WavAudio>;
export declare function parseWav(input: Buffer | ArrayBuffer | Uint8Array, _options?: ParseWavOptions): WavAudio;
export declare function summarizeWaveform(audio: WavAudio, options: SummarizeWaveformOptions): WaveformSummary;
export declare function summarizeMelSpectrogram(audio: WavAudio, options: SummarizeMelSpectrogramOptions): MelSpectrogramSummary;
export declare function renderWaveformSvg(summary: WaveformSummary, options: RenderWaveformSvgOptions): string;
export declare function renderMelSpectrogramSvg(summary: MelSpectrogramSummary, options: RenderMelSpectrogramSvgOptions): string;
export declare function drawWave(path: string, options: DrawWaveOptions): Promise<string>;
export declare function drawMelSpectrogram(path: string, options: DrawMelSpectrogramOptions): Promise<string>;
export {};
//# sourceMappingURL=index.d.ts.map
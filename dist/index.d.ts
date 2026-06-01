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
    start?: "START" | number | string;
    end?: "END" | number | string;
}
export declare function readWavFile(path: string, options?: ReadWavFileOptions): Promise<WavAudio>;
export declare function parseWav(input: Buffer | ArrayBuffer | Uint8Array, _options?: ParseWavOptions): WavAudio;
export declare function summarizeWaveform(audio: WavAudio, options: SummarizeWaveformOptions): WaveformSummary;
export declare function renderWaveformSvg(summary: WaveformSummary, options: RenderWaveformSvgOptions): string;
export declare function drawWave(path: string, options: DrawWaveOptions): Promise<string>;
//# sourceMappingURL=index.d.ts.map
import type { WavAudio } from "../wav/types.js";
import { type ChannelSelection } from "./channels.js";
import type { SummarizeWaveformOptions, WaveformMetric, WaveformSummary } from "./types.js";
export declare function summarizeWaveform(audio: WavAudio, options: SummarizeWaveformOptions): WaveformSummary;
export interface WaveformFrameRange {
    startFrame: number;
    endFrame: number;
    selectedFrames: number;
}
export declare function computeWaveformFrameRange(audio: WavAudio, startSeconds: number, endSeconds: number): WaveformFrameRange;
export declare function buildWaveformSummary(audio: WavAudio, options: SummarizeWaveformOptions, range: {
    startSeconds: number;
    endSeconds: number;
}, frames: WaveformFrameRange, channels: ChannelSelection[], metrics: Set<WaveformMetric>): WaveformSummary;
//# sourceMappingURL=summarize.d.ts.map
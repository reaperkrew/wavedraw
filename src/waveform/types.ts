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

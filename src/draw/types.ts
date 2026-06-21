import type { TimeOption } from "../internal/time.js";
import type { DrawFormat } from "./output.js";
import type { SummarizeMelSpectrogramOptions } from "../spectrogram/types.js";
import type { SummarizeWaveformOptions } from "../waveform/types.js";

export interface DrawWaveOptions extends Omit<SummarizeWaveformOptions, "startSeconds" | "endSeconds" | "metrics"> {
  height: number;
  output?: string;
  filename?: string;
  format?: DrawFormat;
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
  format?: DrawFormat;
  background?: string;
  colors?: string[];
  padding?: number;
  start?: TimeOption;
  end?: TimeOption;
}

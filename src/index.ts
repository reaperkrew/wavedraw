export { parseWav, readWavFile } from "./wav/read.js";
export type {
  ParseWavOptions,
  ReadWavFileOptions,
  WavAudio,
  WavAudioFormat,
  WavFormat
} from "./wav/types.js";

export { parseAiff, readAiffFile } from "./aiff/read.js";
export type { AiffComm, AiffEncoding, AiffFlavor } from "./aiff/read.js";

export { loadAudio, parseAudio } from "./draw/load.js";

export { summarizeWaveform } from "./waveform/summarize.js";
export type {
  SummarizeWaveformOptions,
  WaveformChannel,
  WaveformChannelSummary,
  WaveformColumn,
  WaveformMetric,
  WaveformSummary
} from "./waveform/types.js";

export { summarizeMelSpectrogram } from "./spectrogram/summarize.js";
export type { WindowType } from "./spectrogram/windows.js";
export type {
  MelSpectrogramFrame,
  MelSpectrogramSummary,
  SpectrogramChannel,
  SummarizeMelSpectrogramOptions
} from "./spectrogram/types.js";

export { summarizeLinearSpectrogram } from "./spectrogram/linear.js";
export type {
  LinearSpectrogramFrame,
  LinearSpectrogramSummary,
  SummarizeLinearSpectrogramOptions
} from "./spectrogram/linear-types.js";

export { renderWaveformSvg } from "./render/waveform-svg.js";
export { renderMelSpectrogramSvg } from "./render/spectrogram-svg.js";
export { renderLinearSpectrogramSvg } from "./render/linear-spectrogram-svg.js";
export { renderWaveformPng } from "./render/png/waveform-png.js";
export { renderMelSpectrogramPng } from "./render/png/spectrogram-png.js";
export { renderLinearSpectrogramPng } from "./render/png/linear-spectrogram-png.js";
export type {
  AxesOptions,
  RenderLinearSpectrogramPngOptions,
  RenderLinearSpectrogramSvgOptions,
  RenderMelSpectrogramPngOptions,
  RenderMelSpectrogramSvgOptions,
  RenderWaveformPngOptions,
  RenderWaveformSvgOptions,
  WaveformLayerStyle
} from "./render/types.js";
export type { ColormapName } from "./render/colormaps.js";

export { drawWave } from "./draw/wave.js";
export { drawMelSpectrogram } from "./draw/spectrogram.js";
export { drawLinearSpectrogram } from "./draw/linear-spectrogram.js";
export type { DrawLinearSpectrogramOptions, DrawMelSpectrogramOptions, DrawWaveOptions } from "./draw/types.js";

import { readFile, writeFile } from "node:fs/promises";

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

export interface ReadWavFileOptions extends ParseWavOptions {}

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

const RIFF = "RIFF";
const WAVE = "WAVE";
const FMT = "fmt ";
const DATA = "data";
const PCM_FORMAT = 1;
const FLOAT_FORMAT = 3;

export async function readWavFile(path: string, options: ReadWavFileOptions = {}): Promise<WavAudio> {
  const input = await readFile(path);
  return parseWav(input, options);
}

export function parseWav(input: Buffer | ArrayBuffer | Uint8Array, _options: ParseWavOptions = {}): WavAudio {
  const bytes = toUint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (bytes.byteLength < 12) {
    throw new Error("Invalid WAV: file is too small");
  }

  if (readAscii(bytes, 0, 4) !== RIFF) {
    throw new Error("Invalid WAV: missing RIFF header");
  }

  if (readAscii(bytes, 8, 4) !== WAVE) {
    throw new Error("Invalid WAV: missing WAVE format");
  }

  let fmt: Omit<WavFormat, "dataOffset" | "dataLength"> | undefined;
  let dataOffset = -1;
  let dataLength = 0;
  let offset = 12;

  while (offset + 8 <= bytes.byteLength) {
    const id = readAscii(bytes, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const payloadOffset = offset + 8;
    const nextOffset = payloadOffset + size + (size % 2);

    if (payloadOffset + size > bytes.byteLength) {
      throw new Error(`Invalid WAV: chunk ${id.trim() || "(empty)"} exceeds file length`);
    }

    if (id === FMT) {
      fmt = parseFmtChunk(view, payloadOffset, size);
    } else if (id === DATA) {
      dataOffset = payloadOffset;
      dataLength = size;
    }

    offset = nextOffset;
  }

  if (!fmt) {
    throw new Error("Invalid WAV: missing fmt chunk");
  }

  if (dataOffset < 0) {
    throw new Error("Invalid WAV: missing data chunk");
  }

  const format: WavFormat = {
    ...fmt,
    dataOffset,
    dataLength
  };

  validateFormat(format);

  const frames = Math.floor(dataLength / format.blockAlign);
  const channels = decodeChannels(view, format, frames);

  return {
    format,
    channels,
    frames,
    durationSeconds: frames / format.sampleRate
  };
}

export function summarizeWaveform(audio: WavAudio, options: SummarizeWaveformOptions): WaveformSummary {
  validatePositiveInteger("width", options.width);

  const startSeconds = options.startSeconds ?? 0;
  const endSeconds = options.endSeconds ?? audio.durationSeconds;

  if (!Number.isFinite(startSeconds) || startSeconds < 0) {
    throw new Error("startSeconds must be a finite number greater than or equal to 0");
  }

  if (!Number.isFinite(endSeconds) || endSeconds <= startSeconds) {
    throw new Error("endSeconds must be greater than startSeconds");
  }

  if (endSeconds > audio.durationSeconds) {
    throw new Error("endSeconds exceeds audio duration");
  }

  const startFrame = Math.floor(startSeconds * audio.format.sampleRate);
  const endFrame = Math.min(audio.frames, Math.ceil(endSeconds * audio.format.sampleRate));
  const selectedFrames = Math.max(0, endFrame - startFrame);
  const metrics = new Set<WaveformMetric>(options.metrics ?? ["peaks", "rms"]);
  const selectedChannels = selectChannels(audio, options.channel ?? "mix");

  return {
    width: options.width,
    sampleRate: audio.format.sampleRate,
    startSeconds,
    endSeconds,
    frames: selectedFrames,
    channels: selectedChannels.map((channel) => ({
      channel: channel.channel,
      columns: summarizeChannel(channel.samples, startFrame, endFrame, options.width, metrics)
    }))
  };
}

export function renderWaveformSvg(summary: WaveformSummary, options: RenderWaveformSvgOptions): string {
  const width = options.width ?? summary.width;
  const { height } = options;
  validatePositiveInteger("width", width);
  validatePositiveInteger("height", height);

  const padding = options.padding ?? 0;
  if (!Number.isFinite(padding) || padding < 0 || padding * 2 >= height) {
    throw new Error("padding must be finite, non-negative, and smaller than half the height");
  }

  const layers = {
    peaks: options.layers?.peaks ?? { color: "#2563eb", strokeWidth: 1 },
    rms: options.layers?.rms ?? { color: "#60a5fa", strokeWidth: 1 },
    average: options.layers?.average ?? { color: "#111827", strokeWidth: 1 }
  };

  const half = (height - padding * 2) / 2;
  const mid = padding + half;
  const xScale = width / summary.width;
  const elements: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Audio waveform">`
  ];

  if (options.background) {
    elements.push(`<rect width="100%" height="100%" fill="${escapeAttribute(options.background)}"/>`);
  }

  for (const channel of summary.channels) {
    if (layers.peaks) {
      const style = normalizeLayer(layers.peaks);
      const lines = channel.columns.map((column, x) => {
        const px = formatNumber((x + 0.5) * xScale);
        const y1 = formatNumber(mid - clamp(column.max, -1, 1) * half);
        const y2 = formatNumber(mid - clamp(column.min, -1, 1) * half);
        return `<line x1="${px}" y1="${y1}" x2="${px}" y2="${y2}"/>`;
      });
      elements.push(`<g stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" stroke-linecap="butt">${lines.join("")}</g>`);
    }

    if (layers.rms && channel.columns.some((column) => column.rms !== undefined)) {
      const style = normalizeLayer(layers.rms);
      const lines = channel.columns.map((column, x) => {
        const rms = column.rms ?? 0;
        const px = formatNumber((x + 0.5) * xScale);
        const y1 = formatNumber(mid - clamp(rms, 0, 1) * half);
        const y2 = formatNumber(mid + clamp(rms, 0, 1) * half);
        return `<line x1="${px}" y1="${y1}" x2="${px}" y2="${y2}"/>`;
      });
      elements.push(`<g stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" stroke-linecap="butt" opacity="0.7">${lines.join("")}</g>`);
    }

    if (layers.average && channel.columns.some((column) => column.average !== undefined)) {
      const style = normalizeLayer(layers.average);
      const points = channel.columns.map((column, x) => {
        const px = formatNumber((x + 0.5) * xScale);
        const py = formatNumber(mid - clamp(column.average ?? 0, -1, 1) * half);
        return `${px},${py}`;
      });
      elements.push(`<polyline fill="none" stroke="${escapeAttribute(style.color)}" stroke-width="${style.strokeWidth}" points="${points.join(" ")}"/>`);
    }
  }

  elements.push("</svg>");
  return elements.join("");
}

export async function drawWave(path: string, options: DrawWaveOptions): Promise<string> {
  const audio = await readWavFile(path);
  const metrics: WaveformMetric[] = [];

  if (options.maximums || options.peaks) {
    metrics.push("peaks");
  }
  if (options.rms) {
    metrics.push("rms");
  }
  if (options.average) {
    metrics.push("average");
  }

  const summary = summarizeWaveform(audio, {
    width: options.width,
    channel: options.channel ?? "mix",
    startSeconds: normalizeTimeOption(options.start, 0),
    endSeconds: normalizeTimeOption(options.end, audio.durationSeconds),
    metrics: metrics.length > 0 ? metrics : ["peaks", "rms"]
  });

  const renderOptions: RenderWaveformSvgOptions = {
    width: options.width,
    height: options.height,
    layers: {
      peaks: { color: options.colors?.peaks ?? options.colors?.maximums ?? "#2563eb" },
      rms: { color: options.colors?.rms ?? "#60a5fa" },
      average: { color: options.colors?.average ?? "#111827" }
    }
  };
  const background = options.background ?? options.colors?.background;
  if (background !== undefined) {
    renderOptions.background = background;
  }

  const svg = renderWaveformSvg(summary, renderOptions);

  const output = options.output ?? options.filename;
  if (output) {
    await writeFile(output, svg);
  }
  return svg;
}

function toUint8Array(input: Buffer | ArrayBuffer | Uint8Array): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }
  return new Uint8Array(input);
}

function parseFmtChunk(view: DataView, offset: number, size: number): Omit<WavFormat, "dataOffset" | "dataLength"> {
  if (size < 16) {
    throw new Error("Invalid WAV: fmt chunk is too small");
  }

  const audioFormatCode = view.getUint16(offset, true);
  const channels = view.getUint16(offset + 2, true);
  const sampleRate = view.getUint32(offset + 4, true);
  const byteRate = view.getUint32(offset + 8, true);
  const blockAlign = view.getUint16(offset + 12, true);
  const bitsPerSample = view.getUint16(offset + 14, true);

  if (audioFormatCode !== PCM_FORMAT && audioFormatCode !== FLOAT_FORMAT) {
    throw new Error(`Unsupported WAV audio format: ${audioFormatCode}`);
  }

  if (!isSupportedBitsPerSample(bitsPerSample)) {
    throw new Error(`Unsupported WAV bits per sample: ${bitsPerSample}`);
  }

  return {
    audioFormat: audioFormatCode === PCM_FORMAT ? "pcm" : "float",
    channels,
    sampleRate,
    byteRate,
    blockAlign,
    bitsPerSample
  };
}

function validateFormat(format: WavFormat): void {
  if (format.channels < 1 || !Number.isInteger(format.channels)) {
    throw new Error("Invalid WAV: channel count must be a positive integer");
  }
  if (format.sampleRate < 1 || !Number.isInteger(format.sampleRate)) {
    throw new Error("Invalid WAV: sample rate must be a positive integer");
  }
  if (format.audioFormat === "float" && format.bitsPerSample !== 32) {
    throw new Error("Unsupported WAV: float audio must use 32 bits per sample");
  }

  const expectedBlockAlign = format.channels * (format.bitsPerSample / 8);
  if (format.blockAlign !== expectedBlockAlign) {
    throw new Error("Invalid WAV: blockAlign does not match channel count and bit depth");
  }

  const expectedByteRate = format.sampleRate * format.blockAlign;
  if (format.byteRate !== expectedByteRate) {
    throw new Error("Invalid WAV: byteRate does not match sampleRate and blockAlign");
  }

  if (format.dataLength % format.blockAlign !== 0) {
    throw new Error("Invalid WAV: data chunk is not aligned to frame size");
  }
}

function decodeChannels(view: DataView, format: WavFormat, frames: number): Float32Array[] {
  const channels = Array.from({ length: format.channels }, () => new Float32Array(frames));
  const bytesPerSample = format.bitsPerSample / 8;

  for (let frame = 0; frame < frames; frame += 1) {
    const frameOffset = format.dataOffset + frame * format.blockAlign;
    for (let channel = 0; channel < format.channels; channel += 1) {
      const sampleOffset = frameOffset + channel * bytesPerSample;
      channels[channel]![frame] = readSample(view, sampleOffset, format);
    }
  }

  return channels;
}

function readSample(view: DataView, offset: number, format: WavFormat): number {
  if (format.audioFormat === "float") {
    return clamp(view.getFloat32(offset, true), -1, 1);
  }

  switch (format.bitsPerSample) {
    case 8:
      return (view.getUint8(offset) - 128) / 128;
    case 16:
      return normalizeSigned(view.getInt16(offset, true), 32768);
    case 24:
      return normalizeSigned(readInt24(view, offset), 8388608);
    case 32:
      return normalizeSigned(view.getInt32(offset, true), 2147483648);
  }
}

function readInt24(view: DataView, offset: number): number {
  const value = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
  return value & 0x800000 ? value | 0xff000000 : value;
}

function normalizeSigned(value: number, divisor: number): number {
  return Math.max(-1, Math.min(1, value / divisor));
}

function selectChannels(audio: WavAudio, channel: WaveformChannel): Array<{ channel: number | "mix"; samples: Float32Array }> {
  if (channel === "all") {
    return audio.channels.map((samples, index) => ({ channel: index, samples }));
  }

  if (channel === "mix") {
    if (audio.channels.length === 1) {
      return [{ channel: 0, samples: audio.channels[0]! }];
    }

    const mixed = new Float32Array(audio.frames);
    for (let frame = 0; frame < audio.frames; frame += 1) {
      let sum = 0;
      for (const samples of audio.channels) {
        sum += samples[frame] ?? 0;
      }
      mixed[frame] = sum / audio.channels.length;
    }
    return [{ channel: "mix", samples: mixed }];
  }

  if (!Number.isInteger(channel) || channel < 0 || channel >= audio.channels.length) {
    throw new Error(`channel must be "mix", "all", or an integer from 0 to ${audio.channels.length - 1}`);
  }

  return [{ channel, samples: audio.channels[channel]! }];
}

function summarizeChannel(
  samples: Float32Array,
  startFrame: number,
  endFrame: number,
  width: number,
  metrics: Set<WaveformMetric>
): WaveformColumn[] {
  const selectedFrames = endFrame - startFrame;
  const columns: WaveformColumn[] = [];

  for (let x = 0; x < width; x += 1) {
    const bucketStart = startFrame + Math.floor((x * selectedFrames) / width);
    const bucketEnd = startFrame + Math.floor(((x + 1) * selectedFrames) / width);
    const actualEnd = Math.max(bucketEnd, bucketStart + 1);
    const end = Math.min(actualEnd, endFrame);

    let min = 1;
    let max = -1;
    let sum = 0;
    let sumSquares = 0;
    let count = 0;

    for (let frame = bucketStart; frame < end; frame += 1) {
      const sample = samples[frame] ?? 0;
      if (sample < min) min = sample;
      if (sample > max) max = sample;
      sum += sample;
      sumSquares += sample * sample;
      count += 1;
    }

    if (count === 0) {
      min = 0;
      max = 0;
    }

    const column: WaveformColumn = {
      min: metrics.has("peaks") ? min : 0,
      max: metrics.has("peaks") ? max : 0
    };

    if (metrics.has("rms")) {
      column.rms = count > 0 ? Math.sqrt(sumSquares / count) : 0;
    }

    if (metrics.has("average")) {
      column.average = count > 0 ? sum / count : 0;
    }

    columns.push(column);
  }

  return columns;
}

function normalizeLayer(style: WaveformLayerStyle): Required<WaveformLayerStyle> {
  return {
    color: style.color ?? "#2563eb",
    strokeWidth: style.strokeWidth ?? 1
  };
}

function normalizeTimeOption(value: DrawWaveOptions["start"] | DrawWaveOptions["end"], fallback: number): number {
  if (value === undefined || value === "START" || value === "END") {
    return fallback;
  }

  if (typeof value === "number") {
    return value;
  }

  const parts = value.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error("time strings must use HH:MM:SS format");
  }

  return parts[0]! * 60 * 60 + parts[1]! * 60 + parts[2]!;
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += String.fromCharCode(bytes[offset + i] ?? 0);
  }
  return result;
}

function isSupportedBitsPerSample(value: number): value is WavFormat["bitsPerSample"] {
  return value === 8 || value === 16 || value === 24 || value === 32;
}

function validatePositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

import { validateFormatBasics } from "../wav/validate.js";
import { decodeAiffChannels } from "./decode.js";
import { scanAiffChunks, type ScannedAiff } from "./chunks.js";
import { parseFormHeader } from "./header.js";
import type { AiffComm } from "./comm.js";
import type { WavAudio, WavFormat } from "../wav/types.js";

export function parseAiff(input: Buffer | ArrayBuffer | Uint8Array): WavAudio {
  const bytes = toAiffBytes(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flavor = parseFormHeader(bytes);
  const scanned = scanAiffChunks(bytes, view, flavor);
  const comm = requireComm(scanned.comm);
  const format = buildAiffFormat(comm, scanned.soundOffset, scanned.soundLength);
  validateFormatBasics(format);
  const channels = decodeAiffChannels(view, comm, scanned.soundOffset);
  return { format, channels, frames: comm.sampleFrames, durationSeconds: comm.sampleFrames / format.sampleRate };
}

export function requireComm(comm: AiffComm | undefined): AiffComm {
  if (!comm) {
    throw new Error("Invalid AIFF: missing COMM chunk");
  }
  return comm;
}

export function toAiffBytes(input: Buffer | ArrayBuffer | Uint8Array): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

export function buildAiffFormat(comm: AiffComm, soundOffset: number, soundLength: number): WavFormat {
  if (soundOffset < 0) {
    throw new Error("Invalid AIFF: missing SSND chunk");
  }
  const blockAlign = comm.channels * (comm.bitsPerSample / 8);
  return {
    audioFormat: comm.encoding === "float" ? "float" : "pcm",
    channels: comm.channels,
    sampleRate: comm.sampleRate,
    byteRate: comm.sampleRate * blockAlign,
    blockAlign,
    bitsPerSample: comm.bitsPerSample as WavFormat["bitsPerSample"],
    dataOffset: soundOffset,
    dataLength: soundLength
  };
}

import { clamp } from "../internal/math.js";
import { normalizeSigned } from "../wav/decode.js";
import type { AiffComm } from "./comm.js";

export function decodeAiffChannels(view: DataView, comm: AiffComm, dataOffset: number): Float32Array[] {
  const channels = Array.from({ length: comm.channels }, () => new Float32Array(comm.sampleFrames));
  const bytesPerSample = comm.bitsPerSample / 8;
  const blockAlign = comm.channels * bytesPerSample;
  for (let frame = 0; frame < comm.sampleFrames; frame += 1) {
    const frameOffset = dataOffset + frame * blockAlign;
    for (let channel = 0; channel < comm.channels; channel += 1) {
      const sampleOffset = frameOffset + channel * bytesPerSample;
      channels[channel]![frame] = readAiffSample(view, sampleOffset, comm);
    }
  }
  return channels;
}

export function readAiffSample(view: DataView, offset: number, comm: AiffComm): number {
  if (comm.encoding === "float") {
    return comm.bitsPerSample === 64 ? clamp(view.getFloat64(offset, false), -1, 1) : clamp(view.getFloat32(offset, false), -1, 1);
  }
  switch (comm.bitsPerSample) {
    case 8:
      return normalizeSigned(view.getInt8(offset), 128);
    case 16:
      return normalizeSigned(view.getInt16(offset, false), 32768);
    case 24:
      return normalizeSigned(readInt24Be(view, offset), 8388608);
    case 32:
      return normalizeSigned(view.getInt32(offset, false), 2147483648);
    default:
      return 0;
  }
}

export function readInt24Be(view: DataView, offset: number): number {
  const value = (view.getUint8(offset) << 16) | (view.getUint8(offset + 1) << 8) | view.getUint8(offset + 2);
  return value & 0x800000 ? value | 0xff000000 : value;
}

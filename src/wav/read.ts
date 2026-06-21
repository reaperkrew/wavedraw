import { readFile } from "node:fs/promises";
import { parseWav } from "./parse.js";
import type { ParseWavOptions, ReadWavFileOptions, WavAudio } from "./types.js";

export async function readWavFile(path: string, options: ReadWavFileOptions = {}): Promise<WavAudio> {
  const input = await readFile(path);
  return parseWav(input, options);
}

export { parseWav } from "./parse.js";
export type { ParseWavOptions, ReadWavFileOptions, WavAudio, WavAudioFormat, WavFormat } from "./types.js";

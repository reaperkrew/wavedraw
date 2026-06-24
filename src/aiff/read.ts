import { readFile } from "node:fs/promises";
import type { WavAudio } from "../wav/types.js";
import { parseAiff } from "./parse.js";

export async function readAiffFile(path: string): Promise<WavAudio> {
  const input = await readFile(path);
  return parseAiff(input);
}

export { parseAiff } from "./parse.js";
export type { AiffComm, AiffEncoding } from "./comm.js";
export type { AiffFlavor } from "./header.js";

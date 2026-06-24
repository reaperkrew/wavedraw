import { readFile } from "node:fs/promises";
import { readAscii } from "../internal/ascii.js";
import { parseAiff } from "../aiff/parse.js";
import { parseWav } from "../wav/parse.js";
import type { WavAudio } from "../wav/types.js";

const FORM_MAGIC = "FORM";

export async function loadAudio(path: string): Promise<WavAudio> {
  const input = await readFile(path);
  return parseAudio(input);
}

export function parseAudio(input: Buffer | ArrayBuffer | Uint8Array): WavAudio {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  return readAscii(bytes, 0, 4) === FORM_MAGIC ? parseAiff(bytes) : parseWav(bytes);
}

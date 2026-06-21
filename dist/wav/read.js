import { readFile } from "node:fs/promises";
import { parseWav } from "./parse.js";
export async function readWavFile(path, options = {}) {
    const input = await readFile(path);
    return parseWav(input, options);
}
export { parseWav } from "./parse.js";

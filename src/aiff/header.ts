import { readAscii } from "../internal/ascii.js";

const FORM = "FORM";
const AIFF = "AIFF";
const AIFC = "AIFC";

export type AiffFlavor = "aiff" | "aifc";

export function parseFormHeader(bytes: Uint8Array): AiffFlavor {
  if (bytes.byteLength < 12) {
    throw new Error("Invalid AIFF: file is too small");
  }
  if (readAscii(bytes, 0, 4) !== FORM) {
    throw new Error("Invalid AIFF: missing FORM header");
  }
  const flavor = readAscii(bytes, 8, 4);
  if (flavor === AIFF) {
    return "aiff";
  }
  if (flavor === AIFC) {
    return "aifc";
  }
  throw new Error(`Invalid AIFF: unsupported form type ${flavor}`);
}

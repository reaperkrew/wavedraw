import { writeFile } from "node:fs/promises";

export type DrawFormat = "svg" | "png";
export type DrawOutput = string | Uint8Array;

export interface DrawOutputOptions {
  output?: string;
  filename?: string;
}

export interface DrawFormatOptions extends DrawOutputOptions {
  format?: DrawFormat;
}

export async function writeDrawOutput(data: DrawOutput, options: DrawOutputOptions): Promise<void> {
  const output = options.output ?? options.filename;
  if (output) {
    await writeFile(output, data);
  }
}

export function resolveOutputFormat(options: DrawFormatOptions): DrawFormat {
  if (options.format) {
    return options.format;
  }
  const output = (options.output ?? options.filename ?? "").toLowerCase();
  return output.endsWith(".png") ? "png" : "svg";
}

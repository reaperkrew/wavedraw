import { writeFile } from "node:fs/promises";

export interface SvgOutputOptions {
  output?: string;
  filename?: string;
}

export async function writeSvgOutput(svg: string, options: SvgOutputOptions): Promise<void> {
  const output = options.output ?? options.filename;
  if (output) {
    await writeFile(output, svg);
  }
}

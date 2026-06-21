import { writeFile } from "node:fs/promises";
export async function writeSvgOutput(svg, options) {
    const output = options.output ?? options.filename;
    if (output) {
        await writeFile(output, svg);
    }
}

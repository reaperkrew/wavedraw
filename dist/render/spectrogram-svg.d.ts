import type { MelSpectrogramFrame, MelSpectrogramSummary } from "../spectrogram/types.js";
import { type RgbColor } from "./color.js";
import type { RenderMelSpectrogramSvgOptions } from "./types.js";
export declare function renderMelSpectrogramSvg(summary: MelSpectrogramSummary, options: RenderMelSpectrogramSvgOptions): string;
export interface SpectrogramGeometry {
    width: number;
    height: number;
    padding: number;
    columnWidth: number;
    bandHeight: number;
}
export declare function buildSpectrogramGeometry(summaryWidth: number, melBands: number, options: RenderMelSpectrogramSvgOptions): SpectrogramGeometry;
export declare function validateSpectrogramPadding(padding: number, width: number, height: number): number;
export declare function renderMelCells(summary: MelSpectrogramSummary, geometry: SpectrogramGeometry, colors: RgbColor[]): string[];
export declare function renderMelCell(frame: MelSpectrogramFrame, band: number, x: number, melBands: number, geometry: SpectrogramGeometry, colors: RgbColor[]): string;
//# sourceMappingURL=spectrogram-svg.d.ts.map
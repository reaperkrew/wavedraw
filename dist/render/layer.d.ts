import type { RenderWaveformSvgOptions, WaveformLayerConfig, WaveformLayerStyle } from "./types.js";
export type ResolvedWaveformLayer = Required<WaveformLayerStyle> | false;
export interface ResolvedWaveformLayers {
    peaks: ResolvedWaveformLayer;
    rms: ResolvedWaveformLayer;
    average: ResolvedWaveformLayer;
}
export declare function resolveWaveformLayers(config: WaveformLayerConfig | undefined): ResolvedWaveformLayers;
export declare function resolveLayer(style: WaveformLayerStyle | false | undefined, defaultColor: string): ResolvedWaveformLayer;
export declare function normalizeLayer(style: WaveformLayerStyle): Required<WaveformLayerStyle>;
export interface WaveformGeometry {
    width: number;
    height: number;
    padding: number;
    half: number;
    mid: number;
    xScale: number;
}
export declare function buildWaveformGeometry(summaryWidth: number, options: RenderWaveformSvgOptions): WaveformGeometry;
export declare function validateWaveformPadding(padding: number, height: number): number;
//# sourceMappingURL=layer.d.ts.map
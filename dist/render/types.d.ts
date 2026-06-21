export interface WaveformLayerStyle {
    color?: string;
    strokeWidth?: number;
}
export interface WaveformLayerConfig {
    peaks?: WaveformLayerStyle | false;
    rms?: WaveformLayerStyle | false;
    average?: WaveformLayerStyle | false;
}
export interface RenderWaveformSvgOptions {
    width?: number;
    height: number;
    background?: string;
    padding?: number;
    layers?: WaveformLayerConfig;
}
export interface RenderMelSpectrogramSvgOptions {
    width?: number;
    height: number;
    background?: string;
    padding?: number;
    colors?: string[];
}
//# sourceMappingURL=types.d.ts.map
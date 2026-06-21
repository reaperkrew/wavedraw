import type { WaveformChannelSummary, WaveformColumn, WaveformSummary } from "../waveform/types.js";
import { type ResolvedWaveformLayer, type WaveformGeometry } from "./layer.js";
import type { RenderWaveformSvgOptions, WaveformLayerStyle } from "./types.js";
export declare function renderWaveformSvg(summary: WaveformSummary, options: RenderWaveformSvgOptions): string;
export declare function renderWaveformLayers(channel: WaveformChannelSummary, layers: {
    peaks: ResolvedWaveformLayer;
    rms: ResolvedWaveformLayer;
    average: ResolvedWaveformLayer;
}, geometry: WaveformGeometry): string[];
export declare function renderPeaksLayer(columns: WaveformColumn[], style: Required<WaveformLayerStyle>, geometry: WaveformGeometry): string;
export declare function renderRmsLayer(columns: WaveformColumn[], style: Required<WaveformLayerStyle>, geometry: WaveformGeometry): string;
export declare function renderAverageLayer(columns: WaveformColumn[], style: Required<WaveformLayerStyle>, geometry: WaveformGeometry): string;
//# sourceMappingURL=waveform-svg.d.ts.map
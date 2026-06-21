import type { RenderMelSpectrogramSvgOptions } from "../render/types.js";
import type { SummarizeMelSpectrogramOptions } from "../spectrogram/types.js";
import type { WavAudio } from "../wav/types.js";
import type { DrawMelSpectrogramOptions } from "./types.js";
export declare function drawMelSpectrogram(path: string, options: DrawMelSpectrogramOptions): Promise<string>;
export declare function buildMelSummaryOptions(audio: WavAudio, options: DrawMelSpectrogramOptions): SummarizeMelSpectrogramOptions;
export declare function buildMelRenderOptions(options: DrawMelSpectrogramOptions): RenderMelSpectrogramSvgOptions;
//# sourceMappingURL=spectrogram.d.ts.map
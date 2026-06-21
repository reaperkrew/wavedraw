import type { WavAudio } from "../wav/types.js";
import type { WaveformChannel } from "./types.js";
export interface ChannelSelection {
    channel: number | "mix";
    samples: Float32Array;
}
export declare function selectChannels(audio: WavAudio, channel: WaveformChannel): ChannelSelection[];
export declare function selectAllChannels(audio: WavAudio): ChannelSelection[];
export declare function mixChannels(audio: WavAudio): ChannelSelection;
export declare function selectSingleChannel(audio: WavAudio, channel: number): Float32Array;
//# sourceMappingURL=channels.d.ts.map
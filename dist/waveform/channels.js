export function selectChannels(audio, channel) {
    if (channel === "all") {
        return selectAllChannels(audio);
    }
    if (channel === "mix") {
        return [mixChannels(audio)];
    }
    return [{ channel, samples: selectSingleChannel(audio, channel) }];
}
export function selectAllChannels(audio) {
    return audio.channels.map((samples, index) => ({ channel: index, samples }));
}
export function mixChannels(audio) {
    if (audio.channels.length === 1) {
        return { channel: 0, samples: audio.channels[0] };
    }
    const mixed = new Float32Array(audio.frames);
    for (let frame = 0; frame < audio.frames; frame += 1) {
        let sum = 0;
        for (const samples of audio.channels) {
            sum += samples[frame] ?? 0;
        }
        mixed[frame] = sum / audio.channels.length;
    }
    return { channel: "mix", samples: mixed };
}
export function selectSingleChannel(audio, channel) {
    if (!Number.isInteger(channel) || channel < 0 || channel >= audio.channels.length) {
        throw new Error(`channel must be "mix", "all", or an integer from 0 to ${audio.channels.length - 1}`);
    }
    return audio.channels[channel];
}

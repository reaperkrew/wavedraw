export function createMelFilterbank(options) {
    const melPoints = buildMelPoints(options);
    const bins = Math.floor(options.fftSize / 2) + 1;
    return Array.from({ length: options.melBands }, (_, band) => buildFilterWeights(options, melPoints, bins, band));
}
export function buildMelPoints(options) {
    const melMin = hertzToMel(options.minFrequency);
    const melMax = hertzToMel(options.maxFrequency);
    return Array.from({ length: options.melBands + 2 }, (_, index) => {
        const ratio = index / (options.melBands + 1);
        return melToHertz(melMin + (melMax - melMin) * ratio);
    });
}
export function buildFilterWeights(options, melPoints, bins, band) {
    const lower = melPoints[band];
    const center = melPoints[band + 1];
    const upper = melPoints[band + 2];
    const weights = new Array(bins).fill(0);
    for (let bin = 0; bin < bins; bin += 1) {
        const frequency = (bin * options.sampleRate) / options.fftSize;
        weights[bin] = computeFilterWeight(frequency, lower, center, upper);
    }
    const sum = weights.reduce((total, weight) => total + weight, 0);
    return sum > 0 ? weights.map((weight) => weight / sum) : weights;
}
export function computeFilterWeight(frequency, lower, center, upper) {
    if (frequency >= lower && frequency <= center && center > lower) {
        return (frequency - lower) / (center - lower);
    }
    if (frequency > center && frequency <= upper && upper > center) {
        return (upper - frequency) / (upper - center);
    }
    return 0;
}
export function hertzToMel(value) {
    return 2595 * Math.log10(1 + value / 700);
}
export function melToHertz(value) {
    return 700 * (10 ** (value / 2595) - 1);
}

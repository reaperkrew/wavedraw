/*
 *   wavedraw::computeDft() example
 *   Calculate the discrete fourier transform of a finite input signal
 *   Parameters: inputSignal (Array) - A finite 2 dimensional array of numbers
 *   Returns: (Array of Objects) - Each object has real and imag (imaginary) values
 */
const wavedraw = require('../lib/wavedraw');
const inputSignal = [1.00, 0.62, -0.07, -0.87, -1.51, -1.81, -1.70, -1.24, -0.64, -0.15, 0.05, -0.10];
const dftValues = wavedraw.computeDft(inputSignal);
for (let i = 0; i < dftValues.length; i += 1) {
	const operator = dftValues[i].imag <= 0 ? '+' : '-';
	const imaginary = operator === '+' ? dftValues[i].imag.toFixed(3) * -1 : dftValues[i].imag.toFixed(3);
	console.log(`Signal index: ${i}, signal value: ${inputSignal[i]}, result: ${dftValues[i].real.toFixed(3)} ${operator} ${imaginary}j`);
}
console.log(dftValues);
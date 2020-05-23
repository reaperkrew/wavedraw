var expect = require('expect.js');

const wavedraw = require('../lib/wavedraw');

describe('Discrete Fourier Transformation Calculation', function () {
  it('should correctly calculate the discrete fourier transform for a known fixed-sized input signal', function () {
    const inputSignal = [1.00, 0.62, -0.07, -0.87, -1.51, -1.81, -1.70, -1.24, -0.64, -0.15, 0.05, -0.10];
    const expectedDftValues = [ { real: -6.42, imag: 0 },
                                { real: 6.856710691510447, imag: -1.5023651497465949 },
                                { real: 0.13999999999999937, imag: 1.7666918237202551 },
                                { real: 0.5699999999999985, imag: 0.8700000000000001 },
                                { real: 0.6299999999999987, imag: 0.4676537180435962 },
                                { real: 0.6732893084895539, imag: 0.21236514974658902 },
                                { real: 0.68, imag: -3.8913966066347674e-15 },
                                { real: 0.6732893084895528, imag: -0.21236514974659604 },
                                { real: 0.6300000000000026, imag: -0.46765371804359873 },
                                { real: 0.5699999999999982, imag: -0.8699999999999999 },
                                { real: 0.14000000000000148, imag: -1.766691823720249 },
                                { real: 6.856710691510442, imag: 1.5023651497465975 }];

    const dftValues = wavedraw.computeDft(inputSignal);
    expect(dftValues).to.be.an(Array);
    expect(dftValues).to.have.length(12);
    for (let i = 0; i < inputSignal.length; i += 1) {
      expect(dftValues[i]).to.only.have.keys(['real', 'imag']);
      expect(dftValues[i].real.toFixed(3)).to.eql(expectedDftValues[i].real.toFixed(3));
      expect(dftValues[i].imag.toFixed(3)).to.eql(expectedDftValues[i].imag.toFixed(3));
    }

  });
});

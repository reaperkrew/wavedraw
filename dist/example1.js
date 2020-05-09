const wavedraw = require('../lib/wavedraw');

const wd = new wavedraw('test.wav');
const options = {
  width: 1200,
  height: 400,
  rms: true,
  maximums: true,
  average: false,
  start: 'START',
  end: 'END',
  colors: {
    maximums: '#0000ff',
    rms: '#659df7',
    background: '#ffffff'
  },
  ceiling: 80000,
  filename: 'example1.png'
};

wd.drawWave(options);

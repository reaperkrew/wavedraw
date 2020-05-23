const wavedraw = require('../lib/wavedraw');

const wd = new wavedraw('test.wav');
const options = {
  width: 180,
  height: 100,
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
  ceiling: 30000,
  filename: 'example1.png'
};

wd.drawWave(options);

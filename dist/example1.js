const wavedraw = require('wavedraw');

const wd = new wavedraw('test.wav');
const options = {
  width: 600,
  height: 300,
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
  filename: 'example1.png'
};

wd.drawWave(options);

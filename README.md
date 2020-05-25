# wavedraw for node.js

This library currently supports only mono single channel wave files. I haven't tried it with 8 bit wave. I suggest using 16 bit, mono at 44100.

## Installation

`npm install wavedraw`


## Usage

```javascript
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

wd.drawWave(options);  // outputs wave drawing to example1.png
```
![alt text](https://usaluyin.s3.amazonaws.com/public/example1.png)

### Todo
- [] More unit tests
- [] Ability to draw mel spectrograms

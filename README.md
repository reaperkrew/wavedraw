# wavedraw for node.js

This library currently supports only mono single channel wave files. I haven't tried it with 8 bit wave. I suggest using 16 bit, mono at 44100.

## Installation

`npm install wavedraw`


## Usage

```javascript
const wavedraw = require('wavedraw');

let wd = new wavedraw('test.wav');
let options = {
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

wd.drawWave(options).then(() => {
  process.exit(0);
});
```

(https://github.com/reaperkrew/wavedraw/blob/master/dist/example1.png)

### Todo
* More unit tests
* Support for multi channel
* Better documentation
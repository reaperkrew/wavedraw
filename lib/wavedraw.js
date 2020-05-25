const fs = require('fs');
const util = require('util');
const PImage = require('pureimage');

const DATA_START = 44;

class wavedraw {
  constructor(path) {
    if (!path) {
      throw new Error('path to wave file must be included in constructor');
    }
    this.path = path;
    this.read = util.promisify(fs.read);
    this.close = util.promisify(fs.close);
    this.header = null;
  }

  async getHeader() {
    if (this.header) {
      return this.header;
    }
    const buf = Buffer.alloc(44);
    let file;
    try { file = fs.openSync(this.path, 'r'); } catch (err) { throw new Error(`Cannot open file of path ${this.path}`); }

    const result = await this.read(file, buf, 0, 44, 0);
    this.header = {
      chunkId: wavedraw.getStringBE(result.buffer.slice(0, 4)),
      chunkSize: result.buffer.readInt32LE(4),
      format: wavedraw.getStringBE(result.buffer.slice(8, 12)),
      subChunk1ID: wavedraw.getStringBE(result.buffer.slice(12, 16)),
      subChunk1Size: result.buffer.readInt32LE(16),
      audioFormat: result.buffer.readUInt16LE(20),
      numChannels: result.buffer.readUInt16LE(22),
      sampleRate: result.buffer.readInt32LE(24),
      byteRate: result.buffer.readInt32LE(28),
      blockAlign: result.buffer.readUInt16LE(32),
      bitsPerSample: result.buffer.readUInt16LE(34),
      subChunk2ID: wavedraw.getStringBE(result.buffer.slice(36, 40)),
      subChunk2Size: result.buffer.readInt32LE(40),
    };
    await this.close(file);
    this.header.length = this.getFileLength();
    return this.header;
  }

  static getStringBE(bytes) {
    const arr = Array.prototype.slice.call(bytes, 0);
    let result = '';
    for (let i = 0; i < arr.length; i += 1) {
      result += String.fromCharCode(arr[i]);
    }
    return result;
  }

  getFileLength() {
    if (!this.header) {
      throw new Error('Cannot get file length until header is loaded');
    }

    const numSamples = parseInt(this.header.subChunk2Size / this.header.blockAlign, 10);
    let seconds = parseInt(numSamples / this.header.sampleRate, 10);
    const minutes = parseInt(seconds / 60, 10);
    const hours = parseInt(minutes / 60, 10);
    seconds %= 60;
    return {
      seconds,
      minutes,
      hours,
    };
  }

  getOffsetInfo(start, end, width) {
    let startPos;
    let endPos;

    if (start === undefined || start === 'START') {
      startPos = DATA_START;
    } else {
      startPos = this.getOffset(start) + DATA_START;
    }

    if (end === undefined || end === 'END') {
      endPos = this.header.subChunk2Size;
    } else {
      endPos = this.getOffset(end);
    }

    const blockSize = parseInt(((endPos - startPos) / this.header.blockAlign) / width, 10);
    const chunkSize = parseInt(blockSize * this.header.blockAlign, 10);
    return {
      startPos,
      endPos,
      blockSize,
      chunkSize,
    };
  }

  getOffset(time) {
    const [hours, minutes, seconds] = time.split(':').map((unit) => parseInt(unit, 10));
    if (hours > this.header.length.hours) {
      throw new Error('Length in hours is too long');
    } else if (minutes > this.header.length.minutes) {
      throw new Error('Length in minutes is too long');
    } else if (seconds > this.header.length.seconds && minutes === this.header.length.minutes) {
      throw new Error('Length in seconds is too long');
    }
    let adjustedSeconds = seconds + hours * 60 * 60;
    adjustedSeconds += minutes * 60;
    return parseInt(adjustedSeconds * this.header.sampleRate * this.header.blockAlign, 10);
  }

  static validateDrawWaveOptions(options) {
    if (!(options.width && options.height)) {
      throw new Error('drawWave() required parameters: width, height');
    }
  }

  async drawWave(options) {
    wavedraw.validateDrawWaveOptions(options);
    if (!this.header)
      await this.getHeader();
    if (this.header.bitsPerSample !== 16) {
      throw new Error('drawWave() currently only supports 16 bit audio files!');
    }
    const samples = await this.getSamples(options);
    const img1 = PImage.make(options.width, options.height);
    const ctx = img1.getContext('2d');
    const ceiling = 32767;

    if (options.colors && options.colors.background) {
      ctx.fillStyle = options.colors.background;
      ctx.fillRect(0, 0, options.width, options.height);
    }

    for (let i = 0; i < options.width; i += 1) {
      if (options.maximums) {
        ctx.strokeStyle = options.colors && options.colors.maximums ? options.colors.maximums : '#0000ff';

        ctx.drawLine({
          start: {
            x: i,
            y: Number.parseInt(options.height / 2, 10),
          },
          end: {
            x: i,
            y: Number.parseInt((options.height / 2)
              - (((options.height / 2)
                / ceiling)
                * samples[i].posMax), 10),
          },
        });        

        ctx.drawLine({
          start: {
            x: i,
            y: Number.parseInt(options.height / 2),
          },
          end: {
            x: i,
            y: Number.parseInt((options.height / 2)
              + -(((options.height / 2)
                / ceiling)
                * samples[i].negMax), 10),
          },
        });
      }
      if (options.rms) {
        ctx.strokeStyle = options.colors && options.colors.rms ? options.colors.rms : '#659df7';
        ctx.drawLine({
          start: {
            x: i,
            y: Number.parseInt(options.height / 2, 10),
          },
          end: {
            x: i,
            y: Number.parseInt((options.height / 2)
            - (((options.height / 2)
              / ceiling)
              * samples[i].posRms), 10),
          },
        });

        ctx.drawLine({
          start: {
            x: i,
            y: Number.parseInt(options.height / 2, 10),
          },
          end: {
            x: i,
            y: Number.parseInt((options.height / 2)
              + -(((options.height / 2)
                / ceiling)
                * samples[i].negRms), 10),
          },
        });
      }

      if (options.average) {
        ctx.strokeStyle = options.colors && options.colors.average ? options.colors.average : '#4a6ea8';
        ctx.drawLine({
          start: {
            x: i,
            y: Number.parseInt(options.height / 2, 10),
          },
          end: {
            x: i,
            y: Number.parseInt((options.height / 2)
                - (((options.height / 2)
                / ceiling)
                * samples[i].posAvg), 10),
          },
        });

        ctx.drawLine({
          start: {
            x: i,
            y: Number.parseInt(options.height / 2, 10),
          },
          end: {
            x: i,
            y: Number.parseInt((options.height / 2)
              + -(((options.height / 2)
              / ceiling)
              * samples[i].negAvg), 10),
          },
        });
      }
    }
    const filename = options.filename ? options.filename : 'wave.png';
    await PImage.encodePNGToStream(img1, fs.createWriteStream(filename));
  }

  async getSamples(options) {
    if (!options.width) {
      throw new Error('getSamples() required parameter: width');
    }
    if (!this.header) {
      await this.getHeader();
    }
    const offsetInfo = this.getOffsetInfo(options.start, options.end, options.width);
    const file = fs.openSync(this.path, 'r');
    if (!file) {
      throw new Error(`Error opening file ${this.path}`);
    }
    const samples = [];
    for (let x = 0; x < options.width; x += 1) {
      const buf = new ArrayBuffer(offsetInfo.chunkSize);
      let intView = new Int16Array(buf);
      const position = (offsetInfo.chunkSize * x) + offsetInfo.startPos;
      await this.read(file, intView, 0, offsetInfo.chunkSize, position);
      let sampleInfo = {};
      if (options.maximums)
        sampleInfo = {...wavedraw.computeMaximums(intView)};
      if (options.average)
        sampleInfo = {...sampleInfo, ...wavedraw.computeAverage(intView)};
      if (options.rms)
        sampleInfo = {...sampleInfo, ...wavedraw.computeRms(intView)};
      samples.push(sampleInfo);
    }

    await this.close(file);
    return samples;
  }

  static computeMaximums (inputSignal) {
    return {
      posMax: Math.max.apply(null, inputSignal),
      negMax: Math.min.apply(null, inputSignal),
    };
  }

  static computeRms (inputSignal) {
    const positives = inputSignal.filter(x => x >= 0);
    const posInt32 = Int32Array.from(positives);
    const posRms = posInt32.length > 0 ? Math.sqrt(posInt32.map(x => x * x).reduce((a, b) => a + b, 0) / posInt32.length) : 0;
    const negatives = inputSignal.filter(x => x < 0);
    const negInt32 = Int32Array.from(negatives);
    const negRms = negInt32.length > 0 ? -Math.sqrt(Math.abs(negInt32.map(x => x * x).reduce((a, b) => a + b, 0)) / negInt32.length) : 0;
    return {
      posRms,
      negRms,
    };
  }

  static computeAverage (inputSignal) {
    const positives = inputSignal.filter(x => x >= 0);
    const posAvg = positives.length > 0 ? positives.reduce((a, b) => a + b, 0) / positives.length : 0;
    const negatives = inputSignal.filter(x => x < 0);
    const negAvg = negatives.length > 0 ? negatives.reduce((a, b) => a + b, 0) / negatives.length : 0;
    return {
      posAvg,
      negAvg,
    };
  }

  static computeDft (inputSignal) {
    const N = inputSignal.length;
    const pi2 = Math.PI * 2.0;
    let dftValues = [];
    for (let i = 0; i < N; i += 1) {
      dftValues[i] = {
        real: 0.0,
        imag: 0.0,
      };
      for (let j = 0; j < N; j += 1) {
        dftValues[i].real += inputSignal[j] * Math.cos((pi2 * j * i) / N);
        dftValues[i].imag += inputSignal[j] * Math.sin((pi2 * j * i) / N);
      }
    }
    return dftValues;
  }
}

module.exports = wavedraw;

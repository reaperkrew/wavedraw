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
    return options.width && options.height && options.ceiling;
  }

  async drawWave(options) {
    if (!wavedraw.validateDrawWaveOptions(options)) {
      throw new Error('drawWave() required parameters: width, height, ceiling');
    }
    const samples = await this.getSamples(options);
    const img1 = PImage.make(options.width, options.height);
    const ctx = img1.getContext('2d');

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
            y: options.height / 2,
          },
          end: {
            x: i,
            y: (options.height / 2)
              - (((options.height / 2)
                / options.ceiling)
                * samples[i].posMax),
          },
        });

        ctx.drawLine({
          start: {
            x: i,
            y: options.height / 2,
          },
          end: {
            x: i,
            y: (options.height / 2)
              + -(((options.height / 2)
                / options.ceiling)
                * samples[i].negMax),
          },
        });
      }
      if (options.rms) {
        ctx.strokeStyle = options.colors && options.colors.rms ? options.colors.rms : '#659df7';
        ctx.drawLine({
          start: {
            x: i,
            y: options.height / 2,
          },
          end: {
            x: i,
            y: (options.height / 2)
            - (((options.height / 2)
              / options.ceiling)
              * samples[i].posRms),
          },
        });

        ctx.drawLine({
          start: {
            x: i,
            y: options.height / 2,
          },
          end: {
            x: i,
            y: (options.height / 2)
              + -(((options.height / 2)
                / options.ceiling)
                * samples[i].negRms),
          },
        });
      }

      if (options.average) {
        ctx.strokeStyle = options.colors && options.colors.average ? options.colors.average : '#4a6ea8';
        ctx.drawLine({
          start: {
            x: i,
            y: options.height / 2,
          },
          end: {
            x: i,
            y: (options.height / 2)
                - (((options.height / 2)
                / options.ceiling)
                * samples[i].posAvg),
          },
        });

        ctx.drawLine({
          start: {
            x: i,
            y: options.height / 2,
          },
          end: {
            x: i,
            y: (options.height / 2)
              + -(((options.height / 2)
              / options.ceiling)
              * samples[i].negAvg),
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
    const values = [];
    const min = -100000;
    const max = 100000;
    for (let x = 0; x < options.width; x += 1) {
      const buf = Buffer.alloc(offsetInfo.chunkSize);
      const position = (offsetInfo.chunkSize * x) + offsetInfo.startPos;
      const result = await this.read(file, buf, 0, offsetInfo.chunkSize, position);
      let negCount = 0;
      let posCount = 0;
      let negAvg = 0;
      let posAvg = 0;
      let posRms = 0;
      let negRms = 0;
      let posMax = 0;
      let negMax = 0;

      for (let i = 0; i < (offsetInfo.chunkSize); i += this.header.blockAlign) {
        let sample = result.buffer.readInt16LE(i);

        if (sample < min) {
          sample = min;
        } else if (sample > max) {
          sample = max;
        }

        if (sample < 0) {
          if (options.average) {
            negAvg += sample;
          }
          if (options.rms) {
            posRms += sample * sample;
          }
          if (options.maximums) {
            if (sample < negMax) {
              negMax = sample;
            }
          }
          negCount += 1;
        } else {
          if (options.average) {
            posAvg += sample;
          }
          if (options.rms) {
            negRms += sample * sample;
          }
          if (options.maximums) {
            if (sample > posMax) {
              posMax = sample;
            }
          }
          posCount += 1;
        }
      }
      const samples = {};
      if (options.average) {
        samples.posAvg = posAvg / posCount;
        samples.negAvg = negAvg / negCount;
      }

      if (options.rms) {
        samples.posRms = Math.sqrt(posRms / posCount);
        samples.negRms = -(Math.sqrt(negRms / negCount));
      }

      if (options.maximums) {
        samples.posMax = posMax;
        samples.negMax = negMax;
      }

      values.push(samples);
    }

    await this.close(file);
    return values;
  }
}

module.exports = wavedraw;

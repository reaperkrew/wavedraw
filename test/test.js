var expect = require('expect.js');

const wavedraw = require('../lib/wavedraw');

describe('Initialization', function() {
  describe('Constructor', function() {
    it('should throw an error if wave file path is not sent to the constructor', function() {

      expect(() => {
        let wd = new wavedraw();
      })
      .to.throwError();

    });
  });
});

describe('Options', function() {
  describe('width', function() {
    it('should throw an error if width is not included in options when calling getSamples', function() {
          let wd = new wavedraw(__dirname + '/../dist/test.wav');
          let options = {};
          wd.getSamples(options).then().catch((err) => {
            expect(err).to.be.an(Error);
            expect(err.message).to.equal('getSamples() required parameter: width');
          });
    });
  });
});


describe('Options', function() {
  describe('width, height, ceiling', function() {
    it('should throw an error if width, height, and ceiling is not included in options when calling drawWave', function() {
          let wd = new wavedraw(__dirname + '/../dist/test.wav');
          let options = {};
          wd.drawWave(options).then().catch((err) => {
            expect(err).to.be.an(Error);
            expect(err.message).to.equal('drawWave() required parameters: width, height, ceiling');
          });
    });
  });
});


describe('Options', function() {
  describe('length sanity checks', function() {

    it('should throw an error if start time in minutes is greater than actual file length when calling getOffset()', function() {
          let wd = new wavedraw(__dirname + '/../dist/test.wav');
          let options = {
            width: 1200,
            height: 400,
            ceiling: 80000,
            start: '00:07:00'
          };
          wd.getHeader().then( function (header)  {
            try{wd.getOffset(options.start)}
            catch(err) {
              expect(err).to.be.an(Error);
              expect(err.message).to.equal('Length in minutes is too long');
            }
          });

    });

    it('should throw an error if start time in seconds is greater than actual file length when calling getOffset()', function() {
          let wd = new wavedraw(__dirname + '/../dist/test.wav');
          let options = {
            width: 1200,
            height: 400,
            ceiling: 80000,
            start: '00:06:42'
          };
          wd.getHeader().then( function (header)  {
            try{wd.getOffset(options.start)}
            catch(err) {
              expect(err).to.be.an(Error);
              expect(err.message).to.equal('Length in seconds is too long');
            }
          });

    });

  });
});

var expect = require('expect.js');
const wavedraw = require('../lib/wavedraw');

describe('Initialization', function () {
  describe('Constructor', function() {
    it('should throw an error if wave file path is not sent to the constructor', function () {

      expect(() => {
        let wd = new wavedraw();
      })
      .to.throwError();

    });
  });
});

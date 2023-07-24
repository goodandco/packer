import * as assert from 'assert';
import Packer from '../../src/packer';
// @ts-ignore
import * as fixtures from './fixtures/fixtures.json';
describe('Packer Tests', () => {
  // arrange
  for (const { name, filePath, expected } of fixtures) {
    it(name, () => {
      // act
      const actual = Packer.pack(__dirname + '/fixtures/' + filePath);
      // assert
      assert.equal(actual, expected);
    });
  }

});


import * as assert from 'assert';
import APIException from '../../src/errors/api-exception';
// @ts-ignore
import * as fixtures from './fixtures/fixtures.json';
import Packer from '../../src/packer';

describe('Packer Tests', () => {
  // arrange
  for (const { name, filePath, expected, isThrowingError = false } of fixtures) {
    it(name, () => {
      const absoluteFilePath = __dirname + '/fixtures/' + filePath;
      const test = () => Packer.pack(absoluteFilePath);
      if (isThrowingError) {
        // act + assert
        assert.throws(test, APIException)
      } else {
        // act
        const actual = test();
        // assert
        assert.equal(actual, expected);
      }
    });
  }

});


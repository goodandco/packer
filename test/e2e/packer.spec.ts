import * as assert from 'assert';
import * as fixtures from './fixtures/fixtures.json';
import Packer, { APIException } from '../../src';

describe('Packer Tests', () => {
  // arrange
  for (const { name, filePath, expected, isThrowingError = false } of fixtures) {
    it(name, () => {
      const absoluteFilePath = __dirname + '/fixtures/' + filePath;
      const test = () => Packer.pack(absoluteFilePath);
      if (isThrowingError) {
        // act + assert
        assert.throws(test, APIException);
      } else {
        // act
        const actual = test();
        // assert
        assert.equal(actual, expected);
      }
    });
  }

});


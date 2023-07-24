import * as assert from 'assert';
import Packer from '../../src/client/packer';

describe('Packer Tests', () => {
  it('should match fixtures expectation', () => {
    // arrange
    const expected = '';
    // act
    const actual = Packer.pack('/somePath');
    // assert
    assert.equal(actual, expected);
  });
});


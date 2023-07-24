import BasePacker from './client/base-packer';
import LocalFileDataProvider from './client/local-file-data-provider';
import LocalFilePackCalculator from './client/local-file-pack-calculator';
import LocalFileDataConvertor from './client/local-file-data-convertor';

export default class Packer {
  static pack(filePath: string): string {
    return new BasePacker(
      new LocalFileDataProvider(),
      new LocalFilePackCalculator(),
      new LocalFileDataConvertor(),
    ).pack(filePath);
  }
}

import {
  BasePacker,
  LocalFileDataConvertor,
  LocalFileDataProvider,
  LocalFilePackCalculator,
} from './client';

export class Packer {
  static pack(filePath: string): string {
    return new BasePacker(
      new LocalFileDataProvider(),
      new LocalFilePackCalculator(),
      new LocalFileDataConvertor(),
    ).pack(filePath);
  }
}

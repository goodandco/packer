import {
  BasePacker,
  DefaultPackDataConvertor,
  DefaultPackCalculator,
  LocalFileDataProvider,
} from './client';
import { HashMapAlgorithm } from './algorithm/hash-map-algorithm';

export class Packer {
  static pack(filePath: string): string {
    return new BasePacker<string, string>(
      new LocalFileDataProvider(),
      new DefaultPackCalculator(new HashMapAlgorithm()),
      new DefaultPackDataConvertor(),
    ).pack(filePath);
  }
}

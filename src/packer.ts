import {
  BasePacker,
  DefaultPackDataConvertor,
  DefaultPackCalculator,
  LocalFileDataProvider,
} from './client';
import { MapReduce } from './algorithm/map-reduce';

export class Packer {
  static pack(filePath: string): string {
    return new BasePacker(
      new LocalFileDataProvider(),
      new DefaultPackCalculator(new MapReduce()),
      new DefaultPackDataConvertor(),
    ).pack(filePath);
  }
}

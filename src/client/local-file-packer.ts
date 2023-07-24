import { IPacker } from '../interfaces';

export default class LocalFilePacker implements IPacker {
  pack(fileName: string): string {
    return '';
  }
}

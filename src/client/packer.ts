import LocalFilePacker from './local-file-packer';

export default class Packer {
  static pack(filePath: string): string {
    return new LocalFilePacker().pack(filePath);
  }
}

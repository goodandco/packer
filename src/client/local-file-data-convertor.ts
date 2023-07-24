import { IPackDataConvertor } from '../interfaces';
import { TPackerResult } from '../types';

export default class LocalFileDataConvertor
  implements IPackDataConvertor<string>
{
  convert(result: TPackerResult): string {
    return result.reduce((res, rowData, i) => {
      const prefix = i !== 0 ? `\n` : '';
      return `${res}${prefix}${rowData.length ? rowData.join(',') : '-'}`;
    }, '');
  }
}

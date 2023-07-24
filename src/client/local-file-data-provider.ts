import { IDataProvider } from '../interfaces';
import { TInputData } from '../types';
import { readFileSync } from 'fs';

export default class LocalFileDataProvider implements IDataProvider<string> {
  getData(filePath: string): TInputData {
    const stringData = this.readFromFile(filePath);
    return this.convertInputData(stringData);
  }

  private readFromFile(filePath: string): string {
    return readFileSync(filePath, { encoding: 'utf8' });
  }

  private convertInputData(stringData: string): TInputData {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return stringData.split('\n').map((row) =>
      row.split(':').map((rowItems, i) => {
        if (i === 0) {
          return parseInt(rowItems) as number;
        } else {
          return rowItems
            .replaceAll(') (', '|')
            .replaceAll(')(', '|')
            .replaceAll('(', '')
            .replaceAll(')', '')
            .split('|')
            .map((itemsStr) => this.mapItem(itemsStr));
        }
      }),
    );
  }

  private mapItem(itemsStr: string): [number, number, number] {
    const [id, weight, price] = itemsStr.split(',');

    return [parseInt(id), parseInt(weight), this.convertPrice(price)];
  }

  private convertPrice(priceStr: string): number {
    return parseInt(priceStr.replace('€', ''));
  }
}

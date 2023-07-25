import { IDataProvider } from '../interfaces';
import { TInputData, TInputDataRow, TInputDataRowItem } from '../types';
import { readFileSync, existsSync } from 'fs';
import { APIException } from '../errors';

export class LocalFileDataProvider implements IDataProvider<string> {
  getData(filePath: string): TInputData {
    const stringData = this.readFromFile(filePath);
    return this.convertInputData(stringData);
  }

  private readFromFile(filePath: string): string {
    if (!existsSync(filePath)) {
      throw new APIException(`File: ${filePath} does not exist.`);
    }
    return readFileSync(filePath, { encoding: 'utf8' });
  }

  private convertInputData(stringData: string): TInputData {
    return stringData.split('\n').map(
      (row) =>
        row
          .split(':')
          .slice(0, 2)
          .map((rowItems, i) =>
            i === 0
              ? (parseInt(rowItems) as number)
              : (rowItems
                  .replaceAll(/ /g, '')
                  .replaceAll(')(', '|')
                  .replaceAll(/[()]/g, '')
                  .split('|')
                  .map((itemsStr) =>
                    this.mapItem(itemsStr),
                  ) as Array<TInputDataRowItem>),
          ) as TInputDataRow,
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

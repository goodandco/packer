import { TInputData, TInputDataRow, TPackerResult } from '../types';
import {
  MAX_ITEM_WEIGHT,
  MAX_ITEMS_LENGTH,
  MAX_PACK_WEIGHT,
} from '../constants';
import APIException from '../errors/api-exception';
import { IPackCalculator } from '../interfaces';

export default class LocalFilePackCalculator implements IPackCalculator {
  calculate(data: TInputData): TPackerResult {
    return data.map((row: TInputDataRow) => this.calculateRow(row));
  }

  calculateRow(rowData: TInputDataRow): Array<number> {
    const [maxWeight, items] = rowData;

    if (maxWeight > MAX_PACK_WEIGHT) {
      throw new APIException(
        `Max weight for a pack should be not more than ${MAX_PACK_WEIGHT}. Your value is: ${maxWeight}.`,
      );
    }

    if (items.length > MAX_ITEMS_LENGTH) {
      throw new APIException(
        `Max items for a pack should be not more than ${MAX_ITEMS_LENGTH}. Your value is: ${items.length}.`,
      );
    }
    const sorted = items
      .filter(([, itemWeight]) => {
        if (itemWeight > MAX_ITEM_WEIGHT) {
          throw new APIException(
            `Max weight for the item should be not more than ${MAX_ITEM_WEIGHT}. Your value is: ${itemWeight}.`,
          );
        }
        return itemWeight <= maxWeight;
      })
      .sort(([, aW], [, bW]) => {
        if (aW < bW) return -1;
        if (aW > bW) return 1;
        return 0;
      });

    if (!sorted.length) {
      return [];
    }
    const [, minItemWeight] = sorted[0];

    const result = sorted
      .reduce((acc, [id, weight, price]) => {
        if (acc.length === 0 || weight + minItemWeight > maxWeight) {
          acc.push({
            items: [{ id, weight, price }],
            sum: weight,
          });
        } else {
          const accLen = acc.length;
          for (let j = 0; j < accLen; j++) {
            const { items, sum } = acc[j];
            const diff = sum + weight - maxWeight;
            if (diff <= 0) {
              acc.push({
                items: [...items, { id, weight, price }],
                sum: sum + weight,
              });
            } else {
              const foundToReplace = items.find(
                (item) => diff - item.weight < 0,
              );

              if (foundToReplace) {
                acc.push({
                  items: [
                    ...items.filter((item) => item.id !== foundToReplace.id),
                    { id, weight, price },
                  ],
                  sum: sum - foundToReplace.weight + weight,
                });
              }
            }
          }
        }
        return acc;
      }, [])
      .map(({ items }) => {
        return items.reduce(
          (r, item) => {
            r.ids.push(item.id);
            r.sum += item.price;
            return r;
          },
          { ids: [], sum: 0 },
        );
      })
      .reduce(
        (
          res,
          item: {
            ids: number[];
            sum: number;
          },
        ) => (res === null || item.sum > res.sum ? item : res),
        null,
      );

    return result ? result.ids.sort() : [];
  }
}

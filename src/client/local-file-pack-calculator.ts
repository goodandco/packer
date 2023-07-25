import { TInputData, TInputDataRow, TPackerResult } from '../types';
import {
  MAX_ITEM_WEIGHT,
  MAX_ITEMS_LENGTH,
  MAX_PACK_WEIGHT,
} from '../constants';
import { IPackCalculator } from '../interfaces';
import { APIException } from '../errors';

type TSumVariant = { ids: number[]; sum: number };
type TCombinationVariant = {
  items: { id: number; weight: number; price: number }[];
  sum: number;
};

export class LocalFilePackCalculator implements IPackCalculator {
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
      // filtering all the items with weight less then max weight for package
      // and validating MAX_ITEM_WEIGHT
      .filter(([, itemWeight]) => {
        if (itemWeight > MAX_ITEM_WEIGHT) {
          throw new APIException(
            `Max weight for the item should be not more than ${MAX_ITEM_WEIGHT}. Your value is: ${itemWeight}.`,
          );
        }
        return itemWeight <= maxWeight;
      })
      // necessary to asc sorting to be sure that next element has bigger weight
      .sort(([, aWeight], [, bWeight]) => {
        if (aWeight < bWeight) return -1;
        if (aWeight > bWeight) return 1;
        return 0;
      });

    if (!sorted.length) {
      return [];
    }
    const [, minItemWeight] = sorted[0];

    const result = sorted
      // prepare list of all possible combinations: Array<TCombinationVariant>
      .reduce((acc, [id, weight, price]) => {
        if (acc.length === 0 || weight + minItemWeight > maxWeight) {
          acc.push({
            items: [{ id, weight, price }],
            sum: weight,
          });
        } else {
          const accLen = acc.length;
          for (let j = 0; j < accLen; j++) {
            const { items, sum } = acc[j] as TCombinationVariant;
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
      // prepare datastructure for filtering by price:
      // from Array<TCombinationVariant> to Array<TSumVariant>
      .map(({ items }) =>
        items.reduce(
          (r, item) => {
            r.ids.push(item.id);
            r.sum += item.price;
            return r;
          },
          { ids: [], sum: 0 },
        ),
      )
      // filtering prepared list of Array<TSumVariant>
      // and choosing best TSumVariant
      .reduce(
        (res, item: TSumVariant) =>
          res === null || item.sum > res.sum ? item : res,
        null,
      );

    return result ? result.ids.sort() : [];
  }
}

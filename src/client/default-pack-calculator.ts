import { TInputData, TInputDataRow, TPackerResult } from '../types';
import {
  MAX_ITEM_WEIGHT,
  MAX_ITEM_COST,
  MAX_ITEMS_LENGTH,
  MAX_PACK_WEIGHT,
} from '../constants';
import { IPackCalculator, IRowCalculateAlgorithm } from '../interfaces';
import { APIException } from '../errors';

export class DefaultPackCalculator implements IPackCalculator {
  constructor(
    protected readonly rowCalculateAlgorithm: IRowCalculateAlgorithm,
  ) {}
  calculate(data: TInputData): TPackerResult {
    return data.map((rowData: TInputDataRow) => {
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
      // filtering all the items with weight less then max weight for package
      // and validating MAX_ITEM_WEIGHT
      const preparedItems = items.filter(([, itemWeight, itemCost]) => {
        if (itemWeight > MAX_ITEM_WEIGHT) {
          throw new APIException(
            `Max weight for the item should be not more than ${MAX_ITEM_WEIGHT}. Your value is: ${itemWeight}.`,
          );
        }
        if (itemCost > MAX_ITEM_COST) {
          throw new APIException(
            `Max cost for the item should be not more than ${MAX_ITEM_COST}. Your value is: ${itemCost}.`,
          );
        }

        return itemWeight <= maxWeight;
      });

      if (!preparedItems.length) return [];

      return this.rowCalculateAlgorithm.run(maxWeight, preparedItems);
    });
  }
}

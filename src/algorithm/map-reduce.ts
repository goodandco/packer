import { TCombinationVariant, TInputDataRowItem, TSumVariant } from '../types';
import { IRowCalculateAlgorithm } from '../interfaces';
import { MAX_ITEM_COST, MAX_ITEM_WEIGHT } from '../constants';
import { APIException } from '../errors';

export class MapReduce implements IRowCalculateAlgorithm {
  run(maxWeight: number, items: Array<TInputDataRowItem>): Array<number> {
    // filtering all the items with weight less than max weight for package
    // and validating MAX_ITEM_WEIGHT & MAX_ITEM_COST
    const filteredItems = items.filter(([, itemWeight, itemCost]) => {
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

    if (!filteredItems.length) return [];

    // necessary to asc sorting to be sure that next element has bigger weight
    const sorted = filteredItems.sort(([, aWeight], [, bWeight]) => {
      if (aWeight < bWeight) return -1;
      if (aWeight > bWeight) return 1;
      return 0;
    });
    const [, minItemWeight] = sorted[0];

    const result = sorted
      // prepare list of all possible combinations: Array<TCombinationVariant>
      .reduce((acc, [id, weight, price]) => {
        // if there is very begining of calculation then we add item to the first subset
        // because in previous step we filtered the data and there is no weight more then maxWeight
        // also if there is no way to add even item with minimal weight to curernt items' weight
        // and be in range of maxWeight, then we also create subset from only one current item
        if (acc.length === 0 || weight + minItemWeight > maxWeight) {
          acc.push({
            items: [{ id, weight, price }],
            sum: weight,
          });
        } else {
          const accLen = acc.length;
          // replacement method
          for (let j = 0; j < accLen; j++) {
            const { items, sum } = acc[j] as TCombinationVariant;
            // diff shows the an amount of weight which could be added after we add
            // current weight to subarray's weight sum
            const diff = sum + weight - maxWeight;
            // if it less then zero it means we are able to add new subset
            // which included acc[j] subset + new one
            if (diff <= 0) {
              acc.push({
                items: [...items, { id, weight, price }],
                sum: sum + weight,
              });
            } else {
              // here we're going to check if we have some elements which we
              // could replace with our current item and be in maxWeight range
              const foundToReplaceList = items.filter(
                (item) => diff - item.weight <= 0,
              );

              for (const foundToReplace of foundToReplaceList) {
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
      .map(({ items, sum }) => {
        return items.reduce(
          (r, item) => {
            r.ids.push(item.id);
            r.sum += item.price;
            return r;
          },
          { ids: [], sum: 0, weightSum: sum },
        );
      })
      // filtering prepared list of Array<TSumVariant>
      // and choosing best TSumVariant
      .reduce(
        (res, item: TSumVariant) =>
          res === null ||
          item.sum > res.sum ||
          (item.sum === res.sum && item.weightSum < res.weightSum)
            ? item
            : res,
        null,
      ) as TSumVariant | null;

    return result ? result.ids.sort() : [];
  }
}

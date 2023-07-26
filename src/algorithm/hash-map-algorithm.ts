import {
  TCombinationVariant,
  TCombinationVariantItem,
  TInputDataRowItem,
  TSumVariant,
} from '../types';
import { IRowCalculateAlgorithm } from '../interfaces';
import { MAX_ITEM_COST, MAX_ITEM_WEIGHT } from '../constants';
import { APIException } from '../errors';

type TCombinationMap = Record<string, TCombinationVariant>;
const generateNewKey = (items: Array<TCombinationVariantItem>) =>
  items
    .map(({ id }) => id)
    .sort()
    .join('-');

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
    const combMap: TCombinationMap = sorted
      // preparing of all possible combinations: TCombinationMap
      .reduce((map, [id, weight, price]) => {
        const keys = Object.keys(map);
        if (
          // if there is very beginning of calculation then we add item to the first subset
          // because in previous step we filtered the data and there is no weight more then maxWeight
          keys.length === 0 ||
          // also if there is no way to add even item with minimal weight to current items' weight
          // and be in range of maxWeight, then we also create subset from only one current item
          weight + minItemWeight > maxWeight
        ) {
          map[id] = {
            items: [{ id, weight, price }],
            sum: weight,
          };
        } else {
          // calculating new subset variant
          // the key is id-based string joined with "-", like "1-2-3"
          for (const key of keys) {
            const { items, sum } = map[key] as TCombinationVariant;
            // diff shows the an amount of weight which could be added after we add
            // current weight to sub-array's weight sum
            const diff = sum + weight - maxWeight;
            // if it less then zero it means we are able to add new subset
            // which included to key's subset + new one
            if (diff <= 0) {
              const newItems = [...items, { id, weight, price }];
              const newKey = generateNewKey(newItems);
              map[newKey] = {
                items: newItems,
                sum: sum + weight,
              };
            } else {
              // here we're going to check if we have some elements which we
              // could replace with our current item and be in maxWeight range
              const foundToReplaceList = items.filter(
                (item) => item.id !== id && diff - item.weight <= 0,
              );

              for (const foundToReplace of foundToReplaceList) {
                const newItems = [
                  ...items.filter((item) => item.id !== foundToReplace.id),
                  { id, weight, price },
                ];
                const newKey = generateNewKey(newItems);

                if (map[newKey] === undefined) {
                  map[newKey] = {
                    items: newItems,
                    sum: sum - foundToReplace.weight + weight,
                  };
                }
              }
            }
          }
        }
        return map;
      }, {});

    // prepare datastructure for filtering by price:
    // eject items from each key of the TCombinationMap
    // and convert into flat Array<TSumVariant>
    const result = Object.keys(combMap)
      .map((key) => {
        const { items, sum } = combMap[key];
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

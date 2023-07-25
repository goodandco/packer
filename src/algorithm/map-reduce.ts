import { TCombinationVariant, TInputDataRowItem, TSumVariant } from '../types';
import { IRowCalculateAlgorithm } from '../interfaces';

export class MapReduce implements IRowCalculateAlgorithm {
  run(maxWeight: number, items: Array<TInputDataRowItem>): Array<number> {
    // necessary to asc sorting to be sure that next element has bigger weight
    const sorted = items.sort(([, aWeight], [, bWeight]) => {
      if (aWeight < bWeight) return -1;
      if (aWeight > bWeight) return 1;
      return 0;
    });
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
                (item) => diff - item.weight <= 0,
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

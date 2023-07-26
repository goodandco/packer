export type TPackerResult = Array<Array<number>>;
export type TInputDataRowItem = [number, number, number];
export type TInputDataRow = [number, Array<TInputDataRowItem>];
export type TInputData = Array<TInputDataRow>;
export type TSumVariant = {
  ids: Array<number>;
  sum: number;
  weightSum: number;
};
export type TCombinationVariantItem = {
  id: number;
  weight: number;
  price: number;
};
export type TCombinationVariant = {
  items: Array<TCombinationVariantItem>;
  sum: number;
};
export type TCombinationMap = Record<string, TCombinationVariant>;

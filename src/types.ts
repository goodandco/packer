export type TPackerResult = Array<Array<number>>;
export type TInputDataRowItem = [number, number, number];
export type TInputDataRow = [number, Array<TInputDataRowItem>];
export type TInputData = Array<TInputDataRow>;
export type TSumVariant = { ids: number[]; sum: number; weightSum: number };
export type TCombinationVariant = {
  items: { id: number; weight: number; price: number }[];
  sum: number;
};

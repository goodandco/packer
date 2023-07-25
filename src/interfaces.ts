import { TInputData, TInputDataRowItem, TPackerResult } from './types';

export interface IPacker<S, T> {
  pack(filePath: S): T;
}

export interface IPackCalculator {
  calculate(data: TInputData): TPackerResult;
}

export interface IDataProvider<T> {
  getData(search: T): TInputData;
}

export interface IPackDataConvertor<T> {
  convert(result: TPackerResult): T;
}

export interface IRowCalculateAlgorithm {
  run(maxWeight: number, items: Array<TInputDataRowItem>): Array<number>;
}

import {
  IDataProvider,
  IPackCalculator,
  IPackDataConvertor,
  IPacker,
} from '../interfaces';

export default class BasePacker<S, T> implements IPacker<S, T> {
  constructor(
    private readonly dataProvider: IDataProvider<S>,
    private readonly packCalculator: IPackCalculator,
    private readonly packDataConvertor: IPackDataConvertor<T>,
  ) {}

  pack(params: S): T {
    const data = this.dataProvider.getData(params);
    const resultData = this.packCalculator.calculate(data);
    return this.packDataConvertor.convert(resultData);
  }
}

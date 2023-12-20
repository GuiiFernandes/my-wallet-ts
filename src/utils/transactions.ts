import { TransactionType } from '../types/Data';

export const filterAndSort = (
  array: TransactionType[],
  fn: (elem: TransactionType, index?: number, array?: TransactionType[]) => boolean,
) => array
  .filter(fn)
  .sort((a, b) => Number(b.date.split('-')[2]) - Number(a.date.split('-')[2]));

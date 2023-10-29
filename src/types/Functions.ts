import { AccountType, Banks } from './Data';

export type RemoveAccountParams = [
  AccountType[],
  Banks,
  string,
  number,
];

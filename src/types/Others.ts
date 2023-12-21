import { AccountType, Banks } from './Data';

export type Interval = { initialDate: string, endDate: string };

export type InstallmentsTransType = {
  Diariamente: number;
  Semanalmente: number;
  Quinzenalmente: number;
  Mensalmente: number;
  Bimestralmente: number;
  Trimestralmente: number;
  Semestralmente: number;
  Anualmente: number;
  [key: string]: number;
};

export type RemoveAccountParams = [
  AccountType[],
  Banks,
  string,
  number,
];
import { AccountType, Banks } from './Data';

export type Interval = { initialDate: string, endDate: string };

export type InstallmentsTransType = {
  Diariamente: number;
  '4x no mês': number;
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

export type YearAndMonth = { year: number, month: number };

import { Data } from './Data';

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
};

export type Currency = {
  code: string,
  codein: string,
  name: string,
  high: string,
  low: string,
  varBid: string,
  pctChange: string,
  bid: string,
  ask: string,
  timestamp: string,
  create_date: string
};

export type Currencies = {
  [key: string]: Currency;
};

export type NewAccountType = {
  newAccount: boolean;
};

export type DeleteAccountType = {
  changeAccount: boolean;
};

export type DateSelected = {
  month: number;
  monthString: string;
};

export type MonthSelected = {
  monthSelected: DateSelected;
};

export type NewTransactionType = {
  newTransaction: boolean;
};

export type Operationals = NewAccountType
& DeleteAccountType
& MonthSelected
& NewTransactionType
& { [key: string]: boolean | DateSelected };

export type StateRedux = {
  user: User;
  currencies: Currencies;
  data: Data;
  operationals: Operationals;
};

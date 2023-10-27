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
  [key: string]: boolean;
};

export type DeleteAccountType = {
  changeAccount: boolean;
  [key: string]: boolean;
};

export type Operationals = NewAccountType;

export type StateRedux = {
  user: User;
  currencies: Currencies;
  data: Data;
  operationals: Operationals;
};

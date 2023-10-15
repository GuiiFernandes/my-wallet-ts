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

export type AccountType = {
  name: string,
  balance: number,
  type: 'conta-corrente' | 'conta-poupanca' | 'conta-investimento',
};

export type Currencies = {
  [key: string]: Currency;
};

export type StateRedux = {
  user: User;
  currencies: Currencies;
};

export type InvestimentsType = {
  national: InvestNational[];
  international: InvestInternational[];
  [key: string]: InvestInternational[] | InvestNational[];
};

export type InvestNational = {
  id: string;
  name: string;
  buyValue: number;
  currentValue: number;
  simbol: string;
  quantity: number | null;
  date: string;
  type: InvestimentType;
};

export type InvestInternational = {
  id: string;
  name: string;
  buyValue: number;
  currentValue: number;
  simbol: string;
  quantity: number | null;
  date: string;
  type: 'ação' | 'conta' | 'outros';
};

type InvestimentType = 'fixa' | 'variável' | 'FII' | 'previdência' | 'outros';

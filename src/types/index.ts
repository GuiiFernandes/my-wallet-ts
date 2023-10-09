export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string | null;
  accessToken: string;
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

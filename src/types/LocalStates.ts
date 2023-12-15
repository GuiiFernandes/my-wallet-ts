import { TransactionType } from './Data';

export type RealForm = { [key: string]: string };

export type FormAccount = {
  name: string,
  balance: string,
  type: 'conta-corrente' | 'conta-investimento' | 'carteira',
};

export type FormTransaction = {
  isFixed: boolean,
  accountDestiny: string,
} & Omit<TransactionType, 'id'>;

export type PropsNewTrans = {
  form: FormTransaction;
  setForm: (param: FormTransaction) => void;
};

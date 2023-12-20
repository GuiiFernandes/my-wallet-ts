import { TransactionType } from './Data';

export type RealForm = { [key: string]: string };

export type FormAccount = {
  name: string,
  balance: string,
  type: 'conta-corrente' | 'conta-investimento' | 'carteira',
};

type FormWithoutId = Omit<TransactionType, 'id'>;

export type FormTransaction = {
  accountDestiny: string,
} & Omit<FormWithoutId, 'transactionId'>;

export type PropsNewTrans = {
  form: FormTransaction;
  setForm: (param: FormTransaction) => void;
};

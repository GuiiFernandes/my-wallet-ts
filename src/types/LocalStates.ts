export type RealForm = { [key: string]: string };

export type FormAccount = {
  name: string,
  balance: string,
  type: 'conta-corrente' | 'conta-investimento' | 'carteira',
};

export type FormTransaction = {
  date: string,
  dueDate: string,
  payday: string | null,
  description: string,
  value: number,
  account: string,
  type: 'Receita' | 'Despesa',
  category: string,
  subCategory: string,
  installments: number | null,
  period: string,
  isFixed: boolean,
};

export type PropsNewTrans = {
  form: FormTransaction;
  setForm: (param: FormTransaction) => void;
};

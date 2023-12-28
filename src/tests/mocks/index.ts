import { TransactionsType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';

const PAYDAY = '2023-12-22';

const formTransfer: FormTransaction = {
  id: 'ee898259-40e0-445b-acb5-abcac16853a0',
  transactionId: '4cb76e23-889c-4ed6-a0e5-6519fa64f553',
  payday: PAYDAY,
  installments: 'U',
  category: '',
  description: 'Saquei',
  period: '',
  value: 100,
  subCategory: '',
  type: 'Transferência',
  date: PAYDAY,
  installment: 1,
  account: 'Itaú',
  accountDestiny: 'Carteira',
};

const expenseTransfer: FormTransaction = {
  id: 'ee898259-40e0-445b-acb5-adrfc16853a8',
  transactionId: '4cb76e23-889c-4ed6-a0e5-6519fa64f553',
  payday: PAYDAY,
  installments: 'U',
  category: '',
  description: 'Saquei',
  period: '',
  value: 90,
  subCategory: '',
  type: 'Despesa',
  date: PAYDAY,
  installment: 1,
  account: 'Itaú',
  accountDestiny: 'Carteira',
};

const transactions: TransactionsType = {
  transfers: [{ ...formTransfer, value: 90 }],
  records: [expenseTransfer, {
    ...expenseTransfer,
    id: 'ee898259-40e0-445b-acb5-abcac16853a1',
    value: 90,
    type: 'Receita',
    account: 'Carteira',
  }],
  fixeds: [],
};

export default {
  formTransfer,
  transactions,
};

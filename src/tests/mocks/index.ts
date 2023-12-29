import { AccountType, TransactionType, TransactionsType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';

const PAYDAY = '2023-12-22';
const ITAU_PICPAY = 'Itaú>PicPay';
const TRANSFER_TYPE = 'Transferência';
const INVESTIMENT_TRANS_ID = '8a803c3e-e6a6-42c8-8bfa-6c04fa391c71';

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

const transfers: TransactionType[] = [
  {
    payday: null,
    value: 100,
    installments: 'U',
    description: 'Saquei',
    date: '2023-12-22',
    account: 'Itaú>Carteira',
    type: TRANSFER_TYPE,
    installment: 1,
    category: '',
    subCategory: '',
    transactionId: '4cb76e23-889c-4ed6-a0e5-6519fa64f553',
    id: 'ee898259-40e0-445b-acb5-abcac16853a0',
    period: '',
  },
  {
    id: '4ed8d435-7995-40b6-907b-41a56da22ba4',
    account: ITAU_PICPAY,
    date: '2023-12-29',
    description: 'Investimento',
    payday: null,
    value: 100,
    category: '',
    subCategory: '',
    installment: 1,
    installments: 'F',
    period: 'Semanalmente',
    type: TRANSFER_TYPE,
    transactionId: INVESTIMENT_TRANS_ID,
  },
  {
    id: '98268107-eb8c-489d-8abf-19e8230f97dd',
    account: ITAU_PICPAY,
    date: '2024-01-05',
    description: 'Investimento',
    payday: null,
    value: 100,
    category: '',
    subCategory: '',
    installment: 2,
    installments: 'F',
    period: 'Semanalmente',
    type: TRANSFER_TYPE,
    transactionId: INVESTIMENT_TRANS_ID,
  },
  {
    id: '6c040d54-94db-4fa8-a529-8ce7cee8bf86',
    account: ITAU_PICPAY,
    date: '2024-01-12',
    description: 'Investimento',
    payday: null,
    value: 100,
    category: '',
    subCategory: '',
    installment: 3,
    installments: 'F',
    period: 'Semanalmente',
    type: TRANSFER_TYPE,
    transactionId: INVESTIMENT_TRANS_ID,
  },
  {
    id: '6aed1946-dca7-4b46-9fc6-5a97ec160da6',
    account: ITAU_PICPAY,
    date: '2024-01-19',
    description: 'Investimento',
    payday: null,
    value: 100,
    category: '',
    subCategory: '',
    installment: 4,
    installments: 'F',
    period: 'Semanalmente',
    type: TRANSFER_TYPE,
    transactionId: INVESTIMENT_TRANS_ID,
  },
];

const formTransfer: FormTransaction = {
  ...transfers[0],
  payday: PAYDAY,
  value: 100,
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

const accounts: AccountType[] = [
  { id: 1, name: 'Itaú', balance: 100, real: 90, type: 'conta-corrente' },
  { id: 2, name: 'Carteira', balance: 100, real: 0, type: 'carteira' },
];

export default {
  formTransfer,
  transactions,
  transfers,
  accounts,
};

import { AccountType, TransactionsType } from '../../types/Data';
import transferMock from './transfers';

const { transfers, expenseTransfer, formTransferUnique } = transferMock;

const transactionsTransfers: TransactionsType = {
  transfers: [{ ...formTransferUnique, value: 90 }, ...transfers],
  records: [expenseTransfer, {
    ...expenseTransfer,
    id: 'ee898259-40e0-445b-acb5-abcac16853a1',
    value: 90,
    type: 'Receita',
    account: 'Carteira',
  }],
  fixeds: [],
};

const transactionsRecords: TransactionsType = {
  transfers: [],
  records: [],
  fixeds: [],
};

const accounts: AccountType[] = [
  { id: 1, name: 'Itaú', balance: 100, real: 90, type: 'conta-corrente' },
  { id: 2, name: 'Carteira', balance: 100, real: 0, type: 'carteira' },
  { id: 3, name: 'PicPay', balance: 100, real: 100, type: 'conta-corrente' },
];

export default {
  transactionsTransfers,
  transactionsRecords,
  accounts,
};

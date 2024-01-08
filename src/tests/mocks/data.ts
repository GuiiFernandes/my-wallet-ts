import { AccountType, TransactionsType } from '../../types/Data';
import transferMock from './transfers';
import recordMock from './records';

const { transfers, expenseTransfer, formTransferUnique } = transferMock;
const { recordUnique, recordInstallments } = recordMock;

const TRANSID_INSTALLMENTS = '760e0d03-6cf9-4ae0-9800-cf75cc2art45';

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

const transactionsEditRecords: TransactionsType = {
  transfers: [],
  records: [
    { ...recordUnique, transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc222670' },
    { ...recordInstallments,
      transactionId: TRANSID_INSTALLMENTS,
      installment: 1,
      id: '760e0d03-6cf9-4ae0-9800-cf75cc222671' },
    { ...recordInstallments,
      transactionId: TRANSID_INSTALLMENTS,
      installment: 2,
      id: '760e0d03-6cf9-4ae0-9800-cf75cc222672' },
    { ...recordInstallments,
      transactionId: TRANSID_INSTALLMENTS,
      installment: 3,
      id: 'd5de8cd2-dcff-4570-9c6f-5b1a73220065' },
  ],
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
  transactionsEditRecords,
};

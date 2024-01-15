import { AccountType, TransactionsType } from '../../types/Data';
// import transferMock from './transfers';
import recordMock from './records';
import transferMock from './transfers';

// const { transfers, expenseTransfer, formTransferUnique } = transferMock;
const { recordUnique, recordInstallments, recordFixed } = recordMock;
const { transferUnique, transferInstallments } = transferMock;

const TRANSID_INSTALLMENTS = '760e0d03-6cf9-4ae0-9800-cf75cc2art45';
const TRANSFER_TRANSID_INSTALLMENTS = '760e0d03-6cf9-4ae0-9800-cf75cft54r09';
const TRANSID_FIXED = '760e0d03-6cf9-4ae0-9800-cf75cc2ar171';
const SIX_ONE_TWENTYFOUR = '2024-01-06';

// const transactionsTransfers: TransactionsType = {
//   transfers: [{ ...formTransferUnique, value: 90 }, ...transfers],
//   records: [expenseTransfer, {
//     ...expenseTransfer,
//     id: 'ee898259-40e0-445b-acb5-abcac16853a1',
//     value: 90,
//     type: 'Receita',
//     account: 'Carteira',
//   }],
//   fixeds: [],
// };

const transactionsRecords: TransactionsType = {
  transfers: [],
  records: [],
  fixeds: [],
};

const transactionsEditRecords: TransactionsType = {
  transfers: [
    { ...transferUnique, transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc2av43t' },
    { ...transferInstallments,
      transactionId: TRANSFER_TRANSID_INSTALLMENTS,
      id: '760e0d03-6cf9-4ae0-9800-cf75ccr4e32d' },
    { ...transferInstallments,
      transactionId: TRANSFER_TRANSID_INSTALLMENTS,
      installment: 2,
      id: '760e0d03-6cf9-4ae0-9800-cf75ccr4e33e' },
    { ...transferInstallments,
      transactionId: TRANSFER_TRANSID_INSTALLMENTS,
      installment: 3,
      id: '760e0d03-6cf9-4ae0-9800-cf75ccr4e34f' },
  ],
  records: [
    { ...recordUnique, transactionId: '760e0d03-6cf9-4ae0-9800-cf75cc222670' },
    { ...recordInstallments,
      transactionId: TRANSID_INSTALLMENTS,
      id: '760e0d03-6cf9-4ae0-9800-cf75cc222671' },
    { ...recordInstallments,
      transactionId: TRANSID_INSTALLMENTS,
      installment: 2,
      date: '2024-02-06',
      id: '760e0d03-6cf9-4ae0-9800-cf75cc222672' },
    { ...recordInstallments,
      transactionId: TRANSID_INSTALLMENTS,
      installment: 3,
      date: '2024-03-06',
      id: 'd5de8cd2-dcff-4570-9c6f-5b1a73220065' },
    { ...recordFixed,
      transactionId: TRANSID_FIXED,
      date: SIX_ONE_TWENTYFOUR,
      payday: SIX_ONE_TWENTYFOUR,
      id: 'd5de8cd2-dcff-4570-9c6f-5b1a732fe45x' },
  ],
  fixeds: [{ ...recordFixed,
    transactionId: TRANSID_FIXED,
    date: SIX_ONE_TWENTYFOUR,
    id: 'd5de8cd2-dcff-4570-9c6f-5b1a732fe45x' }],
};

const accounts: AccountType[] = [
  { id: 1, name: 'Itaú', balance: 100, real: 90, type: 'conta-corrente' },
  { id: 2, name: 'Carteira', balance: 100, real: 0, type: 'carteira' },
  { id: 3, name: 'PicPay', balance: 100, real: 100, type: 'conta-corrente' },
];

export default {
  // transactionsTransfers,
  transactionsRecords,
  accounts,
  transactionsEditRecords,
};

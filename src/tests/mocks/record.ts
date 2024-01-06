import { TransactionType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';

const DATE = '2024-01-06';
const ID_INITIAL = '760e0d03-6cf9-4ae0-9800-cf75cc222670';

const recordUnique: TransactionType = {
  id: ID_INITIAL,
  date: DATE,
  payday: null,
  description: 'Lanche',
  value: 20,
  account: 'PicPay',
  period: '',
  type: 'Despesa',
  category: 'Alimentação',
  subCategory: 'Lanche',
  installment: 1,
  installments: 'U',
};

const formUnique: FormTransaction = {
  ...recordUnique,
  id: '',
  period: 'Mensalmente',
  accountDestiny: 'PicPay',
};

const recordInstallments: TransactionType = {
  id: ID_INITIAL,
  date: DATE,
  payday: null,
  description: 'Plano Academia',
  value: 210,
  account: 'Itaú',
  period: 'Mensalmente',
  type: 'Despesa',
  category: 'Saúde',
  subCategory: 'Academia',
  installment: 1,
  installments: '3',
};

const formInstallments: FormTransaction = {
  ...recordInstallments,
  id: '',
  accountDestiny: 'PicPay',
};

const recordFixed: TransactionType = {
  id: ID_INITIAL,
  date: DATE,
  payday: null,
  description: 'Aluguel',
  value: 500,
  account: 'Itaú',
  period: 'Mensalmente',
  type: 'Despesa',
  category: 'Casa',
  subCategory: 'Aluguel',
  installment: 1,
  installments: 'F',
};

const formFixed: FormTransaction = {
  ...recordFixed,
  id: '',
  accountDestiny: 'PicPay',
};

export default {
  formUnique,
  recordUnique,
  formInstallments,
  recordInstallments,
  formFixed,
  recordFixed,
};

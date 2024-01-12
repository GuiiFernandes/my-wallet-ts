import { TransactionType } from '../../types/Data';
import { FormTransaction } from '../../types/LocalStates';

const DATE = '2024-01-06';
const ID_INITIAL = '760e0d03-6cf9-4ae0-9800-cf75cc222670';
const TRANSFER_TYPE = 'Transferência';

const transferUnique: TransactionType = {
  id: ID_INITIAL,
  date: DATE,
  payday: null,
  description: 'Depositei',
  value: 20,
  account: 'Carteira>PicPay',
  period: '',
  type: TRANSFER_TYPE,
  category: '',
  subCategory: '',
  installment: 1,
  installments: 'U',
};

const formUnique: FormTransaction = {
  ...transferUnique,
  id: '',
  account: 'Carteira',
  accountDestiny: 'PicPay',
  period: 'Mensalmente',
  category: 'Alimentação',
  subCategory: 'Lanche',
};

const transferInstallments: TransactionType = {
  id: ID_INITIAL,
  date: DATE,
  payday: null,
  description: 'IPVA',
  value: 300,
  account: 'Itaú>PicPay',
  period: '',
  type: TRANSFER_TYPE,
  category: '',
  subCategory: '',
  installment: 1,
  installments: '3',
};

const formInstallments: FormTransaction = {
  ...transferInstallments,
  id: '',
  account: 'Itaú',
  accountDestiny: 'PicPay',
};

const transferFixed: TransactionType = {
  id: ID_INITIAL,
  date: DATE,
  payday: null,
  description: 'Investimento',
  value: 50,
  account: 'Carteira>Itaú',
  period: '',
  type: TRANSFER_TYPE,
  category: '',
  subCategory: '',
  installment: 1,
  installments: 'F',
};

const formFixed: FormTransaction = {
  ...transferFixed,
  id: '',
  account: 'Carteira',
  accountDestiny: 'Itaú',
};

export default {
  formUnique,
  transferUnique,
  formInstallments,
  transferInstallments,
  formFixed,
  transferFixed,
};

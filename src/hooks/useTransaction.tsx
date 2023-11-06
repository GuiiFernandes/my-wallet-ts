import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { TransactionType } from '../types/Data';
import { FormTransaction } from '../types/LocalStates';
import { bulkCreate } from '../utils/firebaseFuncs';
import { StateRedux } from '../types/State';

type InstallmentsTransType = {
  Diariamente: number;
  Semanalmente: number;
  Quinzenalmente: number;
  Mensalmente: number;
  Bimestralmente: number;
  Trimestralmente: number;
  Semestralmente: number;
  Anualmente: number;
  [key: string]: number;
};

const oneDay = 1000 * 60 * 60 * 24;

const installmentsTransform: InstallmentsTransType = {
  Diariamente: oneDay,
  Semanalmente: oneDay * 7,
  Quinzenalmente: oneDay * 14,
  Mensalmente: oneDay * 30,
  Bimestralmente: oneDay * 60,
  Trimestralmente: oneDay * 90,
  Semestralmente: oneDay * 180,
  Anualmente: oneDay * 365,
};

const keyByType = (isFixed: boolean, isTransfer?: boolean) => {
  const key = isTransfer ? 'Revenues' : 'Expenses';
  return {
    Despesa: isFixed ? 'fixedExpenses' : 'variableExpenses',
    Receita: isFixed ? 'fixedRevenues' : 'variableRevenues',
    Transferência: isFixed ? `fixed${key}` : `variable${key}`,
    Investimento: isFixed ? 'fixedExpenses' : 'fixedExpenses',
  };
};

export default function useTransaction() {
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { transactions } = useSelector(({ data }: StateRedux) => data);

  const formatedTransactions = (form: Omit<FormTransaction, 'id'>) => {
    const { installments, period, type, isFixed } = form;

    const newForm: any = { ...form };

    delete newForm.installments;
    delete newForm.period;
    delete newForm.accountDestiny;
    delete newForm.isFixed;

    const newTransactions: Omit<TransactionType, 'id'>[] = [];
    const againstTransactions: Omit<TransactionType, 'id'>[] = [];
    if (installments) {
      const periodNumber = installmentsTransform[period];
      for (let i = 0; i < installments; i += 1) {
        const dueDate = new Date(form.date).getTime() + (periodNumber * i);
        newTransactions.push({
          id: uuidv4(),
          ...newForm,
          dueDate: new Date(dueDate).toISOString().slice(0, 10),
          installments: `${i + 1}/${installments}`,
        });
      }
      if (type === 'Transferência') {
        const { accountDestiny } = form;
        const destinyTransactions = newTransactions.map((transaction) => ({
          id: uuidv4(),
          ...transaction,
          value: transaction.value,
          account: accountDestiny,
        }));
        againstTransactions.push(...destinyTransactions);
      }
    } else {
      newTransactions.push({
        id: uuidv4(),
        ...newForm,
        installments: isFixed ? 'F' : 'U' });
    }

    return [newTransactions, againstTransactions];
  };

  const createTransaction = async (form: Omit<FormTransaction, 'id'>) => {
    const { type } = form;
    const [newTransactions, againstTransactions] = formatedTransactions(form);
    await Promise.all([
      bulkCreate(
        {
          uid,
          docName: 'transactions',
          key: keyByType(form.isFixed)[type],
        },
        transactions,
        newTransactions,
      ),
      againstTransactions.length ? bulkCreate(
        {
          uid,
          docName: 'transactions',
          key: keyByType(form.isFixed, true)[type],
        },
        transactions,
        againstTransactions,
      ) : null,
    ]);
  };

  return { createTransaction };
}

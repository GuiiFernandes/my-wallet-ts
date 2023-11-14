import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { FixedTransactionType, InfosTransVar, TransactionType } from '../types/Data';
import { FormTransaction } from '../types/LocalStates';
import { bulkCreate } from '../utils/firebaseFuncs';
import { StateRedux } from '../types/State';
import { changeOperationls } from '../redux/reducers/operationals';

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
  const dispatch = useDispatch();
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { transactions } = useSelector(({ data }: StateRedux) => data);
  const { monthSelected,
    newTransaction } = useSelector(({ operationals }: StateRedux) => operationals);
  const { monthString } = monthSelected;

  const formatedTransactions = (form: Omit<FormTransaction, 'id'>) => {
    const { installments, period, type, isFixed, value } = form;

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
        const date = new Date(form.date).getTime() + (periodNumber * i);
        const baseValue = Math.floor((value / installments) * 100) / 100;
        const totalBase = baseValue * installments;
        const restValue = (form.value - totalBase) * 100;
        newTransactions.push({
          id: uuidv4(),
          ...newForm,
          value: i < restValue - 1 ? baseValue + 0.01 : baseValue,
          date: new Date(date).toISOString().slice(0, 10),
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
      const formatedTrans = {
        id: uuidv4(),
        ...newForm,
        installments: isFixed ? 'F' : 'U' };
      if (isFixed) formatedTrans.variations = [];
      newTransactions.push(formatedTrans);
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
    dispatch(changeOperationls({ newTransaction: !newTransaction }));
  };

  const ByDateCallback = ({ date }: { date: string }) => new Date(date)
    .getTime() <= new Date(monthString).getTime();

  const getVariations = (trans: FixedTransactionType[]) => {
    const transByDate = trans.filter(ByDateCallback);
    const transByVariations = transByDate.reduce((
      array: Partial<FixedTransactionType>[],
      transaction: FixedTransactionType,
    ) => {
      const { variations } = transaction;
      if (!variations.length) return [...array, transaction];
      const formatedVariations = variations.map((variation: InfosTransVar) => {
        const transWithVariations = { ...transaction } as Partial<FixedTransactionType>;
        delete transWithVariations.variations;
        const { date, value, payday, account } = variation;
        return { ...transWithVariations, date, value, payday, account };
      }, []);
      return [...array, ...formatedVariations];
    }, []);
    return transByVariations as TransactionType[];
  };

  const getByDate = (trans: TransactionType[]) => trans
    .filter(ByDateCallback);

  const getAllTransactions = () => {
    const { fixedExpenses, variableExpenses,
      fixedRevenues, variableRevenues } = transactions;
    const allTransactions: TransactionType[] = [
      ...getByDate(variableRevenues),
      ...getVariations(fixedRevenues),
      ...getVariations(fixedExpenses),
      ...getByDate(variableExpenses),
    ].sort((a: TransactionType, b: TransactionType) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return allTransactions;
  };

  return { createTransaction, getAllTransactions };
}

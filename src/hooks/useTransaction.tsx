import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { KeyTrans, TransactionType } from '../types/Data';
import { FormTransaction } from '../types/LocalStates';
import { create, manyCreate, manyUpdate, update } from '../utils/firebaseFuncs';
import { StateRedux } from '../types/State';
import { changeOperationls } from '../redux/reducers/operationals';
import { swalUpTrans } from '../utils/swal';
import { calculateInstallments, calculateNextDate,
  calculateValue } from '../utils/calculates';
import { Interval } from '../types/Others';
import { keyByType } from '../utils/dataModel';

export default function useTransaction() {
  const dispatch = useDispatch();
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { transactions } = useSelector(({ data }: StateRedux) => data);
  const {
    monthSelected,
    newTransaction,
    editTransaction,
  } = useSelector(({ operationals }: StateRedux) => operationals);
  const { month, year } = monthSelected;

  const generateId = (id: string | undefined) => id || uuidv4();

  const formatedTransactions = (
    form: FormTransaction,
    interval?: Interval,
    transId?: string,
  ) => {
    const { installments, period, type, isFixed, value } = form;

    const newForm: any = { ...form };

    delete newForm.accountDestiny;
    delete newForm.isFixed;

    const newTransactions: TransactionType[] = [];
    const againstTransactions: TransactionType[] = [];
    const transactionId = generateId(transId);
    if (installments) {
      const [parcel, totalParcel] = calculateInstallments(period, installments, interval);
      console.log(parcel, totalParcel, interval);
      for (let i = 0; i <= (totalParcel - parcel); i += 1) {
        newTransactions.push({
          ...newForm,
          id: generateId(newForm.id),
          transactionId,
          value: calculateValue(totalParcel, value, i, newTransaction),
          date: calculateNextDate(form.date, period, i),
          installments: isFixed
            ? 'F' : `${i + parcel}/${totalParcel}`,
        });
      }
      if (type === 'Transferência') {
        const { accountDestiny } = form;
        const destinyTransactions = newTransactions.map((transaction) => ({
          ...transaction,
          id: generateId(newForm.id),
          transactionId,
          value: transaction.value,
          account: accountDestiny,
        }));
        againstTransactions.push(...destinyTransactions);
      }
    } else {
      const formatedTrans = {
        ...newForm,
        id: generateId(newForm.id),
        transactionId,
        installments: isFixed ? 'F' : 'U' };
      newTransactions.push(formatedTrans);
    }

    return [newTransactions, againstTransactions];
  };

  const createTransaction = async (form: FormTransaction) => {
    const [newTransactions, againstTransactions] = formatedTransactions(form);
    await manyCreate(
      form,
      { uid, docName: 'transactions' },
      { transactions, newTransactions, againstTransactions },
    );
    dispatch(changeOperationls({ newTransaction: !newTransaction }));
  };

  const searchAndFormatedTrans = (
    transactionUp: TransactionType | undefined,
    form: FormTransaction,
    key: KeyTrans | null,
  ) => {
    const { type, isFixed } = form;
    if (transactionUp) {
      const { transactionId } = transactionUp;
      const validKey = key || keyByType(!isFixed)[type];
      const transactionsByType = transactions[validKey]
        .filter((transaction) => transaction.transactionId === transactionId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const initialDate = transactionUp.date;
      const endDate = transactionsByType[0].date;
      const dateObj = transactionUp.installments === 'F'
        ? { initialDate, endDate } : undefined;
      return formatedTransactions(
        form,
        dateObj,
        transactionId,
      );
    }
    throw new Error('Não foi possível encontrar a transação variável');
  };

  const updateOneFixedTrans = async (
    form: FormTransaction,
    key: KeyTrans,
  ) => {
    const { type, isFixed } = form;
    const variableKey = keyByType(!isFixed)[type];
    let transactionFixed = transactions[variableKey]
      .find(({ id }) => id === editTransaction);
    const newForm: any = { ...form };

    delete newForm.accountDestiny;
    delete newForm.isFixed;

    if (transactionFixed) {
      const formatedTrans: TransactionType = {
        ...transactionFixed,
        ...newForm,
      };
      await update(
        { uid, docName: 'transactions', key },
        transactions,
        formatedTrans,
      );
    } else {
      transactionFixed = transactions[key]
        .find(({ id }) => id === editTransaction);
      const formatedTrans: TransactionType = {
        ...transactionFixed,
        ...newForm,
        installments: isFixed ? 'F' : 'U',
      };
      await create(
        { uid, docName: 'transactions', key },
        transactions,
        formatedTrans,
      );
    }
  };

  const updateOneTrans = async (form: FormTransaction, key: KeyTrans) => {
    const newForm: any = { ...form };

    delete newForm.accountDestiny;
    delete newForm.isFixed;
    const transaction = transactions[key]
      .find(({ id }) => id === editTransaction);
    const formatedTrans: TransactionType = {
      ...transaction,
      ...newForm,
    };
    await update(
      { uid, docName: 'transactions', key },
      transactions,
      formatedTrans,
    );
  };

  const updateTransaction = async (
    form: FormTransaction,
  ) => {
    const { type, isFixed } = form;
    const key = keyByType(isFixed)[type];
    if (form.installments !== 'U') {
      const { value } = await swalUpTrans({
        title: 'Atualizar Lançamento',
        text: 'Quais lançamentos deseja alterar?',
        icon: 'question',
      });
      const transactionUp = transactions[key]
        .find(({ id }) => id === editTransaction);
      if (value === 'true') {
        const paramKey = key.includes('fixed') ? null : key;
        const [newTransactions, againstTransactions] = searchAndFormatedTrans(
          transactionUp,
          form,
          paramKey,
        );
        console.log(newTransactions, againstTransactions);
        return manyUpdate(
          form,
          { uid, docName: 'transactions', transactionId: transactionUp?.transactionId },
          {
            transactions,
            newTransactions,
            againstTransactions,
          },
        );
      }
      if (key.includes('fixed')) {
        return updateOneFixedTrans(form, key);
      }
      await updateOneTrans(form, key);
    } else {
      await updateOneTrans(form, key);
    }
  };

  const getByDate = (trans: TransactionType[], createInMonth: boolean = false) => trans
    .filter(({ date }) => {
      const transDate = new Date(date).getTime();
      const initialMonth = new Date(`${year}-${month}-01`).getTime();
      const monthCompare = (month % 12) + 1;
      const yearCompare = monthCompare < month ? year + 1 : year;
      const finalMonth = new Date(`${yearCompare}-${monthCompare}-01`).getTime();
      if (createInMonth) return transDate >= initialMonth && transDate <= finalMonth;
      return transDate <= finalMonth;
    });

  const getAllTransactions = () => {
    const { fixedExpenses, variableExpenses,
      fixedRevenues, variableRevenues } = transactions;
    const allTransactions: TransactionType[] = [
      ...getByDate(variableRevenues, true),
      ...getByDate(fixedRevenues),
      ...getByDate(fixedExpenses),
      ...getByDate(variableExpenses, true),
    ].sort((a: TransactionType, b: TransactionType) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return allTransactions;
  };

  return { createTransaction, getAllTransactions, updateTransaction };
}

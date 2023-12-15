import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { KeyByType, TransactionType } from '../types/Data';
import { FormTransaction } from '../types/LocalStates';
import { bulkCreate, update } from '../utils/firebaseFuncs';
import { StateRedux } from '../types/State';
import { changeOperationls } from '../redux/reducers/operationals';
import { swalUpTrans } from '../utils/swal';
import { calculateNextDate, calculateValue } from '../utils/calculates';

const keyByType = (isFixed: boolean, isTransfer?: boolean): KeyByType => {
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
  const {
    monthSelected,
    newTransaction,
    editTransaction,
  } = useSelector(({ operationals }: StateRedux) => operationals);
  const { month, year } = monthSelected;

  const formatedTransactions = (form: Omit<FormTransaction, 'id'>) => {
    const { installments, period, type, isFixed, value } = form;

    const newForm: any = { ...form };

    delete newForm.installments;
    delete newForm.accountDestiny;
    delete newForm.isFixed;

    const newTransactions: Omit<TransactionType, 'id'>[] = [];
    const againstTransactions: Omit<TransactionType, 'id'>[] = [];
    const transactionId = uuidv4();
    if (installments) {
      const numInstallments = Number(installments);
      for (let i = 0; i < numInstallments; i += 1) {
        newTransactions.push({
          id: uuidv4(),
          ...newForm,
          transactionId,
          value: calculateValue(numInstallments, value, i),
          date: calculateNextDate(form.date, period, i),
          installments: `${i + 1}/${installments}`,
        });
      }
      if (type === 'Transferência') {
        const { accountDestiny } = form;
        const destinyTransactions = newTransactions.map((transaction) => ({
          id: uuidv4(),
          ...transaction,
          transactionId,
          value: transaction.value,
          account: accountDestiny,
        }));
        againstTransactions.push(...destinyTransactions);
      }
    } else {
      const formatedTrans = {
        id: uuidv4(),
        ...newForm,
        transactionId,
        installments: isFixed ? 'F' : 'U' };
      if (isFixed) formatedTrans.variations = [];
      newTransactions.push(formatedTrans);
    }

    return [newTransactions, againstTransactions];
  };

  const createTransaction = async (form: Omit<FormTransaction, 'id'>) => {
    const { type, isFixed } = form;
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
          key: keyByType(isFixed, true)[type],
        },
        transactions,
        againstTransactions,
      ) : null,
    ]);
    dispatch(changeOperationls({ newTransaction: !newTransaction }));
  };

  const verifyTransactionUp = async (form: Omit<FormTransaction, 'id'>) => {
    const { type, isFixed } = form;
    const key = keyByType(isFixed)[type];
    if (form.installments !== 'U') {
      const { value } = await swalUpTrans({
        title: 'Atualizar Lançamento',
        text: 'Quais lançamentos deseja alterar?',
        icon: 'question',
      });
      const [newTransactions, againstTransactions] = formatedTransactions(form);
      if (value && key.includes('fixed')) {
        const transactionFixed = transactions[key]
          .find(({ id }) => id === editTransaction);
        if (transactionFixed) {
          const { transactionId } = transactionFixed;
          const variableKey = keyByType(!isFixed)[type];
          const variableTransactions = transactions[variableKey]
            .filter((transaction) => transaction.transactionId === transactionId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          let initialDate = transactionFixed.date;
          if (variableTransactions.length) {
            initialDate = variableTransactions[0].date;
          }
        }
      }
    }
  };

  const updateTransaction = async (form: Omit<FormTransaction, 'id'>) => {
    const transArray = verifyTransactionUp(form);

    // const newVariations = variations.map((variation: InfosTransVar) => {
    //   const { date, value, payday, account } = variation;
    //   return { date, value, payday, account };
    // });
    // newTransactions[0].variations = newVariations;
    await Promise.all([
      bulkCreate(
        {
          uid,
          docName: 'transactions',
          key: keyByType(isFixed)[type],
        },
        transactions,
        newTransactions,
      ),
      againstTransactions.length ? bulkCreate(
        {
          uid,
          docName: 'transactions',
          key: keyByType(isFixed, true)[type],
        },
        transactions,
        againstTransactions,
      ) : null,
    ]);
    dispatch(changeOperationls({ newTransaction: !newTransaction }));
  };

  // const createInMonthCallback = (
  //   { date }: { date: string },
  //   createInMonth: boolean = false,
  // ) => {
  //   const transDate = new Date(date).getTime();
  //   const initialMonth = new Date(`${year}-${month}-01`).getTime();
  //   const monthCompare = (month % 12) + 1;
  //   const yearCompare = monthCompare < month ? year + 1 : year;
  //   const finalMonth = new Date(`${yearCompare}-${monthCompare}-01`).getTime();
  //   if (createInMonth) return transDate >= initialMonth && transDate <= finalMonth;
  //   return transDate <= finalMonth;
  // };

  // const getVariations = (trans: TransactionType[]) => {
  //   const transByDate = trans.filter((elem) => createInMonthCallback(elem));
  //   const transByVariations = transByDate.reduce((
  //     array: Partial<FixedTransactionType>[],
  //     transaction: TransactionType,
  //   ) => {
  //     const { variations } = transaction;
  //     if (!variations.length) return [...array, transaction];
  //     const formatedVariations = variations.map((variation: InfosTransVar) => {
  //       const transWithVariations = { ...transaction } as Partial<FixedTransactionType>;
  //       delete transWithVariations.variations;
  //       const { date, value, payday, account } = variation;
  //       return { ...transWithVariations, date, value, payday, account };
  //     }, []);
  //     return [...array, ...formatedVariations];
  //   }, []);
  //   return transByVariations as TransactionType[];
  // };

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

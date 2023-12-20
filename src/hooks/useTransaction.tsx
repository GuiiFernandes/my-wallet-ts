import { useDispatch, useSelector } from 'react-redux';

import { StateRedux } from '../types/State';
import { TransactionType } from '../types/Data';

const TRANSFER_TYPE = 'Transferência';

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
  const { fixeds, records, transfers } = transactions;

  //   const generateId = (id: string | undefined) => id || uuidv4();

  //   const formatedTransactions = (
  //     form: FormTransaction,
  //     interval?: Interval,
  //     transId?: string,
  //   ) => {
  //     const { installments, period, type, isFixed, value } = form;

  //     const newForm: any = { ...form };

  //     delete newForm.accountDestiny;
  //     delete newForm.isFixed;

  //     const newTransactions: TransactionType[] = [];
  //     const againstTransactions: TransactionType[] = [];
  //     const transactionId = generateId(transId);
  //     if (installments) {
  //       const [parcel, totalParcel] = calculateInstallments(period, installments, interval);
  //       for (let i = 0; i <= (totalParcel - parcel); i += 1) {
  //         const newInstallments = generateInstallments(isFixed, parcel, i, totalParcel);
  //         newTransactions.push({
  //           ...newForm,
  //           id: generateId(newForm.id),
  //           transactionId,
  //           value: calculateValue(totalParcel, value, i, newTransaction),
  //           date: calculateNextDate(form.date, period, i),
  //           installments: newInstallments,
  //           period: installments === 'U' ? '' : period,
  //         });
  //       }
  //     } else {
  //       const formatedTrans = {
  //         ...newForm,
  //         id: generateId(newForm.id),
  //         transactionId,
  //         installments: isFixed ? 'F' : 'U' };
  //       newTransactions.push(formatedTrans);
  //     }
  //     if (type === TRANSFER_TYPE) {
  //       const { accountDestiny } = form;
  //       const destinyTransactions = newTransactions.map((transaction) => ({
  //         ...transaction,
  //         id: generateId(newForm.id),
  //         transactionId,
  //         value: transaction.value,
  //         account: accountDestiny,
  //       }));
  //       againstTransactions.push(...destinyTransactions);
  //     }
  //     return [newTransactions, againstTransactions];
  //   };

  //   // const createTransaction = async (form: FormTransaction) => {
  //   //   const [newTransactions, againstTransactions] = formatedTransactions(form);
  //   //   await manyCreate(
  //   //     form,
  //   //     { uid, docName: 'transactions' },
  //   //     { transactions, newTransactions, againstTransactions },
  //   //   );
  //   //   dispatch(changeOperationls({ newTransaction: !newTransaction }));
  //   // };

  //   const searchAndFormatedTrans = (
  //     transactionUp: TransactionType | undefined,
  //     form: FormTransaction,
  //     key: KeyTrans,
  //   ) => {
  //     const { transactionId } = transactionUp || { transactionId: '' };
  //     const transactionsByType = transactions[key]
  //       .filter((transaction) => transaction.transactionId === transactionId)
  //       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  //     const initialDate = transactionUp ? transactionUp.date : form.date;
  //     const endDate = transactionsByType.length
  //       ? transactionsByType[0].date : `${year}-${month}-${form.date.split('-')[2]}`;
  //     const dateObj = !transactionUp || transactionUp.installments === 'F'
  //       ? { initialDate, endDate } : undefined;
  //     return formatedTransactions(
  //       form,
  //       dateObj,
  //       transactionId,
  //     );
  //   };

  //   const updateOneFixedTrans = async (
  //     form: FormTransaction,
  //     key: KeyTrans,
  //   ) => {
  //     const { isFixed } = form;
  //     let transactionInVariables = transactions[key]
  //       .find(({ id }) => id === editTransaction);
  //     const newForm: any = { ...form };

  //     delete newForm.accountDestiny;
  //     delete newForm.isFixed;

  //     if (transactionInVariables) {
  //       const formatedTrans: TransactionType = {
  //         ...transactionInVariables,
  //         ...newForm,
  //       };
  //       await update(
  //         { uid, docName: 'transactions', key },
  //         transactions,
  //         formatedTrans,
  //       );
  //     } else {
  //       transactionInVariables = transactions[key]
  //         .find(({ id }) => id === editTransaction);
  //       const formatedTrans: TransactionType = {
  //         ...transactionInVariables,
  //         ...newForm,
  //         installments: isFixed ? 'F' : 'U',
  //       };
  //       await create(
  //         { uid, docName: 'transactions', key },
  //         transactions,
  //         formatedTrans,
  //       );
  //     }
  //   };

  //   const updateOneTrans = async (form: FormTransaction, key: KeyTrans) => {
  //     const newForm: any = { ...form };

  //     delete newForm.accountDestiny;
  //     delete newForm.isFixed;
  //     const transaction = transactions[key]
  //       .find(({ id }) => id === editTransaction);
  //     const formatedTrans: TransactionType = {
  //       ...transaction,
  //       ...newForm,
  //     };
  //     await update(
  //       { uid, docName: 'transactions', key },
  //       transactions,
  //       formatedTrans,
  //     );
  //   };

  //   const updateTransaction2 = async (form: FormTransaction) => {
  //     if (form.type === 'Transferência') {
  //       await analyzeTransfer(form);
  //     }
  //   };

  //   // const updateTransaction = async (
  //   //   form: FormTransaction,
  //   // ) => {
  //   //   const { type, isFixed } = form;
  //   //   const key = keyByType(false)[type];
  //   //   if (form.installments !== 'U' || form.type === TRANSFER_TYPE) {
  //   //     const { value } = form.installments === 'U' && form.type === TRANSFER_TYPE
  //   //       ? { value: 'true' }
  //   //       : await swalUpTrans();
  //   //     const transactionUp = transactions[key]
  //   //       .find(({ id }) => id === editTransaction);

  //   //     if (value === 'true') {
  //   //       const [newTransactions, againstTransactions] = searchAndFormatedTrans(
  //   //         transactionUp,
  //   //         form,
  //   //         key,
  //   //       );

  //   //       return manyUpdate(
  //   //         { uid,
  //   //           docName: 'transactions',
  //   //           transactionId: transactionUp?.transactionId || '' },
  //   //         form,
  //   //         { transactions,
  //   //           newTransactions,
  //   //           againstTransactions,
  //   //           key },
  //   //       );
  //   //     }
  //   //     if (isFixed) {
  //   //       return updateOneFixedTrans(form, key);
  //   //     }
  //   //     await updateOneTrans(form, key);
  //   //   } else {
  //   //     await updateOneTrans(form, key);
  //   //   }
  //   // };

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
    const variableTransactions: TransactionType[] = getByDate(records, true);
    const fixedTransactions: TransactionType[] = getByDate(fixeds);
    const setVariableExpenses = new Set(variableTransactions
      .map(({ transactionId }) => transactionId));
    const fixedFilterTransactions = fixedTransactions
      .filter(({ transactionId }) => !setVariableExpenses.has(transactionId));
    const expensesWithoutTransfers = [...variableTransactions, ...fixedFilterTransactions]
      .filter(({ type }) => type !== TRANSFER_TYPE);
    return [...expensesWithoutTransfers, ...getByDate(transfers)]
      .sort((a: TransactionType, b: TransactionType) => {
        return Number(b.date.split('-')[2]) - Number(a.date.split('-')[2]);
      });
  };

  return { getAllTransactions };
}

// import { useSelector } from 'react-redux';

// import { FormTransaction } from '../types/LocalStates';
// import { swalUpTrans } from '../utils/swal';
// import { StateRedux } from '../types/State';
// import { keyByType } from '../utils/dataModel';
// import { KeyTrans, TransactionType } from '../types/Data';
// import { formatedTransactions } from '../utils/calculates';
// import { filterAndSort } from '../utils/transactions';

// export default function useTransfer() {
//   const { transactions } = useSelector(({ data }: StateRedux) => data);
//   const {
//     monthSelected,
//     newTransaction,
//     editTransaction,
//   } = useSelector(({ operationals }: StateRedux) => operationals);
//   const { month, year } = monthSelected;
//   const { fixedExpenses, variableExpenses, transfers,
//     fixedRevenues, variableRevenues } = transactions;

//   const searchAndFormatedTrans = (
//     transactionUp: TransactionType | undefined,
//     form: FormTransaction,
//     key: KeyTrans,
//   ) => {
//     const { transactionId } = transactionUp || { transactionId: '' };
//     const transactionsByType = filterAndSort(
//       transactions[key],
//       (transaction) => transaction.transactionId === transactionId,
//     );

//     const initialDate = transactionUp ? transactionUp.date : form.date;
//     const endDate = transactionsByType.length
//       ? transactionsByType[0].date : `${year}-${month}-${form.date.split('-')[2]}`;
//     const dateObj = !transactionUp || transactionUp.installments === 'F'
//       ? { initialDate, endDate } : undefined;
//     return formatedTransactions(
//       form,
//       newTransaction,
//       dateObj,
//       transactionId,
//     );
//   };

//   const analyzeTransfer = async (form: FormTransaction) => {
//     const key = keyByType(false)[form.type];
//     if (form.installments === 'U') {

//     }
//     if (form.installments === 'F') {
//       const { value } = await swalUpTrans();
//       const transactionUp = transactions[key]
//         .find(({ id }) => id === editTransaction);

//       if (value === 'true') {
//         const [newTransactions, againstTransactions] = searchFixed(
//           transactionUp,
//           form,
//           key,
//         );
//       }
//     }
//   };
//   return { analyzeTransfer };
// }

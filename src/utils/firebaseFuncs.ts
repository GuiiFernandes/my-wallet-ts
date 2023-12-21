import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types/State';
import { db } from '../services/firebase';
import { banksModel, budgetsModel, configurationsModel,
  investmentsModel, transactionsModel } from './dataModel';
import { AccountType, Banks, TransactionsKeys } from '../types/Data';

// type PrevData<T> = {
//   [key: string]: T[];
// };

// type NewData<T> = {
//   [key: string]: T;
// };

// export type MetaInfos = {
//   uid: string;
//   docName: string;
//   key: KeyTrans;
// };

export type MetaCreateInfos = {
  uid: string;
  docName: string;
  key: TransactionsKeys;
};

// type TransactionsObj = {
//   newTransactions: TransactionType[],
//   againstTransactions: TransactionType[],
//   transactions: TransactionsType,
// };

const addNewUser = async (user: User): Promise<void> => {
  const docRef = doc(db, user.uid, 'transactions');
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await Promise.all([
      setDoc(doc(db, user.uid, 'transactions'), transactionsModel),
      setDoc(doc(db, user.uid, 'investments'), investmentsModel),
      setDoc(doc(db, user.uid, 'banks'), banksModel),
      setDoc(doc(db, user.uid, 'budgets'), budgetsModel),
      setDoc(doc(db, user.uid, 'configurations'), configurationsModel),
    ]);
  }
};

const create = async (
  { uid, docName, key }: MetaCreateInfos,
  prevData: any,
  newData: any,
) => {
  const resultData = {
    ...prevData,
    [key]: [...prevData[key], newData],
  };
  await setDoc(doc(db, uid, docName), resultData);
  return resultData;
};

const bulkCreate = async (
  { uid, docName, key }: MetaCreateInfos,
  prevData: any,
  newData: any,
) => {
  console.log('prevData', prevData, key);

  const resultData = {
    ...prevData,
    [key]: [...prevData[key], ...newData],
  };
  await setDoc(doc(db, uid, docName), resultData);
  return resultData;
};

const bulkUpdate = async (
  { uid, docName, key }: MetaCreateInfos,
  prevData: any,
  newData: any[],
) => {
  const resultData = {
    ...prevData,
    [key]: newData,
  };
  await setDoc(doc(db, uid, docName), resultData);
  return resultData;
};

// const update = async <T, R>(
//   { uid, docName, key }: MetaInfos,
//   prevData: PrevData<T>,
//   newData: NewData<R>,
// ) => {
//   const index = prevData[key].findIndex((item) => {
//     const itemData = item as unknown as any;
//     return itemData.id === newData.id;
//   });
//   const prevDataCopy = [...prevData[key]];
//   prevDataCopy[index] = newData as unknown as T;
//   const resultData = { ...prevData, [key]: prevDataCopy };
//   await setDoc(doc(db, uid, docName), resultData);
//   return resultData;
// };

const remove = async (
  accounts: AccountType[],
  banks: Banks,
  uid: string,
  id: number,
): Promise<void> => {
  const copyAccounts = [...accounts];
  const accountIndex = copyAccounts.findIndex((account) => account.id === id);
  copyAccounts.splice(accountIndex, 1);
  setDoc(doc(db, uid, 'banks'), {
    ...banks,
    accounts: copyAccounts,
  });
};

// const manyCreate = async (
//   form: FormTransaction,
//   { uid, docName }: Omit<MetaInfos, 'key'>,
//   { newTransactions,
//     againstTransactions,
//     transactions } : TransactionsObj,
// ) => {
//   const { type, isFixed } = form;
//   const key = keyByType(isFixed)[type];
//   let resultData = await bulkCreate(
//     { uid, docName, key },
//     transactions,
//     newTransactions,
//   );
//   if (againstTransactions.length) {
//     const transferKey = keyByType(isFixed, true)[type];
//     resultData = await bulkCreate(
//       { uid, docName, key: 'transfers' },
//       resultData,
//       newTransactions.map((transaction, index) => ({
//         ...transaction,
//         account: `${transaction.account}>${againstTransactions[index].account}`,
//       })),
//     );
//     await bulkCreate(
//       { uid, docName, key: transferKey },
//       resultData,
//       againstTransactions,
//     );
//   }
// };

// const manyUpdate = async (
//   { uid, docName, transactionId }: Omit<MetaInfos, 'key'> & { transactionId: string },
//   form: FormTransaction,
//   { newTransactions,
//     againstTransactions,
//     transactions,
//     key } : TransactionsObj & { key: KeyTrans },
// ) => {
//   let resultData = await bulkUpdate(
//     { uid, docName, key },
//     transactions,
//     [
//       ...filterTransactionsByUp(transactions, newTransactions, transactionId, key),
//       ...newTransactions,
//     ],
//   );

//   if (againstTransactions.length) {
//     const transferKey = keyByType(form.isFixed, true)[form.type];
//     resultData = await bulkUpdate(
//       { uid, docName, key: 'transfers' },
//       resultData,
//       [
//         ...filterTransactionsByUp(
//           transactions,
//           againstTransactions,
//           transactionId,
//           'transfers',
//         ),
//         ...newTransactions.map((transaction, index) => ({
//           ...transaction,
//           account: `${transaction.account}>${againstTransactions[index].account}`,
//         })),
//       ],
//     );
//     await bulkUpdate(
//       { uid, docName, key: transferKey },
//       resultData,
//       [
//         ...filterTransactionsByUp(
//           transactions,
//           againstTransactions,
//           transactionId,
//           transferKey,
//         ),
//         ...againstTransactions,
//       ],
//     );
//   }
// };

// const filterTransactionsByUp = (
//   transactions: TransactionsType,
//   newTransArray: TransactionType[],
//   transactionId: string,
//   key: KeyTrans,
// ) => transactions[key]
//   .filter((transaction) => {
//     const transParcel = Number(transaction.installments.split('/')[0]);
//     const newTransParcel = Number(newTransArray[0].installments.split('/')[0]);
//     const diffId = transaction.transactionId !== transactionId;
//     return diffId || transParcel < newTransParcel;
//   });

export default {
  addNewUser,
  remove,
  create,
  // update,
  bulkCreate,
  bulkUpdate,
  // manyCreate,
  // manyUpdate,
};

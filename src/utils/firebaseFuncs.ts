import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types/State';
import { db } from '../services/firebase';
import { banksModel, budgetsModel, configurationsModel,
  investmentsModel, transactionsModel } from './dataModel';
import { AccountType, Banks, TransactionType } from '../types/Data';

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

export type MetaCreateInfos<T> = {
  uid: string;
  docName: string;
  key: T;
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

const update = async <T>(
  { uid, docName, key }: MetaCreateInfos<T>,
  newData: any,
) => {
  if (typeof key !== 'string') throw new Error('Key must be a string');
  const resultData = {
    [key]: newData,
  };
  await updateDoc(doc(db, uid, docName), resultData);
  return resultData;
};

// const bulkUpdate = async <T>(
//   { uid, docName, key }: MetaCreateInfos<T>,
//   newData: any[],
// ) => {
//   if (typeof key !== 'string') throw new Error('Key must be a string');
//   const resultData = {
//     [key]: newData,
//   };
//   await updateDoc(doc(db, uid, docName), resultData);
//   return resultData;
// };

const updateBalance = async (
  uid: string,
  prevAccounts: AccountType[],
  transactions: TransactionType[],
) => {
  const mult = {
    Despesa: -1,
    Receita: 1,
    Transferência: 0,
    Investimento: 0,
  };
  const accounts = [...prevAccounts];
  transactions.forEach(({ account, value, type }) => {
    const accountIndex = accounts.findIndex((acc) => acc.name === account);
    if (accountIndex === -1) throw new Error('Conta não encontrada');
    const copyAccount = { ...accounts[accountIndex] };
    copyAccount.balance += (value * mult[type]);
    accounts[accountIndex] = copyAccount;
  });
  const newData = { accounts };
  await updateDoc(doc(db, uid, 'banks'), newData);
  return newData;
};

// const searchRecordAndUpdate = async <T>(
//   { uid, docName, key }: MetaCreateInfos<T>,
//   prevData: any,
//   newData: any,
// ) => {

// };

// const update = async <T, R>(
//   { uid, docName, key }: MetaCreateInfos<T>,
//   prevData: any,
//   newData: any,
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
  update,
  updateBalance,
  // update,
  // bulkUpdate,
  // manyCreate,
  // manyUpdate,
};

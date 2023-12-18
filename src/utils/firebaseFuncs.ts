import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types/State';
import { db } from '../services/firebase';
import { banksModel, budgetsModel, configurationsModel,
  investmentsModel, keyByType, transactionsModel } from './dataModel';
import { AccountType, Banks, KeyTrans,
  TransactionType, TransactionsType } from '../types/Data';
import { FormTransaction } from '../types/LocalStates';

type PrevData<T> = {
  [key: string]: T[];
};

type NewData<T> = {
  [key: string]: T;
};

type MetaInfos = {
  uid: string;
  docName: string;
  key: KeyTrans;
};

type TransactionsObj = {
  newTransactions: TransactionType[],
  againstTransactions: TransactionType[],
  transactions: TransactionsType,
};

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

const create = async <T, R>(
  { uid, docName, key }: MetaInfos,
  prevData: PrevData<T>,
  newData: NewData<R>,
) => {
  await setDoc(doc(db, uid, docName), {
    ...prevData,
    [key]: [...prevData[key], newData],
  });
};

const bulkCreate = async <T, R>(
  { uid, docName, key }: MetaInfos,
  prevData: PrevData<T>,
  newData: NewData<R>[],
) => {
  await setDoc(doc(db, uid, docName), {
    ...prevData,
    [key]: [...prevData[key], ...newData],
  });
};

const bulkUpdate = async <T, R>(
  { uid, docName, key }: MetaInfos,
  prevData: PrevData<T>,
  newData: NewData<R>[],
) => {
  await setDoc(doc(db, uid, docName), {
    ...prevData,
    [key]: newData,
  });
};

const update = async <T, R>(
  { uid, docName, key }: MetaInfos,
  prevData: PrevData<T>,
  newData: NewData<R>,
) => {
  const index = prevData[key].findIndex((item) => {
    const itemData = item as unknown as any;
    return itemData.id === newData.id;
  });
  const prevDataCopy = [...prevData[key]];
  prevDataCopy[index] = newData as unknown as T;
  await setDoc(doc(db, uid, docName), {
    ...prevData,
    [key]: prevDataCopy,
  });
};

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

const manyCreate = async (
  form: FormTransaction,
  { uid, docName }: Omit<MetaInfos, 'key'>,
  { newTransactions,
    againstTransactions,
    transactions } : TransactionsObj,
) => {
  const { type, isFixed } = form;
  await Promise.all([
    bulkCreate(
      {
        uid,
        docName,
        key: keyByType(isFixed)[type],
      },
      transactions,
      newTransactions,
    ),
    againstTransactions.length ? bulkCreate(
      {
        uid,
        docName,
        key: keyByType(isFixed, true)[type],
      },
      transactions,
      againstTransactions,
    ) : null,
  ]);
};

export { addNewUser, remove, create, update, bulkCreate, bulkUpdate, manyCreate };

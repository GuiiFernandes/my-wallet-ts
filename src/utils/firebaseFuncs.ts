import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types/State';
import { db } from '../services/firebase';
import { banksModel, budgetsModel,
  investmentsModel, transactionsModel } from './dataModel';
import { AccountType, Banks } from '../types/Data';

const addNewUser = async (user: User): Promise<void> => {
  const docRef = doc(db, user.uid, 'transactions');
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await Promise.all([
      setDoc(doc(db, user.uid, 'transactions'), transactionsModel),
      setDoc(doc(db, user.uid, 'investments'), investmentsModel),
      setDoc(doc(db, user.uid, 'banks'), banksModel),
      setDoc(doc(db, user.uid, 'budgets'), budgetsModel),
    ]);
  }
};

const removeAccount = async (
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

export { addNewUser, removeAccount };

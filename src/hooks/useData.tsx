import { useDispatch, useSelector } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { changeOperationls } from '../redux/reducers/operationals';
import { DeleteAccountType, StateRedux } from '../types/State';

type Account = {
  id: number;
  name: string;
};

export default function useData() {
  const dispatch = useDispatch();
  const { banks, transactions } = useSelector(({ data }: StateRedux) => data);
  const { changeAccount } = useSelector(({ operationals }: StateRedux) => operationals);
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { accounts } = banks;
  const { revenue, fixedExpense, variableExpense } = transactions;
  const allTransactions = [
    ...Object.values(revenue),
    ...Object.values(fixedExpense),
    ...Object.values(variableExpense),
  ];

  const deleteAccount = async ({ id, name }: Account) => {
    const haveTransaction = allTransactions.some(({ account }) => account === name);
    if (haveTransaction) {
      dispatch(changeOperationls<DeleteAccountType>({ changeAccount: !changeAccount }));
    } else {
      const accountIndex = accounts.findIndex((account) => account.id === id);
      setDoc(doc(db, uid, 'banks'), {
        ...banks,
        accounts: [...accounts].splice(accountIndex, 1),
      });
    }
  };

  return { deleteAccount };
}

import { useDispatch, useSelector } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { changeOperationls } from '../redux/reducers/operationals';
import { DeleteAccountType, NewAccountType, StateRedux } from '../types/State';
import { Options, swalRemove } from '../utils/swal';
import { removeAccount } from '../utils/firebaseFuncs';
import { RemoveAccountParams } from '../types/Functions';
import { FormAccount, RealForm } from '../types/LocalStates';

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

  const createAccount = async (form: FormAccount) => {
    const balanceNumber = Number(
      form.balance.substring(2).replace('.', '').replace(',', '.'),
    );
    const newAccount = {
      id: accounts.length ? accounts[accounts.length - 1].id + 1 : 0,
      name: `${form.name[0].toLocaleUpperCase()}${form.name.substring(1)}`,
      balance: balanceNumber,
      real: balanceNumber,
      type: form.type,
    };
    await setDoc(doc(db, uid, 'banks'), {
      ...banks,
      accounts: [...accounts, newAccount],
    });
    dispatch(changeOperationls<NewAccountType>({ newAccount: false }));
  };

  const deleteAccount = async ({ id, name }: Account) => {
    const haveTransaction = allTransactions.some(({ account }) => account === name);
    if (haveTransaction) {
      dispatch(changeOperationls<DeleteAccountType>({ changeAccount: !changeAccount }));
    } else {
      const options: Options = {
        title: 'Deletar',
        text: `Deseja deletar a conta ${name}? Essa ação não tem retorno`,
        icon: 'warning',
      };
      swalRemove<RemoveAccountParams, void>(
        removeAccount,
        options,
        accounts,
        banks,
        uid,
        id,
      );
    }
  };

  const saveReal = async (id: number, name: string, realForm: RealForm) => {
    const accountsChanged = [...accounts];
    const indexAccount = accountsChanged.findIndex((account) => account.id === id);
    if (indexAccount !== -1) {
      accountsChanged[indexAccount].real = Number(realForm[name]);
    }
    await setDoc(doc(db, uid, 'banks'), {
      ...banks,
      accounts: accountsChanged,
    });
  };

  return { deleteAccount, saveReal, createAccount };
}

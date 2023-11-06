import { useDispatch, useSelector } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { changeOperationls } from '../redux/reducers/operationals';
import { DeleteAccountType, NewAccountType, StateRedux } from '../types/State';
import { Options, swalRemove, toast } from '../utils/swal';
import { create, remove } from '../utils/firebaseFuncs';
import { RemoveAccountParams } from '../types/Functions';
import { FormAccount, RealForm } from '../types/LocalStates';

type Account = {
  id: number;
  name: string;
};

export default function useLogin() {
  const dispatch = useDispatch();
  const { banks, transactions } = useSelector(({ data }: StateRedux) => data);
  const { changeAccount } = useSelector(({ operationals }: StateRedux) => operationals);
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { accounts } = banks;
  const { variableRevenues, fixedRevenues,
    fixedExpenses, variableExpenses } = transactions;
  const allTransactions = [...variableRevenues, ...fixedRevenues,
    ...fixedExpenses, ...variableExpenses];

  const createAccount = async (form: FormAccount) => {
    const haveAccount = accounts.some(({ name }) => name === form.name);
    if (haveAccount) {
      toast.fire({
        icon: 'error',
        title: 'Já existe uma conta com esse nome',
      });
      return;
    }
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
    await create({ uid, docName: 'banks', key: 'accounts' }, banks, newAccount);
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
        remove,
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
    console.log(accountsChanged, indexAccount);
    if (indexAccount !== -1) {
      const account = { ...accountsChanged[indexAccount] };
      account.real = Number(realForm[name]);
      accountsChanged[indexAccount] = account;
    }
    await setDoc(doc(db, uid, 'banks'), {
      ...banks,
      accounts: accountsChanged,
    });
  };

  return { deleteAccount, saveReal, createAccount };
}

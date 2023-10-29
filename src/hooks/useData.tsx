import { useDispatch, useSelector } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { changeOperationls } from '../redux/reducers/operationals';
import { DeleteAccountType, StateRedux } from '../types/State';
import { Options, swalRemove } from '../utils/swal';
import { removeAccount } from '../utils/firebaseFuncs';
import { RemoveAccountParams } from '../types/Functions';

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

  return { deleteAccount };
}

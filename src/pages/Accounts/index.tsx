import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useLogin from '../../hooks/useLogin';
import { NewAccountType, StateRedux } from '../../types/State';
import styles from './accounts.module.css';
import { changeOperationls } from '../../redux/reducers/operationals';
import AccountTable from '../../components/Tables/AccountTable';

export default function Accounts() {
  const { validateLogin } = useLogin();
  const dispatch = useDispatch();
  const { banks } = useSelector(({ data }: StateRedux) => data);
  const { newAccount } = useSelector(({ operationals }: StateRedux) => operationals);
  const { accounts } = banks;

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
    <>
      { !accounts.length ? (
        <h3>Cadastre sua primeira conta.</h3>
      ) : (
        <AccountTable />
      )}
      <button
        className={ styles.manage }
        type="button"
        onClick={
            () => dispatch(changeOperationls<NewAccountType>({ newAccount: !newAccount }))
          }
      >
        Nova Conta
      </button>
    </>
  );
}

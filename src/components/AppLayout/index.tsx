import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import useLogin from '../../hooks/useLogin';
import styles from './AppLayout.module.css';
import Header from '../Header';
import { StateRedux } from '../../types/State';
import NewAccount from '../Forms/NewAccount';
import NewTransaction from '../Forms/NewTransaction';
import NewCategory from '../Forms/NewCategory';

export default function AppLayout() {
  const { listenerData } = useLogin();
  const userLogged = useSelector(({ user }: StateRedux) => user);
  const {
    newAccount,
    newTransaction,
    editTransaction,
    newCategory,
  } = useSelector(({ operationals }: StateRedux) => operationals);

  useEffect(() => {
    listenerData();
  }, [userLogged]);

  return (
    <main className={ styles.background }>
      <div className={ styles.header }>
        <Header />
      </div>
      <section className={ styles.containerMain }>
        <Outlet />
      </section>
      { newAccount && (
        <NewAccount />
      )}
      { (newTransaction || editTransaction) && (
        <NewTransaction />
      )}
      { newCategory && (
        <NewCategory />
      )}
    </main>
  );
}

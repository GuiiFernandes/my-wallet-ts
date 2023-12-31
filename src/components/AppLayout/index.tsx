import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import useFirebase from '../../hooks/useFirebase';
import styles from './AppLayout.module.css';
import Header from '../Header';
import { StateRedux } from '../../types/State';
import NewAccount from '../Forms/NewAccount';

export default function AppLayout() {
  const { listenerData } = useFirebase();
  const userLogged = useSelector(({ user }: StateRedux) => user);
  const { newAccount } = useSelector(({ operationals }: StateRedux) => operationals);

  useEffect(() => {
    listenerData();
  }, [userLogged]);

  return (
    <main className={ styles.background }>
      <div className={ styles.header }>
        <Header />
      </div>
      <div className={ styles.containerMain }>
        <Outlet />
      </div>
      { newAccount && (
        <NewAccount />
      )}
    </main>
  );
}

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';

import { set } from 'firebase/database';
import useLogin from '../../hooks/useLogin';
import { db } from '../../services/firebase';
import styles from './accounts.module.css';
import { StateRedux } from '../../types';
import NewAccount from '../../components/NewAccount';

export default function Accounts() {
  const [data, setData] = useState([]);
  const [newAccount, setNewAccount] = useState(false);
  const { validateLogin } = useLogin();
  const userLogged = useSelector(({ user }: StateRedux) => user);

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  useEffect(() => {
    if (!userLogged.uid) return;
    (async () => {
      const docRef = doc(db, userLogged.uid, 'banks');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { accounts } = docSnap.data();
        setData(accounts);
      }
    })();
  }, [userLogged]);

  return (
    <>
      <section className={ styles.container }>
        { !data.length ? (
          <p>Não há contas cadastradas.</p>
        ) : data.map(({ name, balance }) => (
          <div className={ styles.card } key={ name }>
            <h3 className={ styles.cardTitle }>{ name }</h3>
            <p className={ styles.cardValue }>{ balance }</p>
          </div>
        ))}
        <button
          className={ styles.manage }
          type="button"
          onClick={ () => setNewAccount(!newAccount) }
        >
          Nova Conta
        </button>
      </section>
      { newAccount && (
        <NewAccount />
      )}
    </>
  );
}

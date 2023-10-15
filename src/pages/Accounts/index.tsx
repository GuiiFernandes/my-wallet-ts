import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';

import useFirebase from '../../hooks/useFirebase';
import NewAccount from '../../components/NewAccount';
import { StateRedux } from '../../types/State';
import styles from './accounts.module.css';

export default function Accounts() {
  const [newAccount, setNewAccount] = useState(false);
  const { validateLogin, listenerData } = useFirebase();
  const { accounts } = useSelector(({ data: { banks } }: StateRedux) => banks);

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
    <>
      <section className={ styles.container }>
        { !accounts.length ? (
          <p>Não há contas cadastradas.</p>
        ) : accounts.map(({ name, balance }) => (
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

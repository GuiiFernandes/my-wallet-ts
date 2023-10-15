import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';

import useFirebase from '../../hooks/useFirebase';
import NewAccount from '../../components/Forms/NewAccount';
import { NewAccountType, StateRedux } from '../../types/State';
import styles from './accounts.module.css';
import { changeOperationls } from '../../redux/reducers/operationals';

export default function Accounts() {
  const { validateLogin } = useFirebase();
  const dispatch = useDispatch();
  const { accounts } = useSelector(({ data: { banks } }: StateRedux) => banks);
  const { newAccount } = useSelector(({ operationals }: StateRedux) => operationals);

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
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
        onClick={
            () => dispatch(changeOperationls<NewAccountType>({ newAccount: !newAccount }))
          }
      >
        Nova Conta
      </button>
    </section>
  );
}

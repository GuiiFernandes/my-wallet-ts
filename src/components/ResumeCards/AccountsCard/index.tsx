import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from '../card.module.css';
import { StateRedux } from '../../../types/State';

export default function AccountsCard() {
  const { accounts } = useSelector(({ data: { banks } }: StateRedux) => banks);

  return (
    <section className={ styles.container }>
      <h2 className={ styles.title }>Contas</h2>
      <div className={ styles.cards }>
        { !accounts.length ? (
          <p>Não há contas cadastradas.</p>
        ) : accounts.map(({ name, balance }) => (
          <div className={ styles.card } key={ name }>
            <h3 className={ styles.cardTitle }>{ name }</h3>
            <p className={ styles.cardValue }>{ balance }</p>
          </div>
        ))}
      </div>
      <Link to="/contas" className={ styles.manage }>
        {accounts.length ? 'Gerenciar' : 'Cadastrar'}
      </Link>
    </section>
  );
}

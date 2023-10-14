import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

import { useSelector } from 'react-redux';
import { db } from '../../../services/firebase';
import styles from '../card.module.css';

export default function Accounts() {
  const [data, setData] = useState([]);
  const { uid } = useSelector(({ user }) => user);

  useEffect(() => {
    (async () => {
      const docRef = doc(db, uid, 'banks');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { accounts } = docSnap.data();
        setData(accounts);
      }
    })();
  }, []);

  return (
    <section className={ styles.container }>
      <h2 className={ styles.title }>Contas</h2>
      <div className={ styles.cards }>
        { !data.length ? (
          <p>Não há contas cadastradas.</p>
        ) : data.map(({ name, balance }) => (
          <div className={ styles.card } key={ name }>
            <h3 className={ styles.cardTitle }>{ name }</h3>
            <p className={ styles.cardValue }>{ balance }</p>
          </div>
        ))}
      </div>
      <button className={ styles.manage }>
        {data.length ? 'Gerenciar' : 'Cadastrar'}
      </button>
    </section>
  );
}

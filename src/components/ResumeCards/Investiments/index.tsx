import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '../../../services/firebase';
import { investmentsModel } from '../../../utils/dataModel';
import styles from '../card.module.css';

export default function Investiments() {
  const [data, setData] = useState(investmentsModel);
  const { uid } = useSelector(({ user }) => user);

  useEffect(() => {
    (async () => {
      const docRef = doc(db, uid, 'banks');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { investiments } = docSnap.data();
        setData(investiments);
      }
    })();
  }, []);

  return (
    <section className={ styles.container }>
      <h2 className={ styles.title }>Investimentos</h2>
      <div className={ styles.cards }>
        { Object.keys(data).map((key) => (
          <div key={ key }>
            <h3>{key}</h3>
            { data[key]
              .reduce(({ value }) => type === 'national')
              // <div key={ subKey }>
              //   <h4>{subKey}</h4>
              //   { data[key][subKey].lenght && (
              //     data[key][subKey].map(({ name, balance }) => (
              //       <div className={ styles.card } key={ name }>
              //         <h3 className={ styles.cardTitle }>{ name }</h3>
              //         <p className={ styles.cardValue }>{ balance }</p>
              //       </div>
              //     ))
              //   )}
              // </div>
            ))}
          </div>
        ))}
      </div>
      <button className={ styles.manage }>
        {data.national.length || data.international.length ? 'Gerenciar' : 'Cadastrar'}
      </button>
    </section>
  );
}

// import { useSelector } from 'react-redux';

// import styles from '../card.module.css';

// export default function Cards() {
//   const { uid } = useSelector(({ user }) => user);

//   return (
//     <section className={ styles.container }>
//       <h2 className={ styles.title }>Investimentos</h2>
//       <div className={ styles.cards }>
//         { !data.length ? (
//           <p>Não há investimentos cadastradas.</p>
//         ) : data.map(({ name, balance }) => (
//           <div className={ styles.card } key={ name }>
//             <h3 className={ styles.cardTitle }>{ name }</h3>
//             <p className={ styles.cardValue }>{ balance }</p>
//           </div>
//         ))}
//       </div>
//       <button className={ styles.manage }>
//         {data.length ? 'Gerenciar' : 'Cadastrar'}
//       </button>
//     </section>
//   );
// }

// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { doc, getDoc } from 'firebase/firestore';

// import { NumericFormat } from 'react-number-format';
// import { db } from '../../../services/firebase';
// import { typesInvestModel, investmentsModel } from '../../../utils/dataModel';
// import styles from '../card.module.css';
// import { InvestimentsType } from '../../../types/State';

// const locale = ['nacional', 'internacional'];

// export default function Investiments() {
//   const [data, setData] = useState(investmentsModel);
//   const { uid } = useSelector(({ user }) => user);

//   useEffect(() => {
//     (async () => {
//       const docRef = doc(db, uid, 'banks');
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const { investiments } = docSnap.data() as { investiments: InvestimentsType };
//         setData(investiments);
//       }
//     })();
//   }, []);

//   return (
//     <section className={ styles.container }>
//       <h2 className={ styles.title }>Investimentos</h2>
//       <div className={ styles.cards }>
//         { locale.map((key) => (
//           <div className={ styles.cardType } key={ key }>
//             <h3>{key[0].toUpperCase() + key.substring(1)}</h3>
//             <table>
//               <thead>
//                 <tr className={ styles.cardLine }>
//                   <th>Tipo</th>
//                   <th>Valor Compra</th>
//                   <th>Valor Atual</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 { typesInvestModel.map(({ name, title }) => (
//                   <tr key={ name } className={ styles.cardLine }>
//                     <td>
//                       <h4 className={ styles.cardTitle }>{ title }</h4>
//                     </td>
//                     <td className={ styles.cardValue }>
//                       <NumericFormat
//                         className="value-total"
//                         value={
//                           data[key].length
//                             ? data[key].reduce((sum, asset) => {
//                               if (asset.type === name) return sum + asset.buyValue;
//                               return sum;
//                             }, 0)
//                             : 0
//                         }
//                         allowNegative={ false }
//                         displayType="text"
//                         decimalScale={ 2 }
//                         fixedDecimalScale
//                         decimalSeparator=","
//                         prefix="R$"
//                         thousandSeparator="."
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))}
//       </div>
//       <button className={ styles.manage }>
//         Gerenciar
//       </button>
//     </section>
//   );
// }

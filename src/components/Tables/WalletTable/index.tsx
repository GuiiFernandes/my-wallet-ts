import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { NumericFormat } from 'react-number-format';
import { AiFillEdit } from 'react-icons/ai';

import { changeOperationls } from '../../../redux/reducers/operationals';
import { TransactionType } from '../../../types/Data';
import styleGlobal from '../table.module.css';
import styleTable from './walleTable.module.css';
import useTransaction from '../../../hooks/useTransaction';
import { StateRedux } from '../../../types/State';

const styles = { ...styleGlobal, ...styleTable };

const HEADERS = ['Venc', 'PG Data', 'Descrição', 'Valor',
  'Parcelas', 'Categoria', 'Subcategoria', 'Conta', 'Tipo'];

const colors = {
  Receita: 'var(--light-green)',
  Despesa: 'var(--light-red)',
  Transferência: 'var(--light-gray)',
  Investimento: 'var(--blue)',
};

const gradient1 = 'linear-gradient(90deg,';
const gradient2 = 'rgba(121, 199, 197,0) 0%,';
const gradient3 = 'rgba(121, 199, 197,0.2) 7.5%,';
const gradient4 = 'rgba(121, 199, 197,0.2) 92.5%,';
const gradient5 = 'rgba(121, 199, 197,0) 100%)';
const gradient = `${gradient1} ${gradient2} ${gradient3} ${gradient4} ${gradient5}`;

const verifyInstallments = new Set(['U', 'F']);

export default function WalletTable() {
  const dispatch = useDispatch();
  const { monthSelected } = useSelector(({ operationals }: StateRedux) => operationals);
  const { month, year } = monthSelected;
  const { getAllTransactions } = useTransaction();

  const allTransactions: TransactionType[] = getAllTransactions();

  if (!allTransactions.length) {
    return (
      <h3>Lance sua primeria transação.</h3>
    );
  }

  return (
    <table className={ styles.container }>
      <thead className={ styles.tHead }>
        <tr className={ styles.card }>
          {HEADERS.map((header) => (
            <th
              className={ styles.th }
              key={ header }
            >
              { header }
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={ styles.tbody }>
        {allTransactions.map((transaction) => {
          const { payday, id, date, description, account, value,
            type, installment, installments, category, subCategory } = transaction;
          const [, , day] = date.split('-').map((number) => Number(number));
          const editDate = `${year}-${month < 10 ? '0' : ''}${month}-${day}`;
          return (
            <tr
              className={ styles.card }
              key={ id }
              style={ editDate === format(new Date(), 'yyyy-MM-dd')
                ? {
                  background: gradient,
                } : {} }
            >
              <td
                className={ styles.td }
                style={ { fontWeight: 'bold' } }
              >
                { Number(date.split('-')[2]) }
              </td>
              <td
                className={ styles.td }
                style={ {
                  fontWeight: 'bold',
                  color: payday ? 'var(--light-green)' : 'var(--light-red)',
                } }
              >
                { payday
                  ? format(new Date(`${payday}T00:00`), 'dd/MM/yyyy')
                  : '-'}
              </td>
              <td className={ styles.td }>
                { description }
              </td>
              <td className={ styles.td }>
                <NumericFormat
                  value={ value }
                  allowNegative={ false }
                  displayType="text"
                  decimalScale={ 2 }
                  fixedDecimalScale
                  decimalSeparator=","
                  prefix="R$"
                  thousandSeparator="."
                  style={ {
                    color: colors[type],
                    fontWeight: 'bold',
                  } }
                />
              </td>
              <td className={ styles.td }>
                { installment
                  && !verifyInstallments.has(installments)
                  ? `${installment}/${installments}`
                  : installments }
              </td>
              <td className={ styles.td }>{ category }</td>
              <td className={ styles.td }>{ subCategory }</td>
              <td className={ styles.td }>{ account }</td>
              <td
                className={ styles.td }
                style={ { color: colors[type] } }
              >
                { type === 'Transferência' ? 'Transf' : type }
              </td>
              <td className={ styles.tdBtn }>
                <button
                  type="button"
                  className={ styles.btnEdit }
                  onClick={ () => {
                    dispatch(changeOperationls({
                      editTransaction: transaction,
                    }));
                  } }
                >
                  <AiFillEdit />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { NumericFormat } from 'react-number-format';
import { AiFillEdit } from 'react-icons/ai';

import { changeOperationls } from '../../../redux/reducers/operationals';
import { TransactionType } from '../../../types/Data';
import styleGlobal from '../table.module.css';
import styleTable from './walleTable.module.css';
import useTransaction from '../../../hooks/useTransaction';

const styles = { ...styleGlobal, ...styleTable };

const colors = {
  Receita: 'var(--light-green)',
  Despesa: 'var(--light-red)',
  Transferência: 'var(--light-gray)',
  Investimento: 'var(--blue)',
};

const verifyInstallments = new Set(['U', 'F']);

export default function WalletTable() {
  const dispatch = useDispatch();
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
          <td className={ styles.td }>Venc</td>
          <td className={ styles.td }>PG Data</td>
          <td className={ styles.td }>Descrição</td>
          <td className={ styles.td }>Valor</td>
          <td className={ styles.td }>Parcelas</td>
          <td className={ styles.td }>Categoria</td>
          <td className={ styles.td }>Subcategoria</td>
          <td className={ styles.td }>Conta</td>
          <td className={ styles.td }>Tipo</td>
        </tr>
      </thead>
      <tbody className={ styles.container }>
        {allTransactions.map((transaction) => {
          const { payday, id, date, description, account, value, transactionId,
            type, installment, installments, category, subCategory } = transaction;
          return (
            <tr className={ styles.card } key={ id }>
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

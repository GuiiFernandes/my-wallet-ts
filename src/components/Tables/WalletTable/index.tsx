import { useSelector } from 'react-redux';
import { NumericFormat } from 'react-number-format';
import { AiFillEdit } from 'react-icons/ai';

import { StateRedux } from '../../../types/State';
import { TransactionType } from '../../../types/Data';
import styleGlobal from '../table.module.css';
import styleTable from './walleTable.module.css';

const styles = { ...styleGlobal, ...styleTable };

const colors = {
  Receita: 'var(--light-green)',
  Despesa: 'var(--light-red)',
  Transferência: 'var(--light-blue)',
  Investimento: 'var(--light-yellow)',
};

export default function WalletTable() {
  const { transactions } = useSelector(({ data }: StateRedux) => data);
  const operationals = useSelector((state : StateRedux) => state.operationals);
  const { variableRevenues, fixedRevenues,
    fixedExpenses, variableExpenses } = transactions;

  const allTransactions: TransactionType[] = [
    ...variableRevenues.filter(({ dueDate }) => {
      return new Date(dueDate).getMonth() + 1 === operationals.monthSelected.month;
    }),
    ...fixedRevenues,
    ...fixedExpenses,
    ...variableExpenses
      .filter(({ dueDate }) => {
        console.log(new Date(dueDate).getMonth() + 1);

        return new Date(dueDate).getMonth() + 1 === operationals.monthSelected.month;
      }),
  ].sort((a: TransactionType, b: TransactionType) => {
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });

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
          <td className={ styles.td }>Pagamento</td>
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
        {allTransactions.map((transaction) => (
          <tr className={ styles.card } key={ transaction.id }>
            <td
              className={ styles.td }
              style={ { fontWeight: 'bold' } }
            >
              { new Date(transaction.dueDate).getDate() }
            </td>
            <td
              className={ styles.td }
              style={ {
                fontWeight: 'bold',
                color: transaction.payday ? 'var(--light-green)' : 'var(--light-red)',
              } }
            >
              {
                transaction.payday
                  ? new Date(transaction.payday).toLocaleDateString()
                  : 'Não Pago'
              }
            </td>
            <td className={ styles.td }>
              { transaction.description }
            </td>
            <td className={ styles.td }>
              <NumericFormat
                value={ transaction.value }
                allowNegative={ false }
                displayType="text"
                decimalScale={ 2 }
                fixedDecimalScale
                decimalSeparator=","
                prefix="R$"
                thousandSeparator="."
                style={ {
                  color: colors[transaction.type],
                  fontWeight: 'bold',
                } }
              />
            </td>
            <td className={ styles.td }>{ transaction.installments }</td>
            <td className={ styles.td }>{ transaction.category }</td>
            <td className={ styles.td }>{ transaction.subCategory }</td>
            <td className={ styles.td }>{ transaction.account }</td>
            <td
              className={ styles.td }
              style={ { color: colors[transaction.type] } }
            >
              { transaction.type }
            </td>
            <td className={ styles.tdBtn }>
              <button
                type="button"
                className={ styles.btnEdit }
                onClick={ () => console.log('oi') }
              >
                <AiFillEdit />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useSelector } from 'react-redux';

import { StateRedux } from '../../types/State';
import { TransactionType } from '../../types/Data';

export default function WalletTable() {
  const { transactions } = useSelector(({ data }: StateRedux) => data);
  const operationals = useSelector((state : StateRedux) => state.operationals);
  const { revenue, fixedExpense, variableExpense } = transactions;

  const allTransactions: TransactionType[] = [
    ...revenue,
    ...fixedExpense,
    ...variableExpense
      .filter(({ date }) => {
        return new Date(date).getMonth() + 1 === operationals.monthSelected.month;
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
    <table>
      <thead>
        <tr>
          <td>Data</td>
          <td>Vencimento</td>
          <td>Pagamento</td>
          <td>Descrição</td>
          <td>Valor</td>
          <td>Conta</td>
          <td>Tipo</td>
          <td>Categoria</td>
          <td>Subcategoria</td>
          <td>Parcelas</td>
        </tr>
      </thead>
      <tbody>
        {allTransactions.map((transaction) => (
          <tr key={ transaction.id }>
            <td>{ transaction.date }</td>
            <td>{ transaction.dueDate }</td>
            <td>{ transaction.payday }</td>
            <td>{ transaction.description }</td>
            <td>{ transaction.value }</td>
            <td>{ transaction.account }</td>
            <td>{ transaction.type }</td>
            <td>{ transaction.category }</td>
            <td>{ transaction.subCategory }</td>
            <td>{ transaction.installments }</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useSelector } from 'react-redux';

import { StateRedux } from '../../types/State';
import { TransactionType } from '../../types/Data';

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
    <table>
      <thead>
        <tr>
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
            <td>{ new Date(transaction.dueDate).getDate() }</td>
            <td>
              {
                transaction.payday
                  ? new Date(transaction.payday).toLocaleDateString()
                  : 'Não Pago'
              }
            </td>
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

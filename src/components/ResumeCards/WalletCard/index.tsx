import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

import styles from '../card.module.css';
import { StateRedux } from '../../../types/State';

export default function WalletCard() {
  const { records, transfers } = useSelector(({
    data: { transactions },
  }: StateRedux) => transactions);
  const transfersTransId = new Set(transfers.map(({ transactionId }) => transactionId));
  const revenues = records.filter(({ type, transactionId }) => type === 'Receita'
  && !transfersTransId.has(transactionId));
  const expenses = records.filter(({ type, transactionId }) => type === 'Despesa'
  && !transfersTransId.has(transactionId));
  const revenuesSum = revenues.reduce((acc, { value }) => acc + value, 0);
  const expensesSum = expenses.reduce((acc, { value }) => acc + value, 0);

  return (
    <section className={ styles.container }>
      <h2 className={ styles.title }>Carteira</h2>
      <div className={ styles.cards }>
        <div
          className={ styles.card }
        >
          <h3>Receitas</h3>
          <NumericFormat
            value={ revenuesSum }
            displayType="text"
            decimalScale={ 2 }
            fixedDecimalScale
            decimalSeparator=","
            prefix="R$"
            thousandSeparator="."
            style={ revenuesSum > 0
              ? { color: 'var(--light-green)' } : { color: 'var(--white)' } }
          />
        </div>
      </div>
      <div className={ styles.cards }>
        <div
          className={ styles.card }
        >
          <h3>Despesas</h3>
          <NumericFormat
            value={ expensesSum }
            displayType="text"
            decimalScale={ 2 }
            fixedDecimalScale
            decimalSeparator=","
            prefix="R$"
            thousandSeparator="."
            style={ expensesSum > 0
              ? { color: 'var(--light-red)' } : { color: 'var(--white)' } }
          />
        </div>
      </div>
      <div className={ styles.cards }>
        <div
          className={ styles.card }
        >
          <h3>Saldo</h3>
          <NumericFormat
            value={ revenuesSum - expensesSum }
            displayType="text"
            decimalScale={ 2 }
            fixedDecimalScale
            decimalSeparator=","
            prefix="R$"
            thousandSeparator="."
            style={ revenuesSum - expensesSum < 0
              ? { color: 'var(--light-red)' } : { color: 'var(--light-green)' } }
          />
        </div>
      </div>
      <Link to="/carteira" className={ styles.manage }>
        Carteira
      </Link>
    </section>
  );
}

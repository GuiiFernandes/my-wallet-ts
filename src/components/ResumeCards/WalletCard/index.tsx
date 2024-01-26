import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import styles1 from '../card.module.css';
import styles2 from './walletCard.module.css';
import { StateRedux } from '../../../types/State';
import { TransactionType } from '../../../types/Data';

const styles = { ...styles1, ...styles2 };

export default function WalletCard() {
  const yearNow = new Date().getFullYear();
  const [year, setYear] = useState(yearNow);
  const { records, transfers } = useSelector(({
    data: { transactions },
  }: StateRedux) => transactions);
  const transfersTransId = new Set(transfers.map(({ transactionId }) => transactionId));
  const filterConditions = (
    { type, transactionId, payday, date }: TransactionType,
    typeCompare: 'Receita' | 'Despesa',
  ) => type === typeCompare && !transfersTransId.has(transactionId)
  && payday && new Date(date).getFullYear() === year;
  const revenues = records
    .filter((transaction) => filterConditions(transaction, 'Receita'));
  const expenses = records
    .filter((transaction) => filterConditions(transaction, 'Despesa'));
  const revenuesSum = revenues.reduce((acc, { value }) => acc + value, 0);
  const expensesSum = expenses.reduce((acc, { value }) => acc + value, 0);

  return (
    <section className={ styles.container }>
      <h2 className={ styles.title }>
        Carteira
        <div className={ styles.yearContainer }>
          <button
            className={ styles.changeInput }
            onClick={ () => setYear(year - 1) }
          >
            <IoIosArrowBack />
          </button>
          <input
            className={ styles.yearInput }
            type="text"
            value={ year }
            disabled
          />
          <button
            className={ styles.changeInput }
            onClick={ () => setYear(year + 1) }
          >
            <IoIosArrowForward />
          </button>
        </div>
      </h2>
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

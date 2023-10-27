import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

import styles from '../card.module.css';
import { StateRedux } from '../../../types/State';

export default function AccountsCard() {
  const { accounts } = useSelector(({ data: { banks } }: StateRedux) => banks);

  return (
    <section className={ styles.container }>
      <h2 className={ styles.title }>Contas</h2>
      <div className={ styles.cards }>
        { !accounts.length ? (
          <p>Não há contas cadastradas.</p>
        ) : accounts.map(({ name, balance, real }) => (
          <div className={ styles.card } key={ name }>
            <h3
              style={ balance - real !== 0
                ? { color: 'var(--light-red)' }
                : { color: 'var(--white)' } }
            >
              { name }
            </h3>
            <NumericFormat
              value={ balance }
              allowNegative
              displayType="text"
              decimalScale={ 2 }
              fixedDecimalScale
              decimalSeparator=","
              prefix="R$"
              thousandSeparator="."
              style={ balance < 0
                ? { color: 'var(--light-red)' } : { color: 'var(--light-green)' } }
            />
          </div>
        ))}
      </div>
      <Link to="/contas" className={ styles.manage }>
        {accounts.length ? 'Gerenciar' : 'Cadastrar'}
      </Link>
    </section>
  );
}

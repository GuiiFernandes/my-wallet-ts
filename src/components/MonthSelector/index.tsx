import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import { pt } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import { BsCashCoin } from 'react-icons/bs';
import { MonthSelected, StateRedux } from '../../types/State';
import { months } from '../../utils/datas';
import { changeOperationls } from '../../redux/reducers/operationals';
import styles from './MonthSelector.module.css';
import BtnTransaction from '../Btns/BtnTransaction';
import './DataPicker.css';

export default function MonthSelector() {
  const dispatch = useDispatch();
  const { year, month } = useSelector(
    ({ operationals }: StateRedux) => operationals.monthSelected,
  );
  const { banks } = useSelector(({ data }: StateRedux) => data);
  const { accounts } = banks;

  const total = accounts.reduce((sum, { balance }) => sum + balance, 0);

  return (
    <form
      className={ styles.container }
      onSubmit={ (e) => { e.preventDefault(); } }
    >
      <div className={ styles.total }>
        <BsCashCoin size="2.5rem" />
        <strong className={ styles.balance }>
          Saldo:
          {' '}
          <span style={ { color: total >= 0 ? 'var(--light-green)' : 'var(--red)' } }>
            { total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) }
          </span>
        </strong>
      </div>
      <div className={ styles.dateContainer }>
        <DatePicker
          selected={ new Date(year, month - 1) }
          onChange={ (newDate) => {
            if (!newDate) return;
            dispatch(changeOperationls<MonthSelected>({
              monthSelected: {
                monthString: months[newDate.getMonth()],
                month: newDate.getMonth() + 1,
                year: newDate.getFullYear(),
              },
            }));
          } }
          dateFormat="MM/yyyy"
          locale={ pt }
          showMonthYearPicker
          className={ styles.select }
        />
        <BtnTransaction />
      </div>
    </form>
  );
}

import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import { pt } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
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

  return (
    <form
      className={ styles.container }
      onSubmit={ (e) => { e.preventDefault(); } }
    >
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
    </form>
  );
}

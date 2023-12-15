import { useDispatch, useSelector } from 'react-redux';

import { MonthSelected, StateRedux } from '../../types/State';
import { months } from '../../utils/datas';
import { changeOperationls } from '../../redux/reducers/operationals';
import styles from './MonthSelector.module.css';
import BtnTransaction from '../Btns/BtnTransaction';

export default function MonthSelector() {
  const dispatch = useDispatch();
  const { monthString, year } = useSelector(
    ({ operationals }: StateRedux) => operationals.monthSelected,
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear + 5 - 2000 },
    (_, i) => i + currentYear - 10,
  ).reverse();

  return (
    <form
      className={ styles.container }
      onSubmit={ (e) => { e.preventDefault(); } }
    >
      <select
        name="month"
        value={ monthString }
        className={ styles.select }
        onChange={ ({ target: { value } }) => {
          dispatch(changeOperationls<MonthSelected>({
            monthSelected: { monthString: value, month: months.indexOf(value) + 1, year },
          }));
        } }
      >
        { months.map((month) => (
          <option
            key={ month }
            value={ month }
            className={ styles.option }
          >
            { month }
          </option>
        )) }
      </select>
      <select
        name="year"
        value={ year }
        className={ styles.select }
        onChange={ ({ target: { value } }) => {
          dispatch(changeOperationls<MonthSelected>({
            monthSelected: {
              monthString,
              month: months.indexOf(monthString) + 1,
              year: Number(value),
            },
          }));
        } }
      >
        { years.map((yearIterable) => (
          <option
            key={ yearIterable }
            value={ yearIterable }
            className={ styles.option }
          >
            { yearIterable }
          </option>
        )) }
      </select>
      <BtnTransaction />
    </form>
  );
}

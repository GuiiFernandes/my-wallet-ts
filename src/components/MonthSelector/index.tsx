import { useDispatch, useSelector } from 'react-redux';

import { MonthSelected, StateRedux } from '../../types/State';
import { months } from '../../utils/datas';
import { changeOperationls } from '../../redux/reducers/operationals';
import styles from './MonthSelector.module.css';
import BtnTransaction from '../Btns/BtnTransaction';

export default function MonthSelector() {
  const dispatch = useDispatch();
  const { monthString } = useSelector(
    ({ operationals }: StateRedux) => operationals.monthSelected,
  );

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
            monthSelected: { monthString: value, month: months.indexOf(value) + 1 },
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
      <BtnTransaction />
    </form>
  );
}

import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import { pt } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

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
      <strong className={ styles.balance }>
        <div className={ styles.total }>
          <BsCashCoin size="2.5rem" />
          Saldo:
        </div>
        <span style={ { color: total >= 0 ? 'var(--light-green)' : 'var(--red)' } }>
          { total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) }
        </span>
      </strong>
      <div className={ styles.dateContainer }>
        <label htmlFor="month" className={ styles.label }>
          Mês atual:
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
            id="month"
            className={ styles.select }
          />
        </label>
        <BtnTransaction />
      </div>
    </form>
  );
}

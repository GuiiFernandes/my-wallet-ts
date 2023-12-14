import { useDispatch, useSelector } from 'react-redux';

import { changeOperationls } from '../../../redux/reducers/operationals';
import styles from '../FormLayout/formlayout.module.css';

export default function BtnsForm<T>({ value }: { value: T }) {
  const dispatch = useDispatch();
  const { editTransaction } = useSelector(({ operationals }: any) => operationals);
  return (
    <div className={ styles.containerBtns }>
      <button
        className="confirmBtn"
      >
        {editTransaction ? 'Salvar' : 'Criar' }
      </button>
      <button
        type="button"
        className="cancelBtn"
        onClick={ () => dispatch(changeOperationls<T>(
          value,
        )) }
      >
        Cancelar
      </button>
    </div>
  );
}

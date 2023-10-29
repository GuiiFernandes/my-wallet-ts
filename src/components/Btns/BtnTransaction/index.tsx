import { useDispatch, useSelector } from 'react-redux';

import { StateRedux } from '../../../types/State';
import { changeOperationls } from '../../../redux/reducers/operationals';

export default function BtnTransaction() {
  const dispatch = useDispatch();
  const { newTransaction } = useSelector(({ operationals }: StateRedux) => operationals);
  return (
    <button
      type="button"
      className="confirmBtn"
      onClick={ () => {
        dispatch(changeOperationls({ newTransaction: !newTransaction }));
      } }
    >
      Lançar
    </button>
  );
}

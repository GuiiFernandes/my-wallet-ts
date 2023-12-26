import { format } from 'date-fns';
import { BiSolidLike, BiSolidDislike } from 'react-icons/bi';

import { useSelector } from 'react-redux';
import styles from './NewTransaction.module.css';
import { PropsNewTrans } from '../../../types/LocalStates';
import { StateRedux } from '../../../types/State';

const typeTexts = {
  Despesa: 'Pagamento:',
  Receita: 'Recebimento:',
  Investimento: 'Investido:',
  Transferência: 'Transferido:',
};

export default function PayBtn({ form, setForm }: PropsNewTrans) {
  const { newTransaction } = useSelector(({ operationals }: StateRedux) => operationals);
  const date = newTransaction ? form.date : format(new Date(), 'yyyy-MM-dd');
  const changePayment = () => {
    setForm({
      ...form,
      payday: form.payday ? null : date,
    });
  };

  return (
    <p>
      {typeTexts[form.type]}
      {' '}
      <button
        type="button"
        className={ styles.button }
        onClick={ changePayment }
      >
        { form.payday
          ? <BiSolidLike size="25px" color="var(--light-green)" />
          : <BiSolidDislike size="25px" color="var(--red)" />}
      </button>
    </p>
  );
}

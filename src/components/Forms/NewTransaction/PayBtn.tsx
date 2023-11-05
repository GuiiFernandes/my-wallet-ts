import { BiSolidLike, BiSolidDislike } from 'react-icons/bi';

import styles from './NewTransaction.module.css';
import { PropsNewTrans } from '../../../types/LocalStates';

const typeTexts = {
  Despesa: 'Pagamento:',
  Receita: 'Recebimento:',
  Investimento: 'Investido:',
  Transferência: 'Transferido:',
};

export default function PayBtn({ form, setForm }: PropsNewTrans) {
  const changePayment = () => {
    setForm({ ...form,
      payday: form.payday
        ? null : new Date().toISOString().slice(0, 10) });
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

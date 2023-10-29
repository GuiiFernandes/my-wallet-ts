import { BiSolidLike, BiSolidDislike } from 'react-icons/bi';

import styles from './NewTransaction.module.css';
import { PropsNewTrans } from '../../../types/LocalStates';

export default function PayBtn({ form, setForm }: PropsNewTrans) {
  const changePayment = () => {
    setForm({ ...form,
      payday: form.payday
        ? null : new Date().toISOString().slice(0, 10) });
  };

  return (
    <p>
      {form.type === 'Despesa' ? 'Pagamento:' : 'Recebimento:'}
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

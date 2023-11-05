import { PropsNewTrans } from '../../../types/LocalStates';
import styles from './NewTransaction.module.css';

const white = 'var(--white)';

export default function PaymentMethod({ form, setForm }: PropsNewTrans) {
  const handleCheck = (
    { target: { id } }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (id === 'installments') {
      setForm({
        ...form,
        [id]: form[id] ? null : 2,
        isFixed: false,
      });
    } else if (id === 'isFixed') {
      setForm({
        ...form,
        [id]: !form[id],
        installments: null,
      });
    }
  };

  return (
    <div
      className={ styles.containerMethod }
      style={ { marginBottom: form.installments !== null ? '10px' : '51px' } }
    >
      <label
        className={ styles.labelType }
        htmlFor="isFixed"
        style={ { backgroundColor: form.isFixed
          ? 'var(--blue)' : white } }
      >
        <input
          type="checkbox"
          id="isFixed"
          value="Despesa"
          checked={ form.isFixed }
          onChange={ handleCheck }
          style={ { display: 'none' } }
        />
        Fixa
      </label>
      <label
        className={ styles.labelType }
        htmlFor="installments"
        style={ { backgroundColor: form.installments !== null
          ? 'var(--blue)' : white } }
      >
        <input
          style={ { display: 'none' } }
          type="checkbox"
          id="installments"
          value="Receita"
          checked={ !!form.installments }
          onChange={ handleCheck }
        />
        Parcelada
      </label>
    </div>
  );
}

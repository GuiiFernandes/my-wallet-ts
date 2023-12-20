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
        [id]: form[id] === 'F' || form[id] === 'U' ? '2' : 'U',
      });
    } else if (id === 'fixed') {
      setForm({
        ...form,
        installments: form.installments === 'F' ? 'U' : 'F',
      });
    }
  };

  return (
    <div
      className={ styles.containerMethod }
      style={ { marginBottom: form.installments !== 'U'
        ? '10px' : '42px' } }
    >
      <label
        className={ styles.labelType }
        htmlFor="fixed"
        style={ { backgroundColor: form.installments === 'F'
          ? 'var(--blue)' : white } }
      >
        <input
          type="checkbox"
          id="fixed"
          value="Despesa"
          checked={ form.installments === 'F' }
          onChange={ handleCheck }
          style={ { display: 'none' } }
        />
        Fixa
      </label>
      <label
        className={ styles.labelType }
        htmlFor="installments"
        style={ { backgroundColor: form.installments !== 'U' && form.installments !== 'F'
          ? 'var(--blue)' : white } }
      >
        <input
          style={ { display: 'none' } }
          type="checkbox"
          id="installments"
          value="Receita"
          checked={ Number.isNaN(form.installments) }
          onChange={ handleCheck }
        />
        Parcelada
      </label>
    </div>
  );
}

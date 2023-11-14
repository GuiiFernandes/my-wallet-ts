import { PropsNewTrans } from '../../../types/LocalStates';
import { repeats } from '../../../utils/datas';
import styles from '../FormLayout/formlayout.module.css';

export default function Installment({ form, setForm }: PropsNewTrans) {
  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const numberValue = Number(value);
    if (id === 'installments') {
      setForm({ ...form, [id]: numberValue });
    } else if (id === 'period') {
      setForm({ ...form, [id]: value });
    }
  };
  return (
    <div className={ styles.containerInstallments }>
      { !form.isFixed && (
        <label htmlFor="installments" className={ styles.labelInstallments }>
          Parcelas:
          <input
            className={ styles.inputInstallments }
            type="number"
            min="2"
            step="1"
            id="installments"
            value={ form.installments?.toString() || '' }
            onChange={ handleChange }
          />
        </label>
      )}
      <label htmlFor="period" className={ styles.labelRepeat }>
        Repetir:
        <select
          className={ styles.selectInstallments }
          id="period"
          value={ form.period }
          onChange={ handleChange }
        >
          { Object.keys(repeats).map((repeat: string) => (
            <option key={ repeat } value={ repeat } className={ styles.option }>
              { repeat }
            </option>
          )) }
        </select>
      </label>
    </div>
  );
}

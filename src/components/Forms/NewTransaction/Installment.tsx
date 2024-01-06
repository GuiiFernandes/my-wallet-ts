import { PropsNewTrans } from '../../../types/LocalStates';
import { frequencyRepeatNames } from '../../../utils/datas';
import styles from '../FormLayout/formlayout.module.css';

export default function Installment({ form, setForm }: PropsNewTrans) {
  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [id]: value });
  };

  return (
    <div className={ styles.containerInstallments }>
      { form.installments !== 'F' && (
        <label htmlFor="installments" className={ styles.labelInstallments }>
          Parcelas:
          <input
            className={ styles.inputInstallments }
            type="number"
            min="2"
            step="1"
            id="installments"
            value={ form.installments || '' }
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
          { frequencyRepeatNames
            .filter((repeat: string) => repeat !== '4x no mês'
            || form.installments === 'F')
            .map((repeat: string) => (
              <option key={ repeat } value={ repeat } className={ styles.option }>
                { repeat }
              </option>
            )) }
        </select>
      </label>
      { form.installments !== 'F' && (
        <p className={ styles.parcelas }>
          {`${form.installments} parcelas
        de R$${(form.value / Number(form.installments)).toFixed(2)}`}
        </p>
      )}
    </div>
  );
}

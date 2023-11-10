import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NumericFormat } from 'react-number-format';
import { FiSave } from 'react-icons/fi';
import { MdDeleteForever } from 'react-icons/md';

import useAccount from '../../../hooks/useAccount';
import { StateRedux } from '../../../types/State';
import { RealForm } from '../../../types/LocalStates';
import styleGlobal from '../table.module.css';
import styleTable from './accoutTable.module.css';

const styles = { ...styleGlobal, ...styleTable };

const lightRed = 'var(--light-red)';
const lightGreen = 'var(--light-green)';

export default function AccountTable() {
  const [realForm, setRealForm] = useState<RealForm>({});
  const { accounts } = useSelector(({ data }: StateRedux) => data.banks);
  const { deleteAccount, saveReal } = useAccount();

  useEffect(() => {
    const accountsKeys = accounts.reduce((obj, { name, real }) => (
      { ...obj, [name]: `${real}` }
    ), {});
    setRealForm(accountsKeys);
  }, [accounts]);

  return (
    <table className={ styles.container }>
      <thead className={ styles.tHead }>
        <tr className={ styles.card }>
          <td className={ styles.tdName }>Nome</td>
          <td className={ styles.td }>Saldo</td>
          <td className={ styles.td }>Real</td>
          <td className={ styles.td }>Diferença</td>
          <td className={ styles.td }>{' '}</td>
        </tr>
      </thead>
      <tbody>
        { accounts.map(({ id, name, balance, real }) => (
          <tr className={ styles.card } key={ name }>
            <td className={ styles.tdName }>
              <h3>{ name }</h3>
            </td>
            <td className={ styles.td }>
              <NumericFormat
                value={ balance }
                allowNegative={ false }
                displayType="text"
                decimalScale={ 2 }
                fixedDecimalScale
                decimalSeparator=","
                prefix="R$"
                thousandSeparator="."
                style={ balance < 0
                  ? { color: lightRed } : { color: lightGreen } }
              />
            </td>
            <td className={ styles.td }>
              <div className={ styles.realInput }>
                <NumericFormat
                  value={ realForm[name] }
                  name={ name }
                  allowNegative
                  defaultValue={ `${real}` }
                  displayType="input"
                  className={ styles.inputNumeric }
                  decimalScale={ 2 }
                  fixedDecimalScale
                  decimalSeparator=","
                  prefix="R$"
                  thousandSeparator="."
                  onChange={ ({ target }) => {
                    const value = target.value === '' || target.value === '-'
                      ? '0'
                      : target.value.replace('R', '').replace('$', '')
                        .replace('.', '').replace(',', '.');
                    setRealForm({
                      ...realForm,
                      [target.name]: value,
                    });
                  } }
                />
                { real !== Number(realForm[name]) && (
                  <button
                    type="button"
                    className={ styles.confirmReal }
                    onClick={ () => saveReal(id, name, realForm) }
                  >
                    <FiSave />
                  </button>
                )}
              </div>
            </td>
            <td className={ styles.td }>
              <NumericFormat
                value={ Number(realForm[name]) - balance }
                displayType="text"
                decimalScale={ 2 }
                style={ {
                  color: Number(realForm[name]) - balance !== 0
                    ? lightRed : lightGreen,
                  fontWeight: 700,
                } }
                fixedDecimalScale
                decimalSeparator=","
                prefix="R$"
                thousandSeparator="."
              />
            </td>
            <td className={ styles.tdBtn }>
              <button
                type="button"
                className={ styles.btnDel }
                onClick={ () => deleteAccount({ id, name }) }
              >
                <MdDeleteForever />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

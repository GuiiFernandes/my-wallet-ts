import { useState } from 'react';
import { useSelector } from 'react-redux';
import { NumericFormat } from 'react-number-format';
import styles from '../FormLayout/formlayout.module.css';

import FormLayout from '../FormLayout';
import { NewAccountType, StateRedux } from '../../../types/State';
import useData from '../../../hooks/useData';
import { FormAccount } from '../../../types/LocalStates';
import BtnsForm from '../BtnsForm';

const INITIAL_STATE: FormAccount = {
  name: '',
  balance: '0',
  type: 'conta-corrente',
};

export default function NewAccount() {
  const [form, setForm] = useState(INITIAL_STATE);
  const { banks } = useSelector(({ data }: StateRedux) => data);
  const { createAccount } = useData();
  const { accounts } = banks;

  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [id]: value });
  };

  return (
    <FormLayout>
      <form
        className={ styles.containerForm }
        onSubmit={ async (e) => {
          e.preventDefault();
          await createAccount(form);
        } }
      >
        <h2 className={ styles.h2 }>Nova Conta</h2>
        <label htmlFor="name" className={ styles.label }>
          Nome:
          <input
            type="text"
            id="name"
            className={ styles.input }
            value={ form.name }
            onChange={ handleChange }
          />
        </label>
        <label htmlFor="balance" className={ styles.label }>
          Saldo:
          <NumericFormat
            value={ form.balance }
            allowNegative
            displayType="input"
            id="balance"
            decimalScale={ 2 }
            fixedDecimalScale
            decimalSeparator=","
            prefix="R$"
            thousandSeparator="."
            className={ styles.input }
            onChange={ handleChange }
          />
        </label>
        <label htmlFor="type" className={ styles.label }>
          Tipo:
          <select
            id="type"
            className={ styles.input }
            value={ form.type }
            onChange={ handleChange }
          >
            <option className={ styles.option } value="conta-corrente">
              Conta Corrente
            </option>
            <option className={ styles.option } value="conta-investimento">
              Conta Investimento
            </option>
            { !accounts.map(({ type }) => type).includes('carteira') && (
              <option className={ styles.option } value="carteira">
                Carteira
              </option>
            )}
          </select>
        </label>
        <BtnsForm<NewAccountType> value={ { newAccount: false } } />
      </form>
    </FormLayout>
  );
}

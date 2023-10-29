import { useState } from 'react';
import { useSelector } from 'react-redux';
import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi';
import { BiSolidDislike, BiSolidLike } from 'react-icons/bi';

import { NumericFormat } from 'react-number-format';
import FormLayout from '../FormLayout';
import BtnsForm from '../BtnsForm';
import { FormTransaction } from '../../../types/LocalStates';
import { NewTransactionType, StateRedux } from '../../../types/State';
import style1 from '../FormLayout/formlayout.module.css';
import styles2 from './NewTransaction.module.css';
import Installment from './Installment';
import PaymentMethod from './PaymentMethod';
import PayBtn from './PayBtn';

const styles = { ...style1, ...styles2 };
const white = 'var(--white)';
const INITIAL_STATE: FormTransaction = {
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  payday: null,
  description: '',
  value: 0,
  account: '',
  type: 'Despesa',
  category: '',
  subCategory: '',
  installments: null,
  period: 'Mensalmente',
  isFixed: false,
};

export default function NewTransaction() {
  const [form, setForm] = useState(INITIAL_STATE);
  const { banks, configurations } = useSelector(({ data }: StateRedux) => data);
  const { accounts } = banks;
  const { categories, subCategories } = configurations;

  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (id === 'date') {
      setForm({ ...form, [id]: value, dueDate: value, payday: value });
    } else if (id === 'value') {
      const newValue = value === ''
        ? '0'
        : value.replace('R', '').replace('$', '')
          .replace('.', '').replace(',', '.');
      setForm({
        ...form,
        [id]: Number(newValue),
      });
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  return (
    <FormLayout>
      <form
        className={ styles.containerForm }
      >
        <h2 className={ styles.h2 }>{`Nova ${form.type}`}</h2>
        <div className={ styles.containerTypes }>
          <label
            className={ styles.labelType }
            style={ {
              backgroundColor: form.type === 'Despesa' ? 'var(--red)' : white,
            } }
          >
            <input
              type="radio"
              id="type"
              value="Despesa"
              checked={ form.type === 'Despesa' }
              onChange={ handleChange }
              style={ { display: 'none' } }
            />
            <GiPayMoney size="30px" />
            Despesa
          </label>
          <label
            className={ styles.labelType }
            style={ {
              backgroundColor: form.type === 'Receita'
                ? 'var(--light-green)' : white,
            } }
          >
            <input
              style={ { display: 'none' } }
              type="radio"
              id="type"
              value="Receita"
              checked={ form.type === 'Receita' }
              onChange={ handleChange }
            />
            <GiReceiveMoney size="30px" />
            Receita
          </label>
        </div>
        <div className={ styles.containerDates }>
          <label htmlFor="date" className={ styles.labelDates }>
            Data:
            <input
              type="date"
              id="date"
              className={ styles.input }
              value={ form.date }
              onChange={ handleChange }
            />
          </label>
          <label htmlFor="dueDate" className={ styles.labelDates }>
            Vencimento:
            <input
              type="date"
              id="dueDate"
              className={ styles.input }
              value={ form.dueDate }
              onChange={ handleChange }
            />
          </label>
          <label htmlFor="dueDate" className={ styles.labelDates }>
            <PayBtn form={ form } setForm={ setForm } />
            <input
              type="date"
              disabled={ !form.payday }
              id="payday"
              className={ styles.input }
              value={ form.payday || '' }
              onChange={ handleChange }
            />
          </label>
        </div>
        <label htmlFor="value" className={ styles.label }>
          Valor:
          <NumericFormat
            value={ form.value }
            allowNegative={ false }
            displayType="input"
            decimalScale={ 2 }
            fixedDecimalScale
            decimalSeparator=","
            prefix="R$"
            id="value"
            thousandSeparator="."
            className={ styles.input }
            onChange={ handleChange }
          />
        </label>
        <label htmlFor="description" className={ styles.label }>
          Descrição:
          <input
            value={ form.description }
            type="text"
            id="description"
            className={ styles.input }
            onChange={ handleChange }
          />
        </label>
        <label htmlFor="account" className={ styles.label }>
          Conta:
          <select
            id="account"
            className={ styles.input }
            value={ form.account }
            onChange={ handleChange }
          >
            { accounts.map(({ name }) => (
              <option key={ name } className={ styles.option } value={ name }>
                { name }
              </option>
            )) }
          </select>
        </label>
        <label htmlFor="category" className={ styles.label }>
          Categoria:
          <select
            id="category"
            className={ styles.input }
            value={ form.category }
          >
            { categories.map((category) => (
              <option key={ category } value={ category } className="">
                { category }
              </option>
            )) }
          </select>
        </label>
        <label htmlFor="subCategory" className={ styles.label }>
          Sub-Categoria:
          <select
            id="subCategory"
            className={ styles.input }
            value={ form.subCategory }
          >
            { subCategories
              .filter(({ category }) => category === form.category)
              .map(({ name }) => (
                <option key={ name } value={ name } className="">
                  { name }
                </option>
              )) }
          </select>
        </label>
        <PaymentMethod form={ form } setForm={ setForm } />
        { form.installments !== null && (
          <Installment form={ form } setForm={ setForm } />
        )}
        <BtnsForm<NewTransactionType> value={ { newTransaction: false } } />
      </form>
    </FormLayout>
  );
}

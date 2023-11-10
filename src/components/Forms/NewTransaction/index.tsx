import { useSelector } from 'react-redux';
import { NumericFormat } from 'react-number-format';

import useTransaction from '../../../hooks/useTransaction';
import FormLayout from '../FormLayout';
import PayBtn from './PayBtn';
import Installment from './Installment';
import PaymentMethod from './PaymentMethod';
import BtnsForm from '../BtnsForm';
import TypeBtn from './TypeBtn';
import { NewTransactionType, StateRedux } from '../../../types/State';
import style1 from '../FormLayout/formlayout.module.css';
import styles2 from './NewTransaction.module.css';
import useChangeFormTrans from '../../../hooks/useChangeFormTrans';

const styles = { ...style1, ...styles2 };

const transferText = 'Transferência';
const indexes = [0, 1, 2, 3];

export default function NewTransaction() {
  const { createTransaction } = useTransaction();
  const {
    form,
    setForm,
    handleChange,
    handleChangeValue,
    handleChangeType,
    handleChangeDate,
  } = useChangeFormTrans();
  const { banks, configurations } = useSelector(({ data }: StateRedux) => data);
  const { accounts } = banks;
  const { categories, subCategories } = configurations;

  const destinyAccounts = accounts.filter((account) => account.name !== form.account);

  return (
    <FormLayout>
      <form
        className={ styles.containerForm }
        onSubmit={ async (e) => {
          e.preventDefault();
          createTransaction(form);
        } }
      >
        <h2 className={ styles.h2 }>
          {`Nov${form.type === 'Investimento' ? 'o' : 'a'} ${form.type}`}
        </h2>
        <div className={ styles.containerTypes }>
          { indexes.map((index) => (
            <TypeBtn
              key={ index }
              index={ index }
              type={ form.type }
              handleChange={ handleChangeType }
            />
          ))}
        </div>
        <div className={ styles.containerDates }>
          <label htmlFor="date" className={ styles.labelDates }>
            Data:
            <input
              type="date"
              id="date"
              className={ styles.input }
              value={ form.date }
              onChange={ handleChangeDate }
            />
          </label>
          <label htmlFor="dueDate" className={ styles.labelDates }>
            Vencimento:
            <input
              type="date"
              id="dueDate"
              disabled={ !!form.installments }
              className={ styles.input }
              value={ !form.installments ? form.dueDate : '' }
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
            onChange={ handleChangeValue }
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
          { form.type !== transferText ? 'Conta:' : 'Conta de Origem:' }
          <select
            id="account"
            className={ styles.input }
            value={ form.account }
            onChange={ handleChange }
          >
            <option className={ styles.option }>
              { form.type !== transferText ? 'Selecione uma conta' : 'Selecione origem' }
            </option>
            { accounts.map(({ name }) => (
              <option key={ name } className={ styles.option } value={ name }>
                { name }
              </option>
            )) }
          </select>
        </label>
        { form.type === transferText && (
          <label
            htmlFor="accountDestiny"
            className={ styles.label }
            style={ { marginBottom: '51px' } }
          >
            Conta de Destino:
            <select
              id="accountDestiny"
              className={ styles.input }
              value={ form.accountDestiny }
              onChange={ handleChange }
            >
              <option className={ styles.option }>
                Selecione um destino
              </option>
              { destinyAccounts.map(({ name }) => (
                <option key={ name } className={ styles.option } value={ name }>
                  { name }
                </option>
              )) }
            </select>
          </label>
        )}
        { form.type !== transferText && (
          <>
            <label htmlFor="category" className={ styles.label }>
              Categoria:
              <select
                id="category"
                className={ styles.input }
                value={ form.category || '' }
                onChange={ handleChange }
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
                value={ form.subCategory || '' }
                onChange={ handleChange }
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
          </>
        )}
        <PaymentMethod form={ form } setForm={ setForm } />
        { form.installments !== null && (
          <Installment form={ form } setForm={ setForm } />
        )}
        <BtnsForm<NewTransactionType> value={ { newTransaction: false } } />
      </form>
    </FormLayout>
  );
}
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NumericFormat } from 'react-number-format';
import { doc, setDoc } from 'firebase/firestore';
import styles from './newAccount.module.css';

import FromLayout from '../FormLayout';
import { changeOperationls } from '../../../redux/reducers/operationals';
import { NewAccountType, StateRedux } from '../../../types/State';
import { db } from '../../../services/firebase';

const INITIAL_STATE = {
  name: '',
  balance: '0',
  type: 'conta-corrente',
};

export default function NewAccount() {
  const [form, setForm] = useState(INITIAL_STATE);
  const { banks } = useSelector(({ data }: StateRedux) => data);
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const dispatch = useDispatch();
  const { accounts } = banks;

  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [id]: value });
  };

  const createAccount = async () => {
    const balanceNumber = Number(
      form.balance.substring(2).replace('.', '').replace(',', '.'),
    );
    const newAccount = {
      id: accounts.length ? accounts[accounts.length - 1].id + 1 : 0,
      name: `${form.name[0].toLocaleUpperCase()}${form.name.substring(1)}`,
      balance: balanceNumber,
      real: balanceNumber,
      type: form.type,
    };
    await setDoc(doc(db, uid, 'banks'), {
      ...banks,
      accounts: [...accounts, newAccount],
    });
    dispatch(changeOperationls<NewAccountType>({ newAccount: false }));
  };

  return (
    <FromLayout>
      <form
        className={ styles.container }
        onSubmit={ async (e) => {
          e.preventDefault();
          await createAccount();
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
            allowNegative={ false }
            displayType="input"
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
        <div className={ styles.containerBtns }>
          <button
            className="createBtn"
          >
            Criar
          </button>
          <button
            type="button"
            className="logoutBtn"
            onClick={
            () => dispatch(changeOperationls<NewAccountType>({ newAccount: false }))
          }
          >
            Cancelar
          </button>
        </div>
      </form>
    </FromLayout>
  );
}

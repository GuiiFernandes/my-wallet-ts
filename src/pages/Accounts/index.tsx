import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';
import { GiConfirmed } from 'react-icons/gi';

import { NumericFormat } from 'react-number-format';
import useFirebase from '../../hooks/useFirebase';
import NewAccount from '../../components/Forms/NewAccount';
import { NewAccountType, StateRedux } from '../../types/State';
import styles from './accounts.module.css';
import { changeOperationls } from '../../redux/reducers/operationals';
import { db } from '../../services/firebase';

type RealForm = { [key: string]: number };

export default function Accounts() {
  const [realForm, setRealForm] = useState<RealForm>({});
  const { validateLogin } = useFirebase();
  const dispatch = useDispatch();
  const { banks } = useSelector(({ data }: StateRedux) => data);
  const { newAccount } = useSelector(({ operationals }: StateRedux) => operationals);
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { accounts } = banks;

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  useEffect(() => {
    const accountsKeys = accounts.reduce((obj, { name, real }) => (
      { ...obj, [name]: real }
    ), {});
    setRealForm(accountsKeys);
  }, [accounts]);

  const saveReal = async (id: number, name: string) => {
    const accountsChanged = accounts.map((account) => {
      if (account.id === id) {
        return { ...account, real: realForm[name] };
      }
      return account;
    });
    await setDoc(doc(db, uid, 'banks'), {
      ...banks,
      accounts: accountsChanged,
    });
  };

  return (
    <>
      <table className={ styles.container }>
        <thead className={ styles.tHead }>
          <tr className={ styles.card }>
            <td className={ styles.tdName }>Nome</td>
            <td className={ styles.td }>Saldo</td>
            <td className={ styles.td }>Real</td>
            <td className={ styles.td }>Diferença</td>
          </tr>
        </thead>
        <tbody>
          { !accounts.length ? (
            <tr>Não há contas cadastradas.</tr>
          ) : accounts.map(({ id, name, balance, real }) => (
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
                />
              </td>
              <td className={ styles.td }>
                <NumericFormat
                  value={ realForm[name] }
                  name={ name }
                  allowNegative={ false }
                  displayType="input"
                  className={ styles.realInput }
                  decimalScale={ 2 }
                  fixedDecimalScale
                  decimalSeparator=","
                  prefix="R$"
                  thousandSeparator="."
                  onChange={ ({ target }) => {
                    setRealForm({
                      ...realForm,
                      [target.name]: Number(
                        target.value.substring(2).replace('.', '').replace(',', '.'),
                      ),
                    });
                  } }
                />
                { real !== realForm[name] && (
                  <button
                    type="button"
                    className={ styles.confirmReal }
                    onClick={ () => saveReal(id, name) }
                  >
                    <GiConfirmed />
                  </button>
                )}
              </td>
              <td className={ styles.td }>
                <NumericFormat
                  value={ realForm[name] - balance }
                  allowNegative
                  displayType="text"
                  decimalScale={ 2 }
                  fixedDecimalScale
                  decimalSeparator=","
                  prefix="R$"
                  thousandSeparator="."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className={ styles.manage }
        type="button"
        onClick={
            () => dispatch(changeOperationls<NewAccountType>({ newAccount: !newAccount }))
          }
      >
        Nova Conta
      </button>
    </>
  );
}

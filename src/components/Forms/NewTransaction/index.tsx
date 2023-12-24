import { useDispatch, useSelector } from 'react-redux';
import { NumericFormat } from 'react-number-format';

// import useTransaction from '../../../hooks/useTransaction';
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
import { changeOperationls } from '../../../redux/reducers/operationals';
import { Transaction, Transfer } from '../../../classes/Transactions';
import { toast } from '../../../utils/swal';
import CategoriesSelects from './CategoriesSelects';
// import { TransactionType } from '../../../types/Data';
// import useTransaction from '../../../hooks/useTransaction';

const styles = { ...style1, ...styles2 };

const TRANSFER_TYPE = 'Transferência';
const indexes = [0, 1, 2, 3];

export default function NewTransaction() {
  const dispatch = useDispatch();
  // const { getAllTransactions } = useTransaction();
  const {
    form,
    setForm,
    handleChange,
    handleChangeValue,
    handleChangeType,
    handleChangeAccount,
  } = useChangeFormTrans();
  const { editTransaction,
    newTransaction } = useSelector(({ operationals }: StateRedux) => operationals);
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { banks,
    configurations, transactions } = useSelector(({ data }: StateRedux) => data);
  const { accounts } = banks;
  const { categories, subCategories } = configurations;

  const destinyAccounts = accounts.filter((account) => account.name !== form.account);

  // const allTransactions: TransactionType[] = getAllTransactions();

  // useEffect(() => {
  //   const index = allTransactions.findIndex(({ id }) => id === editTransaction);
  //   if (index !== -1) {
  //     const { id, account, ...formTrans } = allTransactions[index];
  //     const { installments, period } = formTrans;
  //     const [originAcc, destinyAcc] = account.split('>');
  //     setForm({
  //       ...formTrans,
  //       period,
  //       account: originAcc,
  //       accountDestiny: destinyAcc || '',
  //     });
  //   }
  // }, [editTransaction]);

  return (
    <FormLayout>
      <form
        className={ styles.containerForm }
        onSubmit={ async (e) => {
          e.preventDefault();
          try {
            if (form.type !== TRANSFER_TYPE) {
              const register = new Transaction(form);
              await register.create(uid, transactions, accounts);
            } else {
              const resgister = new Transfer(form);
              await resgister.create(uid, transactions, accounts);
            }
            dispatch(changeOperationls({ newTransaction: !newTransaction }));
          } catch (error) {
            toast.fire({
              icon: 'error',
              title: 'Erro ao cadastrar transação',
            });
            console.error(error);
          }
        } }
      >
        <h2 className={ styles.h2 }>
          { editTransaction ? 'Editar' : `Nov${form.type === 'Investimento' ? 'o' : 'a'}`}
          {` ${form.type}`}
        </h2>
        { !editTransaction && (
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
        )}
        <div className={ styles.containerDates }>
          <label htmlFor="date" className={ styles.labelDates }>
            Vencimento:
            <input
              type="date"
              id="date"
              className={ styles.input }
              value={ form.date.slice(0, 10) }
              onChange={ handleChange }
            />
          </label>
          <label htmlFor="date" className={ styles.labelDates }>
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
          { form.type !== TRANSFER_TYPE ? 'Conta:' : 'Conta de Origem:' }
          <select
            id="account"
            className={ styles.input }
            value={ form.account }
            onChange={ handleChangeAccount }
          >
            { accounts.map(({ name }) => (
              <option key={ name } className={ styles.option } value={ name }>
                { name }
              </option>
            )) }
          </select>
        </label>
        { form.type === TRANSFER_TYPE ? (
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
              { destinyAccounts.map(({ name }) => (
                <option key={ name } className={ styles.option } value={ name }>
                  { name }
                </option>
              )) }
            </select>
          </label>
        ) : (
          <CategoriesSelects
            form={ form }
            handleChange={ handleChange }
            categories={ categories }
            subCategories={ subCategories }
            setForm={ setForm }
          />
        )}
        { !editTransaction && (
          <PaymentMethod form={ form } setForm={ setForm } />
        ) }
        { (form.installments !== 'U') && !editTransaction && (
          <Installment form={ form } setForm={ setForm } />
        )}
        <BtnsForm<NewTransactionType>
          value={ editTransaction
            ? { editTransaction: null }
            : { newTransaction: false } }
        />
      </form>
    </FormLayout>
  );
}

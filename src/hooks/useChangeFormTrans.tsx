import { useState } from 'react';
import { useSelector } from 'react-redux';

import { FormTransaction } from '../types/LocalStates';
import { TypesTransaction } from '../types/Data';
import { StateRedux } from '../types/State';

export default function useChangeFormTrans() {
  const { accounts } = useSelector(({ data }: StateRedux) => data.banks);
  const selectedAccountText = accounts[0].name;
  const now = new Date().toLocaleDateString().split('/').reverse();
  const INITIAL_STATE: FormTransaction = {
    date: now.join('-'),
    payday: null,
    description: '',
    value: 0,
    account: selectedAccountText,
    accountDestiny: accounts.filter(({ name }) => name !== selectedAccountText)[0].name,
    type: 'Despesa',
    category: '',
    subCategory: '',
    installments: 'U',
    period: 'Mensalmente',
  };
  const [form, setForm] = useState(INITIAL_STATE);

  const handleChangeValue = (
    { target: { value } }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = value === ''
      ? '0'
      : value.replace('R', '').replace('$', '')
        .replace('.', '').replace(',', '.');
    setForm({
      ...form,
      value: Number(newValue),
    });
  };

  const handleChangeType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const type = value as TypesTransaction;
    setForm({
      ...form,
      type,
    });
  };

  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [id]: value });
  };

  const handleChangeAccount = (
    { target: { value } }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { accountDestiny } = form;
    const destinyAccounts = accounts.filter((account) => account.name !== value);
    const newDestinyAccount = destinyAccounts[0].name;
    setForm({
      ...form,
      account: value,
      accountDestiny: accountDestiny === value ? newDestinyAccount : accountDestiny,
    });
  };

  return {
    form,
    setForm,
    handleChangeValue,
    handleChangeType,
    handleChange,
    handleChangeAccount,
  };
}

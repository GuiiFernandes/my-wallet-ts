import { useState } from 'react';
import { FormTransaction } from '../types/LocalStates';
import { TypesTransaction } from '../types/Data';

const selectedAccountText = 'Selecione uma conta';
const selectOriginText = 'Selecione origem';
const INITIAL_STATE: FormTransaction = {
  date: new Date().toISOString().slice(0, 10),
  payday: null,
  description: '',
  value: 0,
  account: selectedAccountText,
  accountDestiny: 'Selecione destino',
  type: 'Despesa',
  category: '',
  subCategory: '',
  installments: null,
  period: 'Mensalmente',
  isFixed: false,
};

export default function useChangeFormTrans() {
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
    let valueAccount = '';
    let categoriesValue: string | null = '';
    let subCategoriesValue: string | null = '';
    let accountDestinyValue = form.accountDestiny;
    if (value === 'Transferência') {
      valueAccount = valueAccount === selectedAccountText
        ? selectOriginText : form.account;
      categoriesValue = null;
      subCategoriesValue = null;
    } else {
      accountDestinyValue = 'Selecione destino';
      valueAccount = valueAccount === selectedAccountText
        ? selectOriginText : form.account;
    }
    setForm({
      ...form,
      account: valueAccount,
      accountDestiny: accountDestinyValue,
      category: categoriesValue,
      subCategory: subCategoriesValue,
      type,
    });
  };

  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => { setForm({ ...form, [id]: value }); };

  return {
    form,
    setForm,
    handleChangeValue,
    handleChangeType,
    handleChange,
  };
}

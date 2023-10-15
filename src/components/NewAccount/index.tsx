import { useState } from 'react';

const INITIAL_STATE = {
  name: '',
  balance: 0,
  type: 'conta-corrente',
};

export default function NewAccount() {
  const [form, setForm] = useState(INITIAL_STATE);

  const handleChange = (
    { target: { id, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [id]: value });
  };

  return (
    <form>
      <label htmlFor="name">Nome</label>
      <input
        type="text"
        id="name"
        value={ form.name }
        onChange={ handleChange }
      />
      <label htmlFor="balance">Saldo</label>
      <input
        type="number"
        id="balance"
        value={ form.balance }
        onChange={ handleChange }
      />
      <label htmlFor="type">Tipo</label>
      <select
        id="type"
        value={ form.type }
        onChange={ handleChange }
      >
        <option value="conta-corrente">Conta Corrente</option>
        <option value="conta-poupanca">Conta Poupança</option>
        <option value="conta-investimento">Conta Investimento</option>
      </select>
      <button type="submit">Criar</button>
    </form>
  );
}

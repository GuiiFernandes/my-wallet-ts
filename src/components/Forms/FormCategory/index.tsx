import { useState } from 'react';
import { BiSolidMessageSquareAdd } from 'react-icons/bi';

import styles1 from '../FormLayout/formlayout.module.css';
import styles2 from './formCategory.module.css';

const styles = { ...styles1, ...styles2 };

interface Props {
  onSubmit: (input: string, category?: string) => Promise<void>;
  placeholder: string;
  category: string | undefined;
}

export default function FormCategory({ onSubmit, placeholder, category }: Props) {
  const [input, setInput] = useState('');
  return (
    <form
      className={ styles.form }
      onSubmit={ async (e) => {
        e.preventDefault();
        await onSubmit(input, category);
        setInput('');
      } }
    >
      <input
        onChange={ ({ target }) => setInput(target.value) }
        id="category"
        type="text"
        placeholder={ placeholder }
        value={ input }
        className={ styles.input }
      />
      <button className={ styles.addBtn }>
        <BiSolidMessageSquareAdd size="30px" />
      </button>
    </form>
  );
}

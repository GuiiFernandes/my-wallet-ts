import { Dispatch, SetStateAction } from 'react';
import { IoAdd } from 'react-icons/io5';

import styles from './btnAddCat.module.css';

type BtnAddCatProps = {
  keyState: string;
  addSub: Record<string, boolean>;
  setAddSub: Dispatch<SetStateAction<Record<string, boolean>>>;
};

export default function BtnAddCat({ keyState, addSub, setAddSub }: BtnAddCatProps) {
  return (
    <button
      className={ styles.addBtn }
      type="button"
      onClick={ () => setAddSub({ ...addSub, [keyState]: !addSub[keyState] }) }
      style={ {
        transform: addSub[keyState] ? 'rotate(45deg)' : 'rotate(0deg)',
        color: addSub[keyState] ? 'var(--light-red)' : 'var(--light-green)',
        transition: 'transform 0.3s ease-in',
      } }
    >
      <IoAdd size="25px" />
    </button>
  );
}

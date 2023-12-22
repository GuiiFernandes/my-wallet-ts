import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

import { NewCategoryType, StateRedux } from '../../../types/State';
import firebaseFuncs from '../../../utils/firebaseFuncs';
import BtnsForm from '../BtnsForm';
import FormLayout from '../FormLayout';
import styles from '../FormLayout/formlayout.module.css';
import { changeOperationls } from '../../../redux/reducers/operationals';

export default function NewCategory() {
  const dispatch = useDispatch();
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const { categories } = useSelector(({ data }: StateRedux) => data.configurations);
  const [category, setCategory] = useState('');
  return (
    <FormLayout>
      <form
        className={ styles.containerForm }
        onSubmit={ async (e) => {
          e.preventDefault();
          await firebaseFuncs.create({
            uid, docName: 'configurations', key: 'categories',
          }, [...categories, category]);
          dispatch(changeOperationls({ newCategory: false }));
        } }
      >
        <h2 className={ styles.h2 }>Adicionar Categoria</h2>
        <label htmlFor="category" className={ styles.label }>
          Nome:
          <input
            onChange={ ({ target }) => setCategory(target.value) }
            id="category"
            type="text"
            value={ category }
            className={ styles.input }
          />
        </label>
        <BtnsForm<NewCategoryType> value={ { newCategory: false } } />
      </form>
    </FormLayout>
  );
}

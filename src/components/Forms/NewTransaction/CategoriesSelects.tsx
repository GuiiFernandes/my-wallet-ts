import { useState } from 'react';
import { useSelector } from 'react-redux';
import { BiSolidMessageSquareAdd } from 'react-icons/bi';

import { set } from 'date-fns';
import { SubCategory } from '../../../types/Data';
import { FormTransaction } from '../../../types/LocalStates';
import styles1 from '../FormLayout/formlayout.module.css';
import styles2 from './NewTransaction.module.css';
import BtnAddCat from '../../Btns/BtnAddCat';
import firebaseFuncs from '../../../utils/firebaseFuncs';
import { StateRedux } from '../../../types/State';

const styles = { ...styles1, ...styles2 };

type CategoriesSelectsProps = {
  form: FormTransaction,
  setForm: React.Dispatch<React.SetStateAction<FormTransaction>>;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  categories: string[];
  subCategories: SubCategory[];
};

const INITIAL_STATE = {
  category: '',
  subCategory: '',
};

export default function CategoriesSelects({
  form, setForm, handleChange, categories, subCategories,
}: CategoriesSelectsProps) {
  const [addSub, setAddSub] = useState<Record<string, boolean>>({
    category: false,
    subCategory: false,
  });
  const [catForm, setCatForm] = useState(INITIAL_STATE);
  const { uid } = useSelector(({ user }: StateRedux) => user);

  const addCategory = async () => {
    await firebaseFuncs.create(
      { uid, docName: 'configurations', key: 'categories' },
      [...categories, catForm.category].sort((a, b) => a.localeCompare(b)),
    );
    setForm({ ...form, category: catForm.category });
    setCatForm(INITIAL_STATE);
    setAddSub({ ...addSub, category: false });
  };

  const addSubCategory = async () => {
    const subCat = {
      category: form.category,
      name: catForm.subCategory,
    };
    await firebaseFuncs.create(
      { uid, docName: 'configurations', key: 'subCategories' },
      [...subCategories, subCat].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setForm({ ...form, subCategory: catForm.subCategory });
    setCatForm(INITIAL_STATE);
    setAddSub({ ...addSub, subCategory: false });
  };

  return (
    <>
      <label htmlFor="category" className={ styles.label }>
        <span className={ styles.spanAddCat }>
          Categoria:
          <BtnAddCat
            keyState="category"
            addSub={ addSub }
            setAddSub={ setAddSub }
          />
        </span>
        { addSub.category ? (
          <div className={ styles.form }>
            <input
              onChange={ ({ target }) => setCatForm({
                ...catForm,
                [target.id]: target.value,
              }) }
              id="category"
              type="text"
              placeholder="Nova Categoria"
              value={ catForm.category }
              className={ styles.input }
            />
            <button
              type="button"
              className={ styles.addBtn }
              onClick={ addCategory }
            >
              <BiSolidMessageSquareAdd size="30px" />
            </button>
          </div>
        ) : (
          <select
            id="category"
            className={ styles.input }
            value={ form.category || '' }
            onChange={ handleChange }
          >
            { categories.map((category) => (
              <option className={ styles.option } key={ category } value={ category }>
                { category }
              </option>
            )) }
          </select>
        )}
      </label>
      <label htmlFor="subCategory" className={ styles.label }>
        <span className={ styles.spanAddCat }>
          Sub-Categoria:
          <BtnAddCat
            keyState="subCategory"
            addSub={ addSub }
            setAddSub={ setAddSub }
          />
        </span>
        { addSub.subCategory ? (
          <div className={ styles.form }>
            <input
              onChange={ ({ target }) => setCatForm({
                ...catForm,
                [target.id]: target.value,
              }) }
              id="subCategory"
              type="text"
              placeholder="Nova Sub-Categoria"
              value={ catForm.subCategory }
              className={ styles.input }
            />
            <button
              type="button"
              className={ styles.addBtn }
              onClick={ addSubCategory }
            >
              <BiSolidMessageSquareAdd size="30px" />
            </button>
          </div>
        ) : (
          <select
            id="subCategory"
            className={ styles.input }
            value={ form.subCategory || '' }
            onChange={ handleChange }
          >
            { subCategories
              .filter(({ category }) => category === form.category)
              .map(({ name }) => (
                <option key={ name } value={ name } className={ styles.option }>
                  { name }
                </option>
              )) }
          </select>
        )}
      </label>
    </>
  );
}

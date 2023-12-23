import { useSelector } from 'react-redux';
import { IoAdd } from 'react-icons/io5';

import { useState } from 'react';

import { StateRedux } from '../../../types/State';
import FormCategory from '../../Forms/FormCategory';
import styles1 from './categories.module.css';
import firebaseFuncs from '../../../utils/firebaseFuncs';
import { SubCategory } from '../../../types/Data';
import styles2 from '../configurations.module.css';

type ObjInit = {
  [key: string]: boolean;
};

const styles = { ...styles1, ...styles2 };
const objInit: ObjInit = {};

export default function Categories() {
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const {
    categories,
    subCategories,
  } = useSelector(({ data }: StateRedux) => data.configurations);
  const initialAddSub = categories.reduce((acc, category) => {
    acc[category] = false;
    return acc;
  }, objInit);
  const [addSub, setAddSub] = useState(initialAddSub);

  const addCategory = async (input: string) => {
    await firebaseFuncs.create(
      { uid, docName: 'configurations', key: 'categories' },
      [...categories, input].sort((a, b) => a.localeCompare(b)),
    );
  };

  const addSubCategory = async (input: string, category?: string) => {
    if (!category) throw new Error('Category is undefined');
    const subCat = {
      category,
      name: input,
    };
    await firebaseFuncs.create(
      { uid, docName: 'configurations', key: 'subCategories' },
      [...subCategories, subCat].sort((a, b) => a.name.localeCompare(b.name)),
    );
  };
  return (
    <div className={ styles.container }>
      <ul className={ styles.listCatContainer }>
        {categories.map((category) => (
          <li key={ category } className={ styles.listCatItem }>
            <div className={ styles.categoryContainer }>
              {category}
              <button
                className={ styles.addBtn }
                type="button"
                onClick={ () => setAddSub({ ...addSub, [category]: !addSub[category] }) }
                style={ {
                  transform: addSub[category] ? 'rotate(45deg)' : 'rotate(0deg)',
                  color: addSub[category] ? 'var(--light-red)' : 'var(--light-green)',
                  transition: 'transform 0.3s ease-in',
                } }
              >
                <IoAdd size="25px" className={ styles.addIcon } />
              </button>
            </div>
            <ul className={ styles.subCatContainer }>
              {subCategories
                .filter((subCat: SubCategory) => subCat.category === category)
                .map((subCat: SubCategory) => (
                  <li key={ subCat.name } className={ styles.subCatListItem }>
                    {subCat.name}
                  </li>
                ))}
              { addSub[category] && (
                <FormCategory
                  onSubmit={ addSubCategory }
                  placeholder="Nova Sub-Categoria"
                  category={ category }
                />
              )}
            </ul>
          </li>
        ))}
      </ul>
      <FormCategory
        onSubmit={ addCategory }
        placeholder="Nova Categoria"
        category={ undefined }
      />
    </div>
  );
}

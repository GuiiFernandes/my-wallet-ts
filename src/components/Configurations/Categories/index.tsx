import { useSelector } from 'react-redux';
import { useState } from 'react';

import { StateRedux } from '../../../types/State';
import FormCategory from '../../Forms/FormCategory';
import styles1 from './categories.module.css';
import firebaseFuncs from '../../../utils/firebaseFuncs';
import { SubCategory } from '../../../types/Data';
import styles2 from '../configurations.module.css';
import BtnAddCat from '../../Btns/BtnAddCat';

const styles = { ...styles1, ...styles2 };
const objInit: Record<string, boolean> = {};

const TYPES = ['Receita', 'Despesa'];

export default function Categories() {
  const { uid } = useSelector(({ user }: StateRedux) => user);
  const {
    categories,
    subCategories,
  } = useSelector(({ data }: StateRedux) => data.configurations);
  const initialAddSub = categories.reduce((acc, category) => {
    acc[category.name] = false;
    return acc;
  }, objInit);
  const [addSub, setAddSub] = useState(initialAddSub);

  const addCategory = async (name: string, type?: string) => {
    if (!type) throw new Error('Type is undefined');
    await firebaseFuncs.update(
      { uid, docName: 'configurations', key: 'categories' },
      [...categories, { name, type }].sort((a, b) => a.name.localeCompare(b.name)),
    );
  };

  const addSubCategory = async (input: string, category?: string) => {
    if (!category) throw new Error('Category is undefined');
    const subCat = {
      category,
      name: input,
    };
    await firebaseFuncs.update(
      { uid, docName: 'configurations', key: 'subCategories' },
      [...subCategories, subCat].sort((a, b) => a.name.localeCompare(b.name)),
    );
  };
  return (
    <div className={ styles.categoriesContainer }>
      { TYPES.map((type) => (
        <div key={ type } className={ styles.typesContainer }>
          <ul className={ styles.listCatContainer }>
            <h2
              style={ {
                color: type === 'Receita' ? 'var(--light-green)' : 'var(--light-red)',
                marginBottom: '10px',
              } }
            >
              {`${type}s`}
            </h2>
            {categories.filter((category) => category.type === type).map((category) => (
              <li key={ category.name } className={ styles.listCatItem }>
                <div className={ styles.categoryContainer }>
                  {category.name}
                  <BtnAddCat
                    keyState={ category.name }
                    addSub={ addSub }
                    setAddSub={ setAddSub }
                  />
                </div>
                <ul className={ styles.subCatContainer }>
                  {subCategories
                    .filter((subCat) => subCat.category === category.name)
                    .map((subCat: SubCategory) => (
                      <li key={ subCat.name } className={ styles.subCatListItem }>
                        {subCat.name}
                      </li>
                    ))}
                  { addSub[category.name] && (
                    <FormCategory
                      onSubmit={ addSubCategory }
                      placeholder="Nova Sub-Categoria"
                      category={ category.name }
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
            type={ type }
          />
        </div>
      ))}
    </div>
  );
}

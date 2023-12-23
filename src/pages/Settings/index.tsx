import { useEffect, useState } from 'react';
import { MdArrowForwardIos } from 'react-icons/md';

import useLogin from '../../hooks/useLogin';
import Categories from '../../components/Configurations/Categories';
import styles from './settings.module.css';

export default function Settings() {
  const [menuShows, setMenuShows] = useState({
    categoryAndSub: false,
  });
  const { validateLogin } = useLogin();

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
    <div className={ styles.container }>
      <button
        className={ styles.menuBtn }
        name="categoryAndSub"
        onClick={ () => setMenuShows({ categoryAndSub: !menuShows.categoryAndSub }) }
        style={ {
          color: menuShows.categoryAndSub ? 'var(--light-green)' : 'var(--white)',
          transition: 'color 0.3s ease-in',
        } }
      >
        <MdArrowForwardIos
          style={ {
            transform: menuShows.categoryAndSub ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-in',
          } }
        />
        Categorias e Sub-Categorias
      </button>
      {menuShows.categoryAndSub && (
        <Categories />
      )}
    </div>
  );
}

import { useState } from 'react';
import { MdArrowForwardIos } from 'react-icons/md';

import Categories from '../../components/Configurations/Categories';

export default function Settings() {
  const [menuShows, setMenuShows] = useState({
    categoryAndSub: false,
  });

  return (
    <div>
      <button
        name="categoryAndSub"
        onClick={ () => setMenuShows({ categoryAndSub: !menuShows.categoryAndSub }) }
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

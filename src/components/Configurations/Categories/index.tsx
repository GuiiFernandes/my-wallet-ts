import { useDispatch, useSelector } from 'react-redux';
import { StateRedux } from '../../../types/State';
import { changeOperationls } from '../../../redux/reducers/operationals';

export default function Categories() {
  const dispatch = useDispatch();
  const { categories } = useSelector(({ data }: StateRedux) => data.configurations);
  return (
    <>
      <ul>
        {categories.map((category) => (
          <li key={ category }>{category}</li>
        ))}
      </ul>
      <button onClick={ () => dispatch(changeOperationls({ newCategory: true })) }>
        Adicionar Categoria
      </button>
      <button>Adicionar Sub-Categoria</button>
    </>
  );
}

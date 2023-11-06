import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi';
import { TbPigMoney } from 'react-icons/tb';
import { FaMoneyBillTransfer } from 'react-icons/fa6';

import styles from './NewTransaction.module.css';

type Props = {
  index: number;
  type: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const infos = [
  {
    title: 'Despesa',
    color: 'var(--red)',
    icon: (<GiPayMoney size="30px" />),
  },
  {
    title: 'Receita',
    color: 'var(--light-green)',
    icon: (<GiReceiveMoney size="30px" />),
  },
  {
    title: 'Transferência',
    color: 'var(--light-gray)',
    icon: (<FaMoneyBillTransfer size="30px" />),
  },
  {
    title: 'Investimento',
    color: 'var(--blue)',
    icon: (<TbPigMoney size="30px" />),
  },
];

export default function TypeBtn({ index, type, handleChange }: Props) {
  return (
    <label
      className={ styles.labelType }
      style={ {
        backgroundColor: type === infos[index].title
          ? infos[index].color : 'var(--white)',
      } }
    >
      <input
        type="radio"
        id="type"
        value={ infos[index].title }
        checked={ type === infos[index].title }
        onChange={ handleChange }
        style={ { display: 'none' } }
      />
      {infos[index].icon}
      {infos[index].title}
    </label>
  );
}

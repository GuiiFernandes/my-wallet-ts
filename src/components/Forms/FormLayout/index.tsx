import styles from './formlayout.module.css';

type Props = {
  children: React.ReactNode;
};

export default function FormLayout({ children }: Props) {
  return (
    <div className={ styles.container }>
      { children }
    </div>
  );
}

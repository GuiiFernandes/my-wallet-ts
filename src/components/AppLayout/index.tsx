import { Outlet } from 'react-router-dom';

import styles from './AppLayout.module.css';
import Header from '../Header';

export default function AppLayout() {
  return (
    <section className={ styles.background }>
      <div className={ styles.header }>
        <Header />
      </div>
      <div className={ styles.containerMain }>
        <Outlet />
      </div>
    </section>
  );
}

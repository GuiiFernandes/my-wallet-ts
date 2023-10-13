import { Outlet } from 'react-router-dom';

import styles from './AppLayout.module.css';
import Header from '../Header';
import Footer from '../Footer';

export default function AppLayout() {
  return (
    <section className={ styles.background }>
      <div className={ styles.header }>
        <Header />
      </div>
      <Outlet />
    </section>
  );
}

import { Outlet } from 'react-router-dom';

import styles from '../../App.module.css';

export default function Layout() {
  return (
    <main className={ styles.page }>
      <Outlet />
    </main>
  );
}

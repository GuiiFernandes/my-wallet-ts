import { useEffect } from 'react';

import useLogin from '../../hooks/useLogin';
import styles from './Home.module.css';

export default function Home() {
  const { validateLogin } = useLogin();
  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
    <div>Home</div>
  );
}

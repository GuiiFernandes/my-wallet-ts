import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import useLogin from '../../hooks/useLogin';
import styles from './Home.module.css';

export default function Home() {
  const { validateLogin } = useLogin();
  useEffect(() => {
    validateLogin();
  }, []);

  return (
    <div>Home</div>
  );
}

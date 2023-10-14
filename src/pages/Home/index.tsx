import { useEffect } from 'react';

import useLogin from '../../hooks/useLogin';
import Accounts from '../../components/ResumeCards/Accounts';
import Investiments from '../../components/ResumeCards/Investiments';
import styles from './Home.module.css';

export default function Home() {
  const { validateLogin } = useLogin();
  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
    <>
      <Accounts />
      <Investiments />
    </>
  );
}

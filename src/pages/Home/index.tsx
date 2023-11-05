import { useEffect } from 'react';

import useLogin from '../../hooks/useLogin';
import AccountsCard from '../../components/ResumeCards/AccountsCard';
import Investiments from '../../components/ResumeCards/Investiments';
import styles from './Home.module.css';

export default function Home() {
  const { validateLogin, listenerData } = useLogin();
  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
    <>
      <AccountsCard />
      {/* <Investiments /> */}
    </>
  );
}

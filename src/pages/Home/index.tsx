import { useEffect } from 'react';

import useFirebase from '../../hooks/useFirebase';
import AccountsCard from '../../components/ResumeCards/AccountsCard';
import Investiments from '../../components/ResumeCards/Investiments';
import styles from './Home.module.css';

export default function Home() {
  const { validateLogin, listenerData } = useFirebase();
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

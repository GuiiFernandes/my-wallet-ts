import { useEffect } from 'react';

import useLogin from '../../hooks/useLogin';
import AccountsCard from '../../components/ResumeCards/AccountsCard';
import WalletCard from '../../components/ResumeCards/WalletCard';
import styles from './Home.module.css';
// import Investiments from '../../components/ResumeCards/Investiments';
// import styles from './Home.module.css';

export default function Home() {
  const { validateLogin } = useLogin();
  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  return (
    <div className={ styles.container }>
      <AccountsCard />
      <WalletCard />
      {/* <Investiments /> */}
    </div>
  );
}

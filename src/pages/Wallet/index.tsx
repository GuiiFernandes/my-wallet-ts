import { useEffect } from 'react';

import useLogin from '../../hooks/useLogin';
import MonthSelector from '../../components/MonthSelector';
import WalletTable from '../../components/Tables/WalletTable';

export default function Wallet() {
  const { validateLogin } = useLogin();
  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);
  return (
    <>
      <MonthSelector />
      <WalletTable />
    </>
  );
}

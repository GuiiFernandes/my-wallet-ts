import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { StateRedux } from '../../types/State';
import useFirebase from '../../hooks/useFirebase';
import MonthSelector from '../../components/MonthSelector';

export default function Wallet() {
  const { validateLogin } = useFirebase();
  const { transactions } = useSelector(({ data }: StateRedux) => data);
  const { month, monthString } = useSelector(
    ({ operationals }: StateRedux) => operationals.monthSelected,
  );
  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);
  return (
    <>
      <MonthSelector />
      <div>Wallet</div>
    </>
  );
}

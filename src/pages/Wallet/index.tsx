import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { StateRedux } from '../../types/State';
import useFirebase from '../../hooks/useFirebase';
import { mouths } from '../../utils/datas';

export default function Wallet() {
  const [mounth, setMounth] = useState<string>('');
  const { validateLogin } = useFirebase();
  const { transactions } = useSelector(({ data }: StateRedux) => data);
  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);
  return (
    <div>Wallet</div>
  );
}

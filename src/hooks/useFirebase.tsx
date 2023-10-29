import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { saveUser } from '../redux/reducers/user';
import { initialState, updateData } from '../redux/reducers/data';
import { StateRedux } from '../types/State';
import styles from './useFirebase.module.css';
import { Data } from '../types/Data';
import { addNewUser } from '../utils/firebaseFuncs';
import { RealForm } from '../types/LocalStates';

const TIME_OUT = 700;

export default function useFirebase() {
  const [userLoading, setUserLoading] = useState(true);
  const userLogged = useSelector(({ user }: StateRedux) => user);
  const { banks } = useSelector(({ data }: StateRedux) => data);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { accounts } = banks;
  const pathsIsLogin = ['/'];

  const validateLogin = async (): Promise<boolean | undefined> => {
    if (userLogged.uid) return;
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { displayName, email, photoURL, uid, phoneNumber } = user;
        dispatch(saveUser({ displayName, email, photoURL, uid, phoneNumber }));
        await addNewUser(user);
        if (pathsIsLogin.includes(pathname)) {
          setTimeout(() => {
            goHome();
            setUserLoading(false);
          }, TIME_OUT);
        }
      } else if (!pathsIsLogin.includes(pathname)) {
        setUserLoading(true);
        backLogin();
        setUserLoading(false);
      }
    });
    if (!userLogged.uid) {
      setTimeout(() => {
        setUserLoading(false);
      }, TIME_OUT);
    }
  };

  const listenerData = () => {
    if (!userLogged.uid) return;
    onSnapshot(collection(db, userLogged.uid), (data) => {
      let newData: Data = initialState;
      data.forEach((docData) => {
        newData = { ...newData, [docData.id]: docData.data() };
      });
      dispatch(updateData(newData));
    });
  };

  const goHome = async () => {
    const title = document.getElementById('title-container');
    const form = document.getElementById('form');
    if (title && form) {
      form.classList.add(styles.goWalletForm);
      title.classList.add(styles.goWallet);
    }
    navigate('/home');
  };

  const backLogin = () => {
    navigate('/');
  };

  const saveReal = async (id: number, name: string, realForm: RealForm) => {
    const accountsChanged = [...accounts];
    const indexAccount = accountsChanged.findIndex((account) => account.id === id);
    if (indexAccount !== -1) {
      accountsChanged[indexAccount].real = Number(realForm[name]);
    }
    await setDoc(doc(db, userLogged.uid, 'banks'), {
      ...banks,
      accounts: accountsChanged,
    });
  };

  return {
    validateLogin,
    userLoading,
    goHome,
    listenerData,
    saveReal,
  };
}

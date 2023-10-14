import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import styles from './useLogin.module.css';
import { banksModel, budgetsModel, investmentsModel,
  transactionsModel } from '../utils/dataModel';
import { db } from '../services/firebase';
import { saveUser } from '../redux/reducers/user';

const TIME_OUT = 700;

export default function useLogin() {
  const [userLoading, setUserLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const pathsIsLogin = ['/'];

  const validateLogin = async () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      setUserLoading(true);
      if (user) {
        const { displayName, email, photoURL, uid, phoneNumber } = user;
        dispatch(saveUser({ displayName, email, photoURL, uid, phoneNumber }));
        const docRef = doc(db, user.uid, 'transactions');
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await Promise.all([
            setDoc(doc(db, user.uid, 'transactions'), transactionsModel),
            setDoc(doc(db, user.uid, 'investments'), investmentsModel),
            setDoc(doc(db, user.uid, 'banks'), banksModel),
            setDoc(doc(db, user.uid, 'budgets'), budgetsModel),
          ]);
        }
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
      } else {
        setUserLoading(false);
      }
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

  return { validateLogin, userLoading, goHome };
}

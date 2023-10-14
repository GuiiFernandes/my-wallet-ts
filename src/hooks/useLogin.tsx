import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import styles from './useLogin.module.css';
import { banks, budgets, investments, transactions } from '../utils/dataModel';
import { db } from '../services/firebase';

const TIME_OUT = 700;

export default function useLogin() {
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const pathsIsLogin = ['/'];

  const validateLogin = async () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserLoading(true);
        const docRef = doc(db, user.uid, 'transactions');
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await Promise.all([
            setDoc(doc(db, user.uid, 'transactions'), transactions),
            setDoc(doc(db, user.uid, 'investments'), investments),
            setDoc(doc(db, user.uid, 'banks'), banks),
            setDoc(doc(db, user.uid, 'budgets'), budgets),
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

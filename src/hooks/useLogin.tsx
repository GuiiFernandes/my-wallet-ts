import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { saveUser } from '../redux/reducers/user';
import styles from './useLogin.module.css';

const TIME_OUT = 700;

export default function useLogin() {
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const pathsIsLogin = ['/'];

  const validateLogin = async () => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, displayName, email, photoURL, phoneNumber } = user;
        dispatch(saveUser({ uid, displayName, email, photoURL, phoneNumber }));
        if (pathsIsLogin.includes(pathname)) {
          setTimeout(() => {
            goHome();
            setUserLoading(false);
          }, TIME_OUT);
        }
      } else if (!pathsIsLogin.includes(pathname)) {
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

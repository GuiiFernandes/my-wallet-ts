import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { saveUser } from '../redux/reducers/user';
import { initialState, updateData } from '../redux/reducers/data';
import { banksModel, budgetsModel, investmentsModel,
  transactionsModel } from '../utils/dataModel';
import { StateRedux } from '../types/State';
import styles from './useLogin.module.css';
import { Data } from '../types/Data';

const TIME_OUT = 700;

export default function useFirebase() {
  const [userLoading, setUserLoading] = useState(true);
  const userLogged = useSelector(({ user }: StateRedux) => user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const pathsIsLogin = ['/'];

  const loadingFalse = () => {
    setTimeout(() => {
      setUserLoading(false);
    }, TIME_OUT);
  };

  const validateLogin = async (): Promise<boolean | undefined> => {
    if (userLogged.uid) return;
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
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

  return { validateLogin, userLoading, goHome, listenerData };
}

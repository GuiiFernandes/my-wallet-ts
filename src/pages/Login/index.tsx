import { useEffect } from 'react';
import { browserLocalPersistence, getAuth,
  setPersistence, signInWithPopup } from 'firebase/auth';

import useFirebase from '../../hooks/useFirebase';
import Loading from '../../components/Loading';
import { provider } from '../../services/firebase';
import logo from '../../images/logo.svg';
import logoG from '../../images/google-icon.svg';
import styles from './Login.module.css';

export default function Login() {
  const { validateLogin, userLoading } = useFirebase();

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  const handleSubmit = async () => {
    const auth = getAuth();
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, provider);
  };

  return userLoading ? (
    <Loading />
  ) : (
    <section className={ styles.login }>
      <div id="title-container" className={ styles.titleContainer }>
        <img className={ styles.logo } src={ logo } alt="Logo" />
        <h1 className={ styles.title }>My Wallet</h1>
      </div>
      <form
        className={ styles.form }
        id="form"
        onSubmit={ (e) => {
          e.preventDefault();
          handleSubmit();
        } }
      >
        <button
          className={ styles.btnLogin }
        >
          <img src={ logoG } alt="Google Login" className={ styles.logoG } />
          Entrar
        </button>
      </form>
    </section>
  );
}

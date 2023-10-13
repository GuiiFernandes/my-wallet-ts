import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { browserLocalPersistence, getAuth,
  setPersistence,
  signInWithPopup } from 'firebase/auth';

import useLogin from '../../hooks/useLogin';
import Loading from '../../components/Loading';
import { saveUser } from '../../redux/reducers/user';
import { provider } from '../../services/firebase';
import logo from '../../images/logo.svg';
import logoG from '../../images/google-icon.svg';
import styles from './Login.module.css';

export default function Login() {
  const [acceptCookies, setAcceptCookies] = useState(true);
  const dispatch = useDispatch();
  const { validateLogin, loading } = useLogin();

  useEffect(() => {
    (async () => {
      await validateLogin();
    })();
  }, []);

  const handleSubmit = async () => {
    const auth = getAuth();
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, provider);
    const { uid, displayName, email, photoURL, phoneNumber } = result.user;
    dispatch(saveUser({ uid, displayName, email, photoURL, phoneNumber }));
  };

  return loading ? (
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
          <img src={ logoG } alt="Google" className={ styles.logoG } />
          Entrar
        </button>
        <label>
          <input
            type="checkbox"
            name="acceptCookies"
            id="acceptCookies"
            checked={ acceptCookies }
            onChange={ () => setAcceptCookies(!acceptCookies) }
          />
          Desmarque essa opção para rejeitar os Cookies de login
        </label>
        <p className={ styles.legend }>
          Manter essa opção marcado te mantém logado na aplicação.
        </p>
      </form>
    </section>
  );
}

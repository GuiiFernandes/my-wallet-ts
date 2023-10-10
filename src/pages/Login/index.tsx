import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, getAuth,
  signInWithPopup } from 'firebase/auth';

import { provider } from '../../services/firebase';
import logo from '../../images/logo.svg';
import logoG from '../../images/google-icon.svg';
import styles from './Login.module.css';
import { saveUser } from '../../redux/reducers/user';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const auth = getAuth();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const { uid, displayName, email, photoURL, phoneNumber } = result.user;
    const accessToken = credential?.accessToken;
    const TIME_OUT = 700;
    dispatch(saveUser({ uid, displayName, email, photoURL, phoneNumber, accessToken }));
    const title = document.getElementById('title');
    const imgTitle = document.getElementById('imgTitle');
    const form = document.querySelector('form');
    if (title && imgTitle && form) {
      form.classList.add(styles.goWalletForm);
      title.classList.add(styles.goWallet);
      imgTitle.classList.add(styles.goWallet);
    }
    setTimeout(() => {
      navigate('/carteira');
    }, TIME_OUT);
  };

  return (
    <section className={ styles.login }>
      <div className={ styles.titleContainer }>
        <img className={ styles.logo } id="title" src={ logo } alt="Logo" />
        <h1 className={ styles.title } id="imgTitle">My Wallet</h1>
      </div>
      <form
        className={ styles.form }
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
      </form>
    </section>
  );
}

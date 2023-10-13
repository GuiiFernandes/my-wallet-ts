import logo from '../../images/logo.svg';
import loadingCoin from '../../images/loading-coin.gif';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <section className={ styles.login }>
      <div className={ styles.titleContainer }>
        <img className={ styles.logo } id="title" src={ logo } alt="Logo" />
        <h1 className={ styles.title } id="imgTitle">My Wallet</h1>
      </div>
      <div id="form" className={ styles.form }>
        <img src={ loadingCoin } alt="loading" className={ styles.loadingCoin } />
        <span>Carregando . . .</span>
      </div>
    </section>
  );
}

import { useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { BsCashCoin } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';

import logo from '../../images/logo.svg';
import styles from './Header.module.css';
import { StateRedux } from '../../types/State';

export default function Header() {
  const navigate = useNavigate();
  const { displayName, photoURL } = useSelector(({ user }: StateRedux) => user);

  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/');
  };

  return (
    <>
      <header className={ styles.header }>
        <div className={ styles.titleContainer }>
          <img className={ styles.logo } src={ logo } alt="logo" />
          <h1 className={ styles.title }>My Wallet</h1>
        </div>
        <div className={ styles.total }>
          <BsCashCoin size="2.5rem" />
          <p>
            <strong>Saldo Total:</strong>
            {' '}
            <span data-testid="total-field">
              { 0 }
            </span>
            {' '}
            <span data-testid="header-currency-field">BRL</span>
          </p>
        </div>
        <div className={ styles.user }>
          { photoURL ? (
            <img src={ photoURL } alt="user" className={ styles.img } />
          ) : (
            <CgProfile size="40px" />
          )}
          <p data-testid="email-field">{displayName}</p>
        </div>
      </header>
      <nav className={ styles.nav }>
        <NavLink to="/home" className={ styles.a }>Home</NavLink>
        <NavLink to="/contas" className={ styles.a }>Contas</NavLink>
        <NavLink to="/carteira" className={ styles.a }>Carteira</NavLink>
        <NavLink to="/cartoes" className={ styles.a }>Cartões</NavLink>
        {/* <NavLink to="/investimentos" className={ styles.a }>Investimentos</NavLink> */}
        <NavLink to="/orcamento" className={ styles.a }>Orçamento</NavLink>
        {/* <NavLink to="/perfil" className={ styles.a }>Perfil</NavLink> */}
        <NavLink to="configuracoes" className={ styles.a }>Configurações</NavLink>
        <button className={ styles.logoutBtn } onClick={ logout }>
          Sair
        </button>
      </nav>
    </>
  );
}

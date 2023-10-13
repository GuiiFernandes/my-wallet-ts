import { FaGithub, FaLinkedinIn } from 'react-icons/fa';

import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={ styles.container }>
      <p className={ styles.p }>
        &copy; 2023
        {' '}
        <strong>Guilherme Fernandes</strong>
        <a
          href="https://github.com/GuiiFernandes"
          target="_blank"
          rel="noopener noreferrer"
          className={ styles.a }
        >
          <FaGithub size="20px" />
        </a>
        <a
          href="https://www.linkedin.com/in/guifernandesdev/"
          target="_blank"
          rel="noopener noreferrer"
          className={ styles.a }
        >
          <FaLinkedinIn size="20px" />
        </a>
      </p>
    </footer>
  );
}

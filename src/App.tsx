import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import About from './pages/About';
import Layout from './components/Layout';
import Home from './pages/Home';
import AppLayout from './components/AppLayout';
import Wallet from './pages/Wallet';
import Footer from './components/Footer';
import Accounts from './pages/Accounts';
import Cards from './pages/Cards';
import Budget from './pages/Budget';
import Settings from './pages/Settings';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={ <Layout /> }>
          <Route path="/" element={ <Login /> } />
          <Route path="/about" element={ <About /> } />
          <Route path="*" element={ <div>Not Found</div> } />
          <Route path="/" element={ <AppLayout /> }>
            <Route path="/home" element={ <Home /> } />
            <Route path="/contas" element={ <Accounts /> } />
            <Route path="/cartoes" element={ <Cards /> } />
            <Route path="/configuracoes" element={ <Settings /> } />
            <Route path="/orcamento" element={ <Budget /> } />
            <Route path="/carteira" element={ <Wallet /> } />
          </Route>
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

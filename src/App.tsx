import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import About from './pages/About';
import Layout from './components/Layout';
import Wallet from './pages/Home';
import AppLayout from './components/AppLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={ <Layout /> }>
        <Route path="/" element={ <Login /> } />
        <Route path="/about" element={ <About /> } />
        <Route path="*" element={ <div>Not Found</div> } />
        <Route path="/" element={ <AppLayout /> }>
          <Route path="/carteira" element={ <Wallet /> } />
        </Route>
      </Route>
    </Routes>
  );
}

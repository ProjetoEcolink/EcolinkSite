import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes Globais
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Páginas do Sistema
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Marketplace from './pages/Marketplace/Marketplace';
import Painel from './pages/Painel/Painel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans transition-colors duration-300">

        {/* O Navbar aparece em todas as páginas */}
        <Navbar />

        {/* Onde a mágica das rotas acontece */}
        <main>
          <Routes>
            {/* Rota da Landing Page */}
            <Route path="/" element={<Home />} />

            {/* Rotas de Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Rotas do MVP (Sistema) */}
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/painel" element={<Painel />} />
          </Routes>
        </main>

        {/* O Footer aparece em todas as páginas */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;

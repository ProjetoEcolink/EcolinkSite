import React from 'react';
<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HeroSection from './sections/HeroSection/HeroSection';
import ProblemSection from './sections/ProblemSection/ProblemSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import AboutSection from './sections/AboutSection/AboutSection';
import AuthSection from './sections/AuthSection/AuthSection';

// Página principal (landing page)
function LandingPage() {
  return (
    <div className="min-h-screen bg-eco-dark text-white font-sans selection:bg-green-400 selection:text-eco-dark">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}

// Página de auth isolada (sem navbar/footer da landing)
function AuthPage() {
  return (
    <div className="min-h-screen bg-eco-dark text-white font-sans">
      <AuthSection />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes Globais
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Páginas do Sistema
import Home from './pages/Home';
import Login from './pages/Login';
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
>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128
  );
}

export default App;
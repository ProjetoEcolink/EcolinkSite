import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Seções Home
import HeroSection from './sections/HeroSection/HeroSection';
import ProblemSection from './sections/ProblemSection/ProblemSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import AboutSection from './sections/AboutSection/AboutSection';

// Páginas
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Cadastro from './pages/Cadastro/Cadastro';
import Dashboard from './pages/Dashboard/Dashboard';
import Marketplace from './pages/Marketplace/Marketplace';
import Painel from './pages/Painel/Painel';

const LandingPage = () => (
  <>
    <section id="home"><HeroSection /></section>
    <section id="o-problema"><ProblemSection /></section>
    <section id="funcionalidades"><FeaturesSection /></section>
    <section id="quem-somos"><AboutSection /></section>
  </>
);

const LayoutHandler = ({ children }) => {
  const location = useLocation();
  const hideLayout = ['/', '/login', '/register', '/cadastro'].includes(location.pathname);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideLayout && <Navbar />}
      <main style={{ flex: '1 0 auto' }}>
        {children}
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LayoutHandler>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '100px', color: 'white' }}>
              <h1>404</h1>
              <p>Página não encontrada</p>
            </div>
          } />
        </Routes>
      </LayoutHandler>
    </BrowserRouter>
  );
}

export default App;
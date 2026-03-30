import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom'; // 🔥 ADICIONA ISSO
import './Navbar.css';
=======
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
<<<<<<< HEAD
  const navigate = useNavigate(); // 🔥 ADICIONA ISSO
=======
>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

<<<<<<< HEAD
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
=======
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'o-problema', 'funcionalidades', 'quem-somos'];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(section);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

<<<<<<< HEAD
  // 🔥 NAVEGA NA MESMA ABA
  const abrirAuth = (modo) => {
    closeMenu();
    navigate(`/auth?modo=${modo}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          Eco<span className="text-eco">Link</span>
        </div>
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Abrir menu">
          {isMenuOpen ? '✕' : '☰'}
        </button>
=======
  return (
    <nav className="navbar">
      <div className="nav-container">

        <div className="nav-logo">
          Eco<span className="text-eco">Link</span>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Abrir menu">
          {isMenuOpen ? '✕' : '☰'}
        </button>

>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128
        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <a href="#home" onClick={closeMenu} className={activeSection === 'home' ? 'active' : ''}>Home</a>
            <a href="#o-problema" onClick={closeMenu} className={activeSection === 'o-problema' ? 'active' : ''}>O Problema</a>
            <a href="#funcionalidades" onClick={closeMenu} className={activeSection === 'funcionalidades' ? 'active' : ''}>Funcionalidades</a>
            <a href="#quem-somos" onClick={closeMenu} className={activeSection === 'quem-somos' ? 'active' : ''}>Quem Somos</a>
          </div>
<<<<<<< HEAD
=======

>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128
          <div className="nav-actions">
            <button onClick={() => { toggleTheme(); closeMenu(); }} className="theme-toggle" aria-label="Mudar tema">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
<<<<<<< HEAD
            <button className="nav-btn-login" onClick={() => abrirAuth('login')}>
              Login
            </button>
            <button className="nav-btn-cadastro" onClick={() => abrirAuth('cadastro')}>
              Cadastrar
            </button>
          </div>
        </div>
=======

            {/* Substitua o <button> de Acesso Antecipado por este <Link> */}
            <Link to="/cadastro" className="nav-cta" onClick={closeMenu}>
              Criar Conta
            </Link>
          </div>
        </div>

>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128
      </div>
    </nav>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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
        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <a href="#home" onClick={closeMenu} className={activeSection === 'home' ? 'active' : ''}>Home</a>
            <a href="#o-problema" onClick={closeMenu} className={activeSection === 'o-problema' ? 'active' : ''}>O Problema</a>
            <a href="#funcionalidades" onClick={closeMenu} className={activeSection === 'funcionalidades' ? 'active' : ''}>Funcionalidades</a>
            <a href="#quem-somos" onClick={closeMenu} className={activeSection === 'quem-somos' ? 'active' : ''}>Quem Somos</a>
          </div>
          <div className="nav-actions">
            <button onClick={() => { toggleTheme(); closeMenu(); }} className="theme-toggle" aria-label="Mudar tema">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="nav-btn-login" onClick={() => abrirAuth('login')}>
              Login
            </button>
            <button className="nav-btn-cadastro" onClick={() => abrirAuth('cadastro')}>
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
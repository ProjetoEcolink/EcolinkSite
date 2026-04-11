import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';


export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const goToSection = (section) => {
    closeMenu();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(section);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  return (
    <nav className="navbar">
      <div className="nav-container">

        <div className="nav-logo" onClick={() => goToSection('home')} style={{ cursor: 'pointer' }}>
          Eco<span className="text-eco">Link</span>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Abrir menu">
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <a onClick={() => goToSection('home')} className={activeSection === 'home' ? 'active' : ''} style={{ cursor: 'pointer' }}>Home</a>
            <a onClick={() => goToSection('o-problema')} className={activeSection === 'o-problema' ? 'active' : ''} style={{ cursor: 'pointer' }}>O Problema</a>
            <a onClick={() => goToSection('funcionalidades')} className={activeSection === 'funcionalidades' ? 'active' : ''} style={{ cursor: 'pointer' }}>Funcionalidades</a>
            <a onClick={() => goToSection('quem-somos')} className={activeSection === 'quem-somos' ? 'active' : ''} style={{ cursor: 'pointer' }}>Quem Somos</a>
          </div>

          <div className="nav-actions">
            <button onClick={() => { toggleTheme(); closeMenu(); }} className="theme-toggle" aria-label="Mudar tema">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <Link to="/cadastro" className="nav-cta" onClick={closeMenu}>
              Criar Conta
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
}
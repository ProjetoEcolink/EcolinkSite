import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    // Busca o tema do sistema ou localStorage para não resetar
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    });
    const [nome, setNome] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            const user = JSON.parse(userStr);
            setNome(user.nome ? user.nome.split(' ')[0] : 'Usuário');
        } else {
            setNome('');
        }
    }, [location]);

    // Aplica o tema e salva no localStorage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const goToSection = (section) => {
        // CORREÇÃO AQUI: Se não estiver na /home, navega para /home primeiro
        if (location.pathname !== '/home') {
            navigate('/home');
            
            // Aguarda a página carregar para fazer o scroll
            setTimeout(() => {
                const element = document.getElementById(section);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        } else {
            // Se já estiver na /home, apenas faz o scroll
            const element = document.getElementById(section);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo" onClick={() => goToSection('home')} style={{ cursor: 'pointer' }}>
                    Eco<span className="text-eco">Link</span>
                </div>

                <div className="nav-menu">
                    <div className="nav-links">
                        <button onClick={() => goToSection('home')} className="nav-link-btn">Home</button>
                        <button onClick={() => goToSection('o-problema')} className="nav-link-btn">O Problema</button>
                        <button onClick={() => goToSection('funcionalidades')} className="nav-link-btn">Funcionalidades</button>
                    </div>
                </div>

                <div className="nav-actions">
                    {nome ? (
                        <Link to="/profile" className="nav-user-link">
                            Olá, <span>{nome}</span>
                        </Link>
                    ) : (
                        <div className="nav-auth-group">
                            <Link to="/login" className="nav-link-login">Entrar</Link>
                            <Link to="/register" className="nav-cta">Criar Conta</Link>
                        </div>
                    )}

                    <button onClick={toggleTheme} className="theme-toggle-nav" title="Alternar Tema">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        </nav>
    );
>>>>>>> origin/master
}
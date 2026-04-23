import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Navbar.css';

function ThemeIcon({ theme }) {
    if (theme === 'light') {
        return (
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M20.354 15.354A9 9 0 1 1 8.646 3.646a7 7 0 0 0 11.708 11.708Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    return (
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10 12h10M17 8l3 4-3 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function Navbar() {
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
            setNome(user.nome ? user.nome.split(' ')[0] : 'Usuario');
        } else {
            setNome('');
        }
    }, [location]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const handleLogout = async () => {
        const confirmou = window.confirm('Tem certeza que deseja sair da conta?');
        if (!confirmou) return;

        await supabase.auth.signOut();
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const goToSection = (section) => {
        if (location.pathname !== '/home') {
            navigate('/home');
            setTimeout(() => {
                const element = document.getElementById(section);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        } else {
            const element = document.getElementById(section);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const isActive = (path) => location.pathname === path;
    const isLogado = !!nome;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo" onClick={() => goToSection('home')} style={{ cursor: 'pointer' }}>
                    Eco<span className="text-eco">Link</span>
                </div>

                <div className="nav-menu">
                    <div className="nav-links">
                        {!isLogado && (
                            <>
                                <button onClick={() => goToSection('home')} className="nav-link-btn">Home</button>
                                <button onClick={() => goToSection('o-problema')} className="nav-link-btn">O Problema</button>
                                <button onClick={() => goToSection('funcionalidades')} className="nav-link-btn">Funcionalidades</button>
                                <button onClick={() => goToSection('quem-somos')} className="nav-link-btn">Nossa História</button>
                            </>
                        )}

                        {isLogado && (
                            <>
                                <span className="nav-divider" />
                                <Link
                                    to="/marketplace"
                                    className={`nav-link-btn ${isActive('/marketplace') ? 'nav-link-active' : ''}`}
                                >
                                    Marketplace
                                </Link>
                                <Link
                                    to="/painel"
                                    className={`nav-link-btn ${isActive('/painel') ? 'nav-link-active' : ''}`}
                                >
                                    Anunciar Lote
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="nav-actions">
                    {isLogado ? (
                        <Link to="/profile" className="nav-user-link">
                            Ola, <span>{nome}</span>
                        </Link>
                    ) : (
                        <div className="nav-auth-group">
                            <Link to="/login" className="nav-link-login">Entrar</Link>
                            <Link to="/register" className="nav-cta">Criar Conta</Link>
                        </div>
                    )}

                    <div className="nav-utility-group">
                        <button onClick={toggleTheme} className="theme-toggle-nav" title="Alternar tema" aria-label="Alternar tema">
                            <ThemeIcon theme={theme} />
                        </button>

                        {isLogado && (
                            <button onClick={handleLogout} className="theme-toggle-nav" title="Sair da conta" aria-label="Sair da conta">
                                <LogoutIcon />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

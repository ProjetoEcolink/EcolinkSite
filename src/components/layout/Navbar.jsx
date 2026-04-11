import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

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
            setNome(user.nome ? user.nome.split(' ')[0] : 'Usuário');
        } else {
            setNome('');
        }
    }, [location]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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
                        <Link to="/marketplace" className="nav-link-btn">Marketplace</Link>
                        <Link to="/painel" className="nav-link-btn">Painel</Link>
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
}
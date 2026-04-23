import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Login.css';

function ThemeIcon({ theme }) {
    if (theme === 'light') {
        return (
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" width="24" height="24">
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
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" width="24" height="24">
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

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', senha: '' });
    const [loading, setLoading] = useState(false);

    const [theme, setTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setTheme(next);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.senha,
        });

        if (error) {
            alert('Erro ao entrar: ' + error.message);
            setLoading(false);
        } else {
            const meta = data.user.user_metadata;
            const usuarioParaSalvar = {
                email: data.user.email,
                nome: meta.nome || 'Usuário',
                perfil: meta.perfil || 'Usuario',
                documento: meta.documento || '',
                telefone: meta.telefone || ''
            };

            localStorage.setItem('usuario', JSON.stringify(usuarioParaSalvar));
            setLoading(false);
            navigate('/home');
        }
    };

    return (
        <div className="auth-page">

            {/* Cabeçalho Falso Limpo */}
            <header className="auth-topbar">
                <Link to="/home" style={{ textDecoration: 'none' }}>
                    <div className="auth-topbar-logo">
                        Eco<span className="text-eco">Link</span>
                    </div>
                </Link>

                <button onClick={toggleTheme} aria-label="Mudar tema" type="button" className="auth-theme-toggle">
                    <ThemeIcon theme={theme} />
                </button>
            </header>

            <div className="auth-container">

                <div className="auth-header">
                    <h2>Bem-vindo</h2>
                    <p>Acesse o marketplace e gerencie seus resíduos eletrônicos.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">E-mail Corporativo</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="seu@empresa.com.br"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Senha de Acesso</label>
                        <input
                            type="password"
                            name="senha"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.senha}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                        <Link to="/esqueci-senha" style={{ color: 'var(--green-eco, #28a745)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Autenticando...' : 'Entrar na Plataforma'}
                    </button>

                    <p className="auth-footer-link" style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-description)', fontSize: '0.9rem' }}>
                        Ainda não tem uma conta? <Link to="/register" style={{ color: 'var(--green-eco, #28a745)', fontWeight: 'bold', textDecoration: 'none' }}>Cadastre-se aqui.</Link>
                    </p>

                    <Link to="/home" className="auth-back-link">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Voltar para Home
                    </Link>
                </form>
            </div>
        </div>
    );
}
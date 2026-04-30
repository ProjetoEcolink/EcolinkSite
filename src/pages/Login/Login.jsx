import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { buildLocalUserFromSupabase, persistAuthenticatedUser } from '../../utils/authUser';
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

function ErrorModal({ message, onClose }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h3 className="modal-title">Erro ao entrar</h3>
                <p className="modal-message">{message}</p>
                <button className="modal-btn" onClick={onClose}>Tentar novamente</button>
            </div>
        </div>
    );
}

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: '', senha: '' });
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

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

    useEffect(() => {
        localStorage.setItem('ecolink-last-auth-page', 'login');

        const params = new URLSearchParams(location.search);
        const emailFromQuery = params.get('email') || '';
        const emailFromStorage = localStorage.getItem('pendingAuthEmail') || '';
        const emailToUse = (emailFromQuery || emailFromStorage).trim();

        if (emailToUse) {
            queueMicrotask(() => {
                setFormData((prev) => ({ ...prev, email: emailToUse }));
                localStorage.setItem('pendingAuthEmail', emailToUse);
            });
        }
    }, [location.search]);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setTheme(next);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'email') {
            localStorage.setItem('pendingAuthEmail', value.trim());
        }
    };

    const tryLocalLogin = () => {
        const emailKey = formData.email.trim().toLowerCase();
        const storedUserRaw = localStorage.getItem(`ecolink-user-${emailKey}`);
        const storedPassword = localStorage.getItem(`ecolink-password-${emailKey}`);

        if (!storedUserRaw) {
            return { ok: false, message: 'Conta não encontrada. Verifique o e-mail ou faça o cadastro.' };
        }

        const passwordFromUserRecord = (() => {
            try {
                const parsed = JSON.parse(storedUserRaw);
                return parsed?.senha || '';
            } catch {
                return '';
            }
        })();

        const expectedPassword = storedPassword || passwordFromUserRecord;

        if (!expectedPassword || formData.senha !== expectedPassword) {
            return { ok: false, message: 'Senha incorreta. Tente novamente.' };
        }

        try {
            const parsedUser = JSON.parse(storedUserRaw);
            const usuarioParaSalvar = {
                email: parsedUser.email || formData.email.trim(),
                nome: parsedUser.nome || 'Usuário',
                perfil: parsedUser.perfil || 'Usuario',
                documento: parsedUser.documento || '',
                telefone: parsedUser.telefone || '',
                authProvider: 'local-legacy',
            };
            localStorage.setItem('usuario', JSON.stringify(usuarioParaSalvar));
            return { ok: true };
        } catch {
            return { ok: false, message: 'Não foi possível carregar os dados da conta. Tente novamente.' };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.senha,
        });

        localStorage.setItem('pendingAuthEmail', formData.email.trim());

        if (error) {
            const localResult = tryLocalLogin();
            if (localResult.ok) {
                setLoading(false);
                navigate('/home');
                return;
            }

            setErrorModal({
                visible: true,
                message: localResult.message || `Nao foi possivel entrar: ${error.message}`,
            });
            setLoading(false);
            return;
        }

        const usuarioParaSalvar = buildLocalUserFromSupabase(data.user);
        persistAuthenticatedUser(usuarioParaSalvar);
        setLoading(false);
        navigate('/home');
    };
    return (
        <div className="auth-page">
            <style>{`
                .auth-container .form-input {
                    padding: 14px 16px;
                    font-size: 1.05rem;
                    min-height: 50px;
                }
                .auth-container .btn-submit {
                    padding: 14px 16px;
                    font-size: 1.1rem;
                    min-height: 50px;
                }
                @media (max-width: 600px) {
                    .auth-container .form-input {
                        padding: 12px 14px;
                        font-size: 1rem;
                        min-height: 46px;
                    }
                    .auth-container .btn-submit {
                        padding: 12px 14px;
                        font-size: 1.05rem;
                        min-height: 46px;
                    }
                }
            `}</style>
            {errorModal.visible && (
                <ErrorModal
                    message={errorModal.message}
                    onClose={() => setErrorModal({ visible: false, message: '' })}
                />
            )}

            <header className="auth-topbar">
                <button
                    className="auth-back-btn"
                    onClick={() => navigate('/home')}
                    title="Voltar"
                    aria-label="Voltar"
                    type="button"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span>Voltar</span>
                </button>

                <button onClick={toggleTheme} aria-label="Mudar tema" type="button" className="auth-theme-toggle">
                    <ThemeIcon theme={theme} />
                </button>
            </header>

            <main className="auth-content">
                <Link to="/home" className="auth-brand-link" aria-label="Ir para a home">
                    <div className="auth-topbar-logo auth-page-logo">
                        Eco<span className="text-eco">Link</span>
                    </div>
                </Link>

                <div className="auth-container">

                    <div className="auth-header">
                        <h2>Bem-vindo</h2>
                        <p>Acesse o marketplace e gerencie seus resíduos eletrônicos.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">E-mail</label>
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

                        <div className="auth-forgot-wrap">
                            <Link to="/esqueci-senha" className="auth-forgot-link">
                                Esqueceu sua senha?
                            </Link>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Autenticando...' : 'Login'}
                        </button>

                        <p className="auth-footer-link">
                            Ainda não tem uma conta? <Link to={formData.email ? `/register?email=${encodeURIComponent(formData.email.trim())}` : '/register'}>Cadastre-se aqui.</Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}

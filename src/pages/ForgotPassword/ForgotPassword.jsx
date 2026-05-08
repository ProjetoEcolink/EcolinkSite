import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { supabase } from '../../supabaseClient';
import { PASSWORD_MAX_LENGTH, validatePasswordStrength } from '../../utils/passwordPolicy';

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

function EyeIcon({ open }) {
    if (open) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );
    }

    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function PasswordInput({ value, onChange, placeholder }) {
    const [show, setShow] = useState(false);

    return (
        <div className="fp-password-wrapper">
            <input
                type={show ? 'text' : 'password'}
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={PASSWORD_MAX_LENGTH}
                required
            />
            <button type="button" className="fp-eye-btn" onClick={() => setShow(!show)} aria-label="Mostrar senha">
                <EyeIcon open={show} />
            </button>
        </div>
    );
}

function isRecoveryFromUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('type') === 'recovery') {
        return true;
    }

    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    return hashParams.get('type') === 'recovery';
}

function getAuthUrlParam(name) {
    const searchParams = new URLSearchParams(window.location.search);
    const searchValue = searchParams.get(name);
    if (searchValue) return searchValue;

    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    return hashParams.get(name);
}

function describeRecoveryEmailError(error) {
    const parts = [error?.message, error?.code, error?.status ? `status ${error.status}` : ''].filter(Boolean);
    const details = parts.length ? ` (${parts.join(' | ')})` : '';
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('failed to fetch') || message.includes('network')) {
        return `Nao foi possivel conectar ao Supabase. Confira se VITE_SUPABASE_URL aponta para um projeto ativo e se o dominio do projeto resolve DNS.${details}`;
    }

    if (message.includes('rate limit')) {
        return `Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.${details}`;
    }

    if (message.includes('redirect')) {
        return `URL de redirecionamento nao autorizada no Supabase. Confira se ${window.location.origin}/esqueci-senha esta em Authentication > URL Configuration.${details}`;
    }

    if (message.includes('email')) {
        return `Falha no provedor de e-mail do Supabase. Confira SMTP, template de recuperacao e limites do projeto.${details}`;
    }

    return `Nao foi possivel enviar o e-mail de recuperacao agora.${details}`;
}

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState(() => localStorage.getItem('pendingAuthEmail') || '');
    const [emailErro, setEmailErro] = useState('');
    const [infoMsg, setInfoMsg] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [senhaErro, setSenhaErro] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryError, setRecoveryError] = useState('');

    const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const bootstrapRecovery = async () => {
            const hasRecovery = isRecoveryFromUrl();
            const authError = getAuthUrlParam('error_description') || getAuthUrlParam('error');
            const code = getAuthUrlParam('code');

            if (authError) {
                setRecoveryError('Link invalido ou expirado. Solicite um novo e-mail de recuperacao.');
                setStep(1);
                window.history.replaceState({}, document.title, '/esqueci-senha');
                return;
            }

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    setRecoveryError('Link invalido ou expirado. Solicite um novo e-mail de recuperacao.');
                    setStep(1);
                    window.history.replaceState({}, document.title, '/esqueci-senha');
                    return;
                }
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (hasRecovery && session?.user?.email) {
                setRecoveryEmail(session.user.email);
                localStorage.setItem('pendingAuthEmail', session.user.email);
            }

            if (hasRecovery || code) {
                setStep(3);
            }
        };

        bootstrapRecovery();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setRecoveryEmail(session?.user?.email || '');
                if (session?.user?.email) {
                    localStorage.setItem('pendingAuthEmail', session.user.email);
                }
                setStep(3);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setTheme(next);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setEmailErro('');
        setInfoMsg('');
        setRecoveryError('');

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setEmailErro('Informe um e-mail valido.');
            return;
        }

        setSendingEmail(true);
        const redirectTo = `${window.location.origin}/esqueci-senha`;
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
        setSendingEmail(false);

        if (error) {
            setEmailErro(describeRecoveryEmailError(error));
            return;
        }

        localStorage.setItem('pendingAuthEmail', cleanEmail);
        setInfoMsg('Enviamos um link de recuperacao para seu e-mail. Abra o link para redefinir a senha.');
        setStep(2);
    };

    const handleSenhaSubmit = async (e) => {
        e.preventDefault();
        setSenhaErro('');

        const senhaValidationError = validatePasswordStrength(novaSenha);
        if (senhaValidationError) {
            setSenhaErro(senhaValidationError);
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setSenhaErro('As senhas nao coincidem.');
            return;
        }

        setSavingPassword(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            setSavingPassword(false);
            setSenhaErro('Link invalido ou expirado. Solicite um novo e-mail de recuperacao.');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: novaSenha });
        if (error) {
            setSavingPassword(false);
            setSenhaErro(error.message || 'Nao foi possivel redefinir a senha.');
            return;
        }

        const emailToStore = session.user?.email || recoveryEmail || email;
        if (emailToStore) {
            localStorage.setItem('pendingAuthEmail', emailToStore);
        }

        localStorage.removeItem('usuario');
        await supabase.auth.signOut();
        window.history.replaceState({}, document.title, '/esqueci-senha');
        setSavingPassword(false);
        setStep(4);
    };

    return (
        <div className="auth-page">
            <header className="auth-topbar">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div className="auth-topbar-logo">Eco<span className="text-eco">Link</span></div>
                </Link>
                <button onClick={toggleTheme} aria-label="Mudar tema" type="button" className="auth-theme-toggle">
                    <ThemeIcon theme={theme} />
                </button>
            </header>

            <div className="auth-container">
                {step < 4 && (
                    <div className="fp-steps">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className={`fp-step ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                                    {step > s ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : s}
                                </div>
                                {s < 3 && <div className={`fp-step-line ${step > s ? 'active' : ''}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {step === 1 && (
                    <>
                        <div className="auth-header">
                            <div className="forgot-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <h2>Recuperar senha</h2>
                            <p>Digite seu e-mail e enviaremos um link seguro para redefinir sua senha.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleEmailSubmit}>
                            <div className="form-group">
                                <label className="form-label">E-mail corporativo</label>
                                <input
                                    type="email"
                                    className={`form-input ${emailErro ? 'input-error' : ''}`}
                                    placeholder="seu@empresa.com.br"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailErro('');
                                        setInfoMsg('');
                                    }}
                                    required
                                />
                                {emailErro && <span className="fp-error">{emailErro}</span>}
                                {recoveryError && <span className="fp-error">{recoveryError}</span>}
                            </div>
                            <button type="submit" className="btn-submit" disabled={sendingEmail}>
                                {sendingEmail ? 'Enviando link...' : 'Enviar link de recuperacao'}
                            </button>
                            <Link to="/login" className="auth-back-link">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Voltar para login
                            </Link>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="auth-header">
                            <div className="forgot-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                    <path d="m22 7-10 6L2 7" />
                                </svg>
                            </div>
                            <h2>Verifique seu e-mail</h2>
                            <p>
                                {infoMsg || 'Se o e-mail existir na plataforma, voce recebera o link de recuperacao em instantes.'}
                            </p>
                        </div>
                        <div className="auth-form">
                            <button type="button" className="btn-submit" onClick={() => setStep(1)}>
                                Reenviar link
                            </button>
                            <Link to="/login" className="auth-back-link">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Voltar para login
                            </Link>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className="auth-header">
                            <div className="forgot-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h2>Defina sua nova senha</h2>
                            <p>
                                {recoveryEmail
                                    ? `Recuperacao para ${recoveryEmail}.`
                                    : 'Use entre 8 e 24 caracteres, com letra maiuscula, minuscula e numero.'}
                            </p>
                        </div>
                        <form className="auth-form" onSubmit={handleSenhaSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nova senha</label>
                                <PasswordInput
                                    value={novaSenha}
                                    onChange={(e) => {
                                        setNovaSenha(e.target.value);
                                        setSenhaErro('');
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirmar nova senha</label>
                                <PasswordInput
                                    value={confirmarSenha}
                                    onChange={(e) => {
                                        setConfirmarSenha(e.target.value);
                                        setSenhaErro('');
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                            {(senhaErro || recoveryError) && <span className="fp-error">{senhaErro || recoveryError}</span>}
                            <button type="submit" className="btn-submit" disabled={savingPassword}>
                                {savingPassword ? 'Salvando...' : 'Redefinir senha'}
                            </button>
                        </form>
                    </>
                )}

                {step === 4 && (
                    <div className="forgot-success">
                        <div className="success-circle">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2>Senha redefinida</h2>
                        <p>Sua senha foi alterada com sucesso. Agora entre novamente na plataforma.</p>
                        <button className="btn-submit fp-success-btn" onClick={() => navigate('/login')}>
                            Ir para o login
                        </button>
                        <Link to="/" className="auth-back-link" style={{ marginTop: '0.5rem' }}>
                            Voltar para home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

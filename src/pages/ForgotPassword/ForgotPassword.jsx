import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { PASSWORD_MAX_LENGTH, validatePasswordStrength } from '../../utils/passwordPolicy';

function ThemeIcon({ theme }) {
    if (theme === 'light') {
        return (
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" width="24" height="24">
                <path d="M20.354 15.354A9 9 0 1 1 8.646 3.646a7 7 0 0 0 11.708 11.708Z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    return (
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" width="24" height="24">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [emailErro, setEmailErro] = useState('');
    const [codigo, setCodigo] = useState('');
    const [codigoErro, setCodigoErro] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [senhaErro, setSenhaErro] = useState('');

    const [theme, setTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    });

    useEffect(() => {
        const emailSalvo = localStorage.getItem('pendingAuthEmail') || '';
        if (emailSalvo) setEmail(emailSalvo);
    }, []);

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

    // Etapa 1 — Verifica se e-mail existe no localStorage
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setEmailErro('');

        const emailKey = email.trim().toLowerCase();
        const usuarioExiste = localStorage.getItem(`ecolink-user-${emailKey}`);

        if (!usuarioExiste) {
            setEmailErro('E-mail não encontrado. Verifique o endereço ou cadastre-se.');
            return;
        }

        localStorage.setItem('pendingAuthEmail', email.trim());
        setStep(2);
    };

    // Etapa 2 — Qualquer código de 6 dígitos funciona (fake)
    const handleCodigoSubmit = (e) => {
        e.preventDefault();
        setCodigoErro('');

        if (codigo.length !== 6) {
            setCodigoErro('Digite exatamente 6 dígitos.');
            return;
        }

        setStep(3);
    };

    // Etapa 3 — Salva nova senha no localStorage
    const handleSenhaSubmit = (e) => {
        e.preventDefault();
        setSenhaErro('');

        const senhaErro = validatePasswordStrength(novaSenha);
        if (senhaErro) {
            setSenhaErro(senhaErro);
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setSenhaErro('As senhas não coincidem.');
            return;
        }

        const emailKey = email.trim().toLowerCase();
        const senhaAtual = localStorage.getItem(`ecolink-password-${emailKey}`);

        if (senhaAtual && novaSenha === senhaAtual) {
            setSenhaErro('A nova senha não pode ser igual à senha anterior.');
            return;
        }

        // Atualiza senha em ambos os locais para manter o login funcionando
        localStorage.setItem(`ecolink-password-${emailKey}`, novaSenha);

        const usuarioSalvo = localStorage.getItem(`ecolink-user-${emailKey}`);
        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            usuario.senha = novaSenha;
            localStorage.setItem(`ecolink-user-${emailKey}`, JSON.stringify(usuario));
        }

        setStep(4);
    };

    return (
        <div className="auth-page">

            <header className="auth-topbar">
                <Link to="/home" style={{ textDecoration: 'none' }}>
                    <div className="auth-topbar-logo">Eco<span className="text-eco">Link</span></div>
                </Link>
                <button onClick={toggleTheme} aria-label="Mudar tema" type="button" className="auth-theme-toggle">
                    <ThemeIcon theme={theme} />
                </button>
            </header>

            <div className="auth-container">

                {/* Indicador de etapas */}
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

                {/* Etapa 1 — E-mail */}
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
                            <p>Digite seu e-mail e enviaremos um código de verificação.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleEmailSubmit}>
                            <div className="form-group">
                                <label className="form-label">E-mail Corporativo</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="seu@empresa.com.br"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailErro(''); }}
                                    required
                                />
                                {emailErro && <span className="fp-error">{emailErro}</span>}
                            </div>
                            <button type="submit" className="btn-submit">Enviar código</button>
                            <Link to="/login" className="auth-back-link">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Voltar para Login
                            </Link>
                        </form>
                    </>
                )}

                {/* Etapa 2 — Código fake (qualquer 6 dígitos) */}
                {step === 2 && (
                    <>
                        <div className="auth-header">
                            <div className="forgot-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <h2>Verifique seu e-mail</h2>
                            <p>Enviamos um código para <strong>{email}</strong>. Digite qualquer 6 dígitos para continuar.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleCodigoSubmit}>
                            <div className="form-group">
                                <label className="form-label">Código de verificação</label>
                                <input
                                    type="text"
                                    className={`form-input fp-code-input ${codigoErro ? 'input-error' : ''}`}
                                    placeholder="000000"
                                    maxLength={6}
                                    value={codigo}
                                    onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setCodigoErro(''); }}
                                    required
                                />
                                {codigoErro && <span className="fp-error">{codigoErro}</span>}
                            </div>
                            <button type="submit" className="btn-submit">Verificar código</button>
                            <button type="button" className="auth-back-link fp-resend" onClick={() => setStep(1)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Voltar
                            </button>
                        </form>
                    </>
                )}

                {/* Etapa 3 — Nova senha */}
                {step === 3 && (
                    <>
                        <div className="auth-header">
                            <div className="forgot-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h2>Nova senha</h2>
                            <p>Use entre 8 e 24 caracteres, com letra maiúscula, minúscula e número.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleSenhaSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nova senha</label>
                                <PasswordInput
                                    value={novaSenha}
                                    onChange={(e) => { setNovaSenha(e.target.value); setSenhaErro(''); }}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirmar nova senha</label>
                                <PasswordInput
                                    value={confirmarSenha}
                                    onChange={(e) => { setConfirmarSenha(e.target.value); setSenhaErro(''); }}
                                    placeholder="••••••••"
                                />
                            </div>
                            {senhaErro && <span className="fp-error">{senhaErro}</span>}
                            <button type="submit" className="btn-submit">Redefinir senha</button>
                        </form>
                    </>
                )}

                {/* Etapa 4 — Sucesso */}
                {step === 4 && (
                    <div className="forgot-success">
                        <div className="success-circle">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2>Senha redefinida!</h2>
                        <p>Sua senha foi alterada com sucesso.<br />Agora você pode entrar na plataforma.</p>
                        <button className="btn-submit fp-success-btn" onClick={() => navigate('/login')}>
                            Ir para o Login
                        </button>
                        <Link to="/home" className="auth-back-link" style={{ marginTop: '0.5rem' }}>
                            Voltar para Home
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Register.css';
import { PASSWORD_MAX_LENGTH, validatePasswordStrength } from '../../utils/passwordPolicy';

const onlyDigits = (value) => value.replace(/\D/g, '');
const isRepeatedDigits = (value) => /^(\d)\1+$/.test(value);

function isValidCPF(value) {
    const cpf = onlyDigits(value);
    if (cpf.length !== 11 || isRepeatedDigits(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i += 1) {
        sum += Number(cpf[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== Number(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i += 1) {
        sum += Number(cpf[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    return digit === Number(cpf[10]);
}

function isValidCNPJ(value) {
    const cnpj = onlyDigits(value);
    if (cnpj.length !== 14 || isRepeatedDigits(cnpj)) return false;

    const calcDigit = (base, weights) => {
        let sum = 0;
        for (let i = 0; i < weights.length; i += 1) {
            sum += Number(base[i]) * weights[i];
        }
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    const firstDigit = calcDigit(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    if (firstDigit !== Number(cnpj[12])) return false;

    const secondDigit = calcDigit(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return secondDigit === Number(cnpj[13]);
}

async function cnpjExists(value) {
    const cnpj = onlyDigits(value);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
            signal: controller.signal,
        });
        if (!response.ok) return false;
        const data = await response.json();
        return !!data?.cnpj;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

function ThemeIcon({ theme }) {
    if (theme === 'light') {
        return (
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20.354 15.354A9 9 0 1 1 8.646 3.646a7 7 0 0 0 11.708 11.708Z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    return (
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

const EyeOpen = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const EyeClosed = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

// Ícone de erro para o modal
const ErrorIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

// Ícone de sucesso para o modal
const SuccessIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

export default function Register() {
    const [perfil, setPerfil] = useState('user');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [campoErro, setCampoErro] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

    const [formData, setFormData] = useState({
        nome: '', email: '', senha: '', confirmarSenha: '', documento: '', telefone: ''
    });

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('ecolink-last-auth-page', 'register');

        const params = new URLSearchParams(location.search);
        const emailFromQuery = params.get('email') || '';
        const emailFromStorage = localStorage.getItem('pendingAuthEmail') || '';
        const emailToUse = (emailFromQuery || emailFromStorage).trim();

        if (emailToUse) {
            setFormData((prev) => ({ ...prev, email: emailToUse }));
            localStorage.setItem('pendingAuthEmail', emailToUse);
        }
    }, [location.search]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const applyMask = (value, name) => {
        const cleanValue = onlyDigits(value);

        if (name === 'documento') {
            if (perfil === 'user') {
                return cleanValue
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                    .substring(0, 14);
            }
            return cleanValue
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .substring(0, 18);
        }

        if (name === 'telefone') {
            return cleanValue
                .replace(/^(\d{2})(\d)/g, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .substring(0, 15);
        }

        return value;
    };

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        setErro('');
        setCampoErro('');

        if (name === 'documento' || name === 'telefone') {
            value = applyMask(value, name);
        }

        if (name === 'email') {
            localStorage.setItem('pendingAuthEmail', value.trim());
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSelectPerfil = (tipo) => {
        setPerfil(tipo);
        setFormData(prev => ({ ...prev, documento: '' }));
    };

    const mostrarErro = (mensagem, campo = '') => {
        setErro(mensagem);
        setCampoErro(campo);
        setShowErrorModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCampoErro('');
        setShowErrorModal(false);

        // Validações de campos obrigatórios
        if (!formData.nome.trim()) {
            mostrarErro('O campo Nome é obrigatório. Preencha antes de continuar.', 'nome');
            return;
        }
        if (!formData.email.trim()) {
            mostrarErro('O campo E-mail é obrigatório. Preencha antes de continuar.', 'email');
            return;
        }
        if (!formData.telefone.trim()) {
            mostrarErro('O campo Telefone é obrigatório. Preencha antes de continuar.', 'telefone');
            return;
        }
        const telefoneLimpoCheck = onlyDigits(formData.telefone);
        if (telefoneLimpoCheck.length !== 11) {
            mostrarErro('O Telefone deve ter exatamente 11 dígitos: 2 do DDD + 9 do número. Ex: (41) 99999-9999', 'telefone');
            return;
        }
        if (!formData.documento.trim()) {
            const docLabel = perfil === 'business' ? 'CNPJ' : 'CPF';
            mostrarErro(`O campo ${docLabel} é obrigatório. Preencha antes de continuar.`, 'documento');
            return;
        }
        if (!formData.senha) {
            mostrarErro('O campo Senha é obrigatório. Preencha antes de continuar.', 'senha');
            return;
        }
        if (!formData.confirmarSenha) {
            mostrarErro('O campo Confirmar Senha é obrigatório. Preencha antes de continuar.', 'confirmarSenha');
            return;
        }

        // Validações de limites
        if (formData.nome.trim().length < 2) {
            mostrarErro('O Nome deve ter pelo menos 2 caracteres.', 'nome');
            return;
        }
        if (formData.nome.trim().length > 100) {
            mostrarErro('O Nome deve ter no máximo 100 caracteres.', 'nome');
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            mostrarErro('O E-mail informado não tem um formato válido. Ex: usuario@email.com', 'email');
            return;
        }
        if (formData.email.trim().length > 254) {
            mostrarErro('O E-mail deve ter no máximo 254 caracteres.', 'email');
            return;
        }

        const documentoLimpo = onlyDigits(formData.documento);

        if (perfil === 'user' && documentoLimpo.length !== 11) {
            mostrarErro('O CPF deve conter exatamente 11 dígitos.', 'documento');
            return;
        }
        if (perfil === 'business' && documentoLimpo.length !== 14) {
            mostrarErro('O CNPJ deve conter exatamente 14 dígitos.', 'documento');
            return;
        }
        if (perfil === 'user' && !isValidCPF(formData.documento)) {
            mostrarErro('O CPF informado é inválido. Confirme os números e tente novamente.', 'documento');
            return;
        }
        if (perfil === 'business' && !isValidCNPJ(formData.documento)) {
            mostrarErro('O CNPJ informado é inválido. Confirme os números e tente novamente.', 'documento');
            return;
        }

        // Validações de senha
        const senhaErro = validatePasswordStrength(formData.senha);
        if (senhaErro) {
            mostrarErro(senhaErro, 'senha');
            return;
        }
        if (formData.senha !== formData.confirmarSenha) {
            mostrarErro('A Senha e a Confirmação não coincidem. Verifique e tente novamente.', 'confirmarSenha');
            return;
        }

        // Verificar se email já existe
        const emailKey = formData.email.trim().toLowerCase();
        const existingUser = localStorage.getItem(`ecolink-user-${emailKey}`);
        if (existingUser) {
            mostrarErro('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.', 'email');
            return;
        }

        setLoading(true);

        if (perfil === 'business') {
            const exists = await cnpjExists(formData.documento);
            if (exists === false) {
                setLoading(false);
                mostrarErro('CNPJ não encontrado na base pública da Receita Federal. Verifique o número informado.', 'documento');
                return;
            }
            if (exists === null) {
                setLoading(false);
                mostrarErro('Não foi possível validar o CNPJ online agora. Verifique sua conexão e tente novamente.', 'documento');
                return;
            }
        }

        try {
            const usuarioParaSalvar = {
                id: Date.now(),
                email: formData.email.trim(),
                nome: formData.nome,
                perfil: perfil === 'business' ? 'Business' : 'User',
                documento: documentoLimpo,
                telefone: formData.telefone,
                senha: formData.senha,
                is_active: true
            };

            localStorage.setItem(`ecolink-user-${emailKey}`, JSON.stringify(usuarioParaSalvar));
            localStorage.setItem(`ecolink-password-${emailKey}`, formData.senha);
            localStorage.setItem('pendingAuthEmail', formData.email.trim());
            localStorage.setItem('usuario', JSON.stringify(usuarioParaSalvar));

            setLoading(false);
            setShowSuccessModal(true);
        } catch (err) {
            mostrarErro('Erro inesperado. Tente novamente.');
            setLoading(false);
        }
    };

    // Verifica se um campo está com erro para aplicar borda vermelha
    const inputClass = (campo) => `form-input${campoErro === campo ? ' input-error' : ''}`;

    return (
        <div className="auth-page">
            <button className="auth-theme-toggle" onClick={toggleTheme} type="button" aria-label="Mudar tema">
                <ThemeIcon theme={theme} />
            </button>

            <button
                className="auth-back-btn"
                onClick={() => navigate('/home')}
                title="Voltar"
                aria-label="Voltar"
                type="button"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Voltar</span>
            </button>

            <div className="auth-container">
                <div className="auth-brand">Eco<span className="text-eco">Link</span></div>

                <div className="auth-header">
                    <h2>Crie sua conta</h2>
                    <p>Selecione seu perfil e preencha os dados.</p>
                </div>

                <div className="perfil-toggle">
                    <button
                        type="button"
                        className={`perfil-toggle-btn ${perfil === 'user' ? 'active' : ''}`}
                        onClick={() => handleSelectPerfil('user')}
                    >
                        User
                    </button>
                    <button
                        type="button"
                        className={`perfil-toggle-btn ${perfil === 'business' ? 'active' : ''}`}
                        onClick={() => handleSelectPerfil('business')}
                    >
                        Business
                    </button>
                </div>

                <p className="perfil-desc">
                    {perfil === 'user'
                        ? 'Usuário individual que deseja vender ou destinar equipamentos com segurança.'
                        : 'Conta Business para operações corporativas com foco em compliance ESG.'}
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Nome */}
                    <div className="form-group">
                        <label className="form-label">
                            <span>{perfil === 'business' ? 'Razão Social' : 'Nome Completo'}</span>
                            <span className={`char-count ${formData.nome.length >= 100 ? 'char-count--limit' : ''}`}>
                                {formData.nome.length}/100
                            </span>
                        </label>
                        <input
                            type="text"
                            name="nome"
                            className={inputClass('nome')}
                            placeholder={perfil === 'business' ? 'Nome da empresa' : 'Seu nome completo'}
                            value={formData.nome}
                            onChange={handleInputChange}
                            maxLength={100}
                        />
                    </div>

                    {/* CPF/CNPJ + Telefone */}
                    <div className="auth-row-inputs">
                        <div className="form-group">
                            <label className="form-label">
                                <span>{perfil === 'business' ? 'CNPJ' : 'CPF'}</span>
                            </label>
                            <input
                                type="text"
                                name="documento"
                                className={inputClass('documento')}
                                value={formData.documento}
                                placeholder={perfil === 'business' ? '00.000.000/0000-00' : '000.000.000-00'}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <span>Telefone</span>
                                <span className={`char-count ${onlyDigits(formData.telefone).length === 0 ? '' : onlyDigits(formData.telefone).length < 11 ? 'char-count--warn' : 'char-count--ok'}`}>
                                    {onlyDigits(formData.telefone).length}/11
                                </span>
                            </label>
                            <input
                                type="text"
                                name="telefone"
                                className={inputClass('telefone')}
                                value={formData.telefone}
                                placeholder="(00) 00000-0000"
                                onChange={handleInputChange}
                                maxLength={15}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">
                            <span>{perfil === 'business' ? 'E-mail Corporativo' : 'E-mail'}</span>
                            <span className={`char-count ${formData.email.length >= 254 ? 'char-count--limit' : ''}`}>
                                {formData.email.length}/254
                            </span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            className={inputClass('email')}
                            placeholder={perfil === 'business' ? 'contato@empresa.com.br' : 'seu@email.com'}
                            value={formData.email}
                            onChange={handleInputChange}
                            maxLength={254}
                        />
                    </div>

                    {/* Senhas */}
                    <div className="auth-row-inputs">
                        <div className="form-group">
                            <label className="form-label">
                                <span>Senha</span>
                                <span className={`char-count ${formData.senha.length > 0 && !validatePasswordStrength(formData.senha) ? 'char-count--ok' : formData.senha.length > 0 ? 'char-count--warn' : ''}`}>
                                    {formData.senha.length}/{PASSWORD_MAX_LENGTH}
                                </span>
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={mostrarSenha ? 'text' : 'password'}
                                    name="senha"
                                    className={`${inputClass('senha')} password-input`}
                                    placeholder="Min. 8, max. 24, com A-z e 0-9"
                                    value={formData.senha}
                                    onChange={handleInputChange}
                                    maxLength={PASSWORD_MAX_LENGTH}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    tabIndex="-1"
                                    aria-label="Mostrar senha"
                                >
                                    {mostrarSenha ? <EyeOpen /> : <EyeClosed />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span>Confirmar</span>
                                {formData.confirmarSenha.length > 0 && (
                                    <span className={`char-count ${formData.confirmarSenha === formData.senha ? 'char-count--ok' : 'char-count--warn'}`}>
                                        {formData.confirmarSenha === formData.senha ? '✓ coincidem' : '✗ diferente'}
                                    </span>
                                )}
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={mostrarConfirmar ? 'text' : 'password'}
                                    name="confirmarSenha"
                                    className={`${inputClass('confirmarSenha')} password-input`}
                                    placeholder="Repita a senha"
                                    value={formData.confirmarSenha}
                                    onChange={handleInputChange}
                                    maxLength={PASSWORD_MAX_LENGTH}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                    tabIndex="-1"
                                    aria-label="Mostrar confirmação de senha"
                                >
                                    {mostrarConfirmar ? <EyeOpen /> : <EyeClosed />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Cadastrar agora'}
                    </button>

                    <p className="auth-footer-link">
                        Já tem conta?{' '}
                        <Link to={formData.email ? `/login?email=${encodeURIComponent(formData.email.trim())}` : '/login'}>
                            Entrar
                        </Link>
                    </p>
                </form>
            </div>

            {/* Modal de Erro */}
            {showErrorModal && (
                <div className="auth-modal-overlay" onClick={() => setShowErrorModal(false)}>
                    <div className="auth-modal auth-modal--error" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon modal-icon--error">
                            <ErrorIcon />
                        </div>
                        <h3>Atenção</h3>
                        <p className="modal-desc">{erro}</p>
                        <div className="modal-actions-stack">
                            <button
                                className="btn-confirm"
                                onClick={() => setShowErrorModal(false)}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sucesso */}
            {showSuccessModal && (
                <div className="auth-modal-overlay">
                    <div className="auth-modal auth-modal--success">
                        <div className="modal-icon modal-icon--success">
                            <SuccessIcon />
                        </div>
                        <h3>Cadastro realizado!</h3>
                        <p className="modal-desc modal-desc--success">
                            Sua conta foi criada com sucesso. Clique abaixo para acessar o sistema.
                        </p>
                        <div className="modal-actions-stack">
                            <button
                                className="btn-confirm"
                                onClick={() => navigate('/login')}
                            >
                                Ir para o login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
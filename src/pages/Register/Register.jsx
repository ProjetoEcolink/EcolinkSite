import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Register.css';

const onlyDigits = (value) => value.replace(/\D/g, '');
const isRepeatedDigits = (value) => /^(\d)\1+$/.test(value);

function isValidCPF(value) {
    const cpf = onlyDigits(value);
    if (cpf.length !== 11 || isRepeatedDigits(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i += 1) {
        sum += Number(cpf[i]) * (10 - i);
    }
    let digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    if (digit !== Number(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i += 1) {
        sum += Number(cpf[i]) * (11 - i);
    }
    digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
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

export default function Register() {
    const [perfil, setPerfil] = useState('reciclador');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

    const [formData, setFormData] = useState({
        nome: '', email: '', senha: '', confirmarSenha: '', documento: '', telefone: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const applyMask = (value, name) => {
        const cleanValue = onlyDigits(value);

        if (name === 'documento') {
            if (perfil === 'reciclador') {
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

        if (name === 'documento' || name === 'telefone') {
            value = applyMask(value, name);
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSelectPerfil = (tipo) => {
        setPerfil(tipo);
        setFormData(prev => ({ ...prev, documento: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (perfil === 'reciclador' && !isValidCPF(formData.documento)) {
            setErro('CPF invalido. Confira os numeros informados.');
            return;
        }

        if (perfil === 'gerador' && !isValidCNPJ(formData.documento)) {
            setErro('CNPJ invalido. Confira os numeros informados.');
            return;
        }

        if (formData.senha !== formData.confirmarSenha) {
            setErro('As senhas nao coincidem.');
            return;
        }

        if (formData.senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        const emailRedirectTo = import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/login`;

        if (perfil === 'gerador') {
            const exists = await cnpjExists(formData.documento);
            if (exists === false) {
                setLoading(false);
                setErro('CNPJ nao encontrado na base publica da Receita.');
                return;
            }
            if (exists === null) {
                setLoading(false);
                setErro('Nao foi possivel validar o CNPJ online agora. Tente novamente.');
                return;
            }
        }

        const documentoLimpo = onlyDigits(formData.documento);

        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.senha,
            options: {
                emailRedirectTo,
                data: {
                    nome: formData.nome,
                    perfil: perfil === 'gerador' ? 'Empresa' : 'Usuario',
                    documento: documentoLimpo,
                    telefone: formData.telefone
                }
            }
        });

        setLoading(false);

        if (error) {
            if (error.message?.toLowerCase().includes('error sending confirmation email')) {
                setErro('Falha no envio do email de confirmacao. Para testes internos, desative "Confirm email" em Authentication > Sign In / Providers > Email no Supabase.');
            } else {
                setErro(error.message);
            }
            return;
        }

        if (data?.session && data?.user) {
            const meta = data.user.user_metadata || {};
            const usuarioParaSalvar = {
                email: data.user.email,
                nome: meta.nome || formData.nome || 'Usuario',
                perfil: meta.perfil || (perfil === 'gerador' ? 'Empresa' : 'Usuario'),
                documento: meta.documento || documentoLimpo || '',
                telefone: meta.telefone || formData.telefone || ''
            };

            localStorage.setItem('usuario', JSON.stringify(usuarioParaSalvar));
            alert('Cadastro realizado com sucesso!');
            navigate('/home');
            return;
        }

        alert('Cadastro realizado! Verifique seu email para confirmar a conta.');
        navigate('/login');
    };

    return (
        <div className="auth-page">
            <button className="auth-theme-toggle" onClick={toggleTheme} type="button" aria-label="Mudar tema">
                <ThemeIcon theme={theme} />
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
                        className={`perfil-toggle-btn ${perfil === 'reciclador' ? 'active' : ''}`}
                        onClick={() => handleSelectPerfil('reciclador')}
                    >
                        Reciclador
                    </button>
                    <button
                        type="button"
                        className={`perfil-toggle-btn ${perfil === 'gerador' ? 'active' : ''}`}
                        onClick={() => handleSelectPerfil('gerador')}
                    >
                        Gerador
                    </button>
                </div>

                <p className="perfil-desc">
                    {perfil === 'reciclador'
                        ? 'Coletor ou parceiro que compra e processa residuos eletronicos.'
                        : 'Empresa que descarta equipamentos com seguranca e compliance ESG.'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            {perfil === 'gerador' ? 'Razao Social' : 'Nome Completo'}
                        </label>
                        <input
                            type="text"
                            name="nome"
                            className="form-input"
                            placeholder={perfil === 'gerador' ? 'Nome da empresa' : 'Seu nome completo'}
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="auth-row-inputs">
                        <div className="form-group">
                            <label className="form-label">
                                {perfil === 'gerador' ? 'CNPJ' : 'CPF'}
                            </label>
                            <input
                                type="text"
                                name="documento"
                                className="form-input"
                                value={formData.documento}
                                placeholder={perfil === 'gerador' ? '00.000.000/0000-00' : '000.000.000-00'}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefone</label>
                            <input
                                type="text"
                                name="telefone"
                                className="form-input"
                                value={formData.telefone}
                                placeholder="(00) 00000-0000"
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {perfil === 'gerador' ? 'E-mail Corporativo' : 'E-mail'}
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder={perfil === 'gerador' ? 'contato@empresa.com.br' : 'seu@email.com'}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="auth-row-inputs">
                        <div className="form-group">
                            <label className="form-label">Senha</label>
                            <input
                                type="password"
                                name="senha"
                                className="form-input"
                                placeholder="********"
                                value={formData.senha}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirmar</label>
                            <input
                                type="password"
                                name="confirmarSenha"
                                className="form-input"
                                placeholder="********"
                                value={formData.confirmarSenha}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {erro && (
                        <div style={{
                            background: 'rgba(255, 80, 80, 0.1)',
                            border: '1px solid rgba(255, 80, 80, 0.4)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            color: '#ff6b6b',
                            fontSize: '0.85rem',
                            marginBottom: '10px'
                        }}>
                            {erro}
                        </div>
                    )}

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Cadastrar agora'}
                    </button>

                    <p className="auth-footer-link">
                        Ja tem conta? <Link to="/login">Entrar</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 
import './Register.css';

export default function Register() {
    const [perfil, setPerfil] = useState('reciclador'); 
    const [showModal, setShowModal] = useState(false);
    const [codigoInserido, setCodigoInserido] = useState('');
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');
    
    const [formData, setFormData] = useState({ 
        nome: '', email: '', senha: '', confirmarSenha: '', documento: '', telefone: '' 
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const applyMask = (value, name) => {
        const cleanValue = value.replace(/\D/g, '');
        if (name === 'documento') {
            if (perfil === 'reciclador') {
                return cleanValue.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
            } else {
                return cleanValue.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18);
            }
        }
        if (name === 'telefone') {
            return cleanValue.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
        }
        return value;
    };

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'documento' || name === 'telefone') value = applyMask(value, name);
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.senha !== formData.confirmarSenha) return alert('Senhas não coincidem!');
        
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.senha,
            options: {
                data: { 
                    nome: formData.nome,
                    perfil: perfil === 'gerador' ? 'Empresa' : 'Usuario',
                    documento: formData.documento,
                    telefone: formData.telefone
                }
            }
        });
        setLoading(false);
        if (error) alert(error.message);
        else setShowModal(true);
    };

    const handleVerificarCodigo = async () => {
        setLoading(true);
        const { error } = await supabase.auth.verifyOtp({
            email: formData.email,
            token: codigoInserido,
            type: 'signup'
        });

        if (error) {
            alert('Código inválido ou expirado.');
            setLoading(false);
        } else {
            alert('Cadastro confirmado!');
            navigate('/login');
        }
    };

    return (
        <div className="auth-page">
            <button className="auth-theme-toggle" onClick={toggleTheme} type="button">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="auth-container">
                <div className="auth-brand">Eco<span className="text-eco">Link</span></div>
                
                <div className="auth-header">
                    <h2>Crie sua conta</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="perfil-selection">
                        <div className={`perfil-card ${perfil === 'gerador' ? 'selected' : ''}`} 
                             onClick={() => {setPerfil('gerador'); setFormData({...formData, documento: ''})}}>
                            <h4> Gerador</h4>
                            <p>Empresa / Doador</p>
                        </div>
                        <div className={`perfil-card ${perfil === 'reciclador' ? 'selected' : ''}`} 
                             onClick={() => {setPerfil('reciclador'); setFormData({...formData, documento: ''})}}>
                            <h4>Reciclador</h4>
                            <p>Coletor / Parceiro</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nome Completo / Razão Social</label>
                        <input type="text" name="nome" className="form-input" placeholder="Seu nome ou empresa" onChange={handleInputChange} required />
                    </div>

                    <div className="auth-row-inputs">
                        <div className="form-group">
                            <label className="form-label">{perfil === 'reciclador' ? 'CPF' : 'CNPJ'}</label>
                            <input type="text" name="documento" className="form-input" value={formData.documento} placeholder={perfil === 'reciclador' ? "000.000.000-00" : "00.000.000/0000-00"} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefone</label>
                            <input type="text" name="telefone" className="form-input" value={formData.telefone} placeholder="(00) 00000-0000" onChange={handleInputChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-mail Corporativo</label>
                        <input type="email" name="email" className="form-input" placeholder="seu@email.com" onChange={handleInputChange} required />
                    </div>

                    <div className="auth-row-inputs">
                        <div className="form-group">
                            <label className="form-label">Senha</label>
                            <input type="password" name="senha" className="form-input" placeholder="••••••••" onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirmar</label>
                            <input type="password" name="confirmarSenha" className="form-input" placeholder="••••••••" onChange={handleInputChange} required />
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Processando...' : 'Cadastrar agora'}
                    </button>

                    <p className="auth-footer-link">
                        Já tem conta? <Link to="/login">Entrar</Link>
                    </p>
                </form>
            </div>

            {showModal && (
                <div className="auth-modal-overlay">
                    <div className="auth-modal">
                        <h3>Verifique seu E-mail</h3>
                        <p className="modal-desc">Código enviado para: <strong>{formData.email}</strong></p>
                        
                        <input 
                            type="text" 
                            className="otp-input" 
                            maxLength="8" 
                            value={codigoInserido} 
                            onChange={(e) => setCodigoInserido(e.target.value)} 
                            placeholder="00000000"
                            autoFocus 
                        />
                        
                        <div className="modal-actions-stack">
                            <button className="btn-confirm" onClick={handleVerificarCodigo}>Verificar Código</button>
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
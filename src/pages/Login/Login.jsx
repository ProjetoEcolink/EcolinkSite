import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', senha: '' });
    const [loading, setLoading] = useState(false);
    
    // Inicializa o tema lendo o que o index.html definiu
    const [theme, setTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    });

    // Monitora mudanças no tema para atualizar o ícone (sol/lua)
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Função de Troca de Tema com Persistência
    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next); // Salva para não mudar ao recarregar
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
            // Após logar com sucesso, vai para a Landing Page
            navigate('/home'); 
        }
    };

    return (
        <div className="auth-page">
            {/* Botão flutuante de tema */}
            <button className="auth-theme-toggle" onClick={toggleTheme} aria-label="Mudar tema">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="auth-container">
                <div className="auth-brand">
                    Eco<span className="text-eco">Link</span>
                </div>

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
                        <Link to="/esqueci-senha" style={{ color: 'var(--green-eco)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Autenticando...' : 'Entrar na Plataforma'}
                    </button>

                    {/* BOTÃO PARA ENTRAR SEM LOGIN */}
                    <button 
                        type="button" 
                        className="btn-guest-access"
                        onClick={() => navigate('/home')}
                    >
                        Entrar sem login (Visitante)
                    </button>

                    <p className="auth-footer-link" style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-description)', fontSize: '0.9rem' }}>
                        Ainda não tem uma conta? <Link to="/register" style={{ color: 'var(--green-eco)', fontWeight: 'bold', textDecoration: 'none' }}>Cadastre-se aqui.</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
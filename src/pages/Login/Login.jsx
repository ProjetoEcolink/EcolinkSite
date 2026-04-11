import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Traduzimos os dados (o Python espera 'password', não 'senha')
            const dadosParaEnviar = {
                email: formData.email,
                password: formData.senha
            };

            // 2. Fazemos o pedido para a API de Login
            const resposta = await fetch('http://localhost:8000/api/v1/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosParaEnviar)
            });

            // 3. Verificamos a resposta do servidor
            if (resposta.ok) {
                const dadosRetornados = await resposta.json();

                // SALVA O USUÁRIO: Guarda as informações no navegador para usarmos no painel depois
                localStorage.setItem('usuarioEcoLink', JSON.stringify(dadosRetornados.user));

                alert('Login realizado com sucesso! Bem-vindo de volta ao EcoLink.');
                navigate('/marketplace');
            } else {
                // Se o status não for "ok" (ex: Erro 401 que vimos antes)
                const erro = await resposta.json();
                alert(erro.detail || 'E-mail ou senha incorretos.');
            }

        } catch (error) {
            console.error("Erro de conexão:", error);
            alert('Erro de conexão com o servidor. Tente novamente mais tarde.');
        }
    };

    return (
        <div className="cadastro-page">
            <div className="cadastro-container">

                <div className="cadastro-header">
                    <h2>Entre na sua conta <span className="text-highlight">EcoLink</span></h2>
                    <p>Acesse o marketplace e gerencie seus resíduos eletrônicos.</p>
                </div>

                <form className="cadastro-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label className="form-label">E-mail Corporativo</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="seu@email.com.br"
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

                    <div className="form-group" style={{ textAlign: 'right', marginTop: '-8px' }}>
                        <Link to="/esqueci-senha" className="login-link">Esqueceu sua senha?</Link>
                    </div>

                    <button type="submit" className="btn-submit">
                        Entrar
                    </button>

                    <p className="login-link">
                        Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se aqui.</Link>
                    </p>

                </form>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cadastro.css';

export default function Cadastro() {
    // Estados do formulário
    const [perfil, setPerfil] = useState(''); // 'gerador' ou 'reciclador'
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: ''
    });

    const navigate = useNavigate();

    // Atualiza os dados digitados
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Comunicação Real com a API
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!perfil) {
            alert('Por favor, selecione qual é o seu perfil (Gerador ou Reciclador).');
            return;
        }

        try {
            // 1. Traduzimos os dados do React para o que o Python espera
            const dadosParaEnviar = {
                name: formData.nome,
                email: formData.email,
                password: formData.senha
            };

            // 2. Fazemos o "fetch" (a ligação) com o seu servidor Back-end
            const resposta = await fetch('http://localhost:8000/api/v1/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosParaEnviar)
            });

            // 3. Verificamos se a resposta do garçom foi Sucesso (Status 200/201)
            if (resposta.ok) {
                alert('Conta criada com sucesso! Bem-vindo ao EcoLink.');
                navigate('/marketplace');
            } else {
                // Se der erro (ex: email já cadastrado)
                const erro = await resposta.json();
                console.error("Erro na API:", erro);
                alert('Ocorreu um erro ao criar a conta. Tente um e-mail diferente.');
            }

        } catch (error) {
            // Se o Back-end estiver desligado
            console.error("Erro de conexão:", error);
            alert('Erro de conexão. Verifique se o servidor Back-end está rodando.');
        }
    };

    return (
        <div className="cadastro-page">
            <div className="cadastro-container">

                <div className="cadastro-header">
                    <h2>Crie sua conta no <span className="text-highlight">EcoLink</span></h2>
                    <p>Comece a transformar passivo ambiental em ativo financeiro hoje mesmo.</p>
                </div>

                <form className="cadastro-form" onSubmit={handleSubmit}>

                    {/* PASSO 1: ESCOLHA DE PERFIL */}
                    <div className="form-group">
                        <label className="form-label">Qual é o seu objetivo principal?</label>
                        <div className="perfil-selection">

                            {/* Cartão Gerador */}
                            <div
                                className={`perfil-card ${perfil === 'gerador' ? 'selected' : ''}`}
                                onClick={() => setPerfil('gerador')}
                            >
                                <div className="perfil-icon">🏢</div>
                                <h4>Sou Gerador</h4>
                                <p>Quero vender lotes de equipamentos de TI obsoletos.</p>
                            </div>

                            {/* Cartão Reciclador */}
                            <div
                                className={`perfil-card ${perfil === 'reciclador' ? 'selected' : ''}`}
                                onClick={() => setPerfil('reciclador')}
                            >
                                <div className="perfil-icon">♻️</div>
                                <h4>Sou Reciclador</h4>
                                <p>Quero comprar materiais e possuo licença ambiental.</p>
                            </div>

                        </div>
                    </div>

                    {/* PASSO 2: DADOS CADASTRAIS */}
                    <div className="form-group">
                        <label className="form-label">Nome da Empresa (ou Responsável)</label>
                        <input
                            type="text"
                            name="nome"
                            className="form-input"
                            placeholder="Ex: Tech Solutions Ltda"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

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

                    <button type="submit" className="btn-submit">
                        Finalizar Cadastro
                    </button>

                    <p className="login-link">
                        Já possui uma conta? <Link to="/login">Faça Login aqui.</Link>
                    </p>

                </form>
            </div>
        </div>
    );
}
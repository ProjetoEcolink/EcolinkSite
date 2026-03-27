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

    // Simula o envio para a nossa API
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!perfil) {
            alert('Por favor, selecione qual é o seu perfil (Gerador ou Reciclador).');
            return;
        }

        console.log('Enviando para a API:', { perfil, ...formData });
        
        // Simula sucesso e redireciona para o painel de anúncios
        alert('Conta criada com sucesso! Bem-vindo ao EcoLink.');
        navigate('/marketplace');
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
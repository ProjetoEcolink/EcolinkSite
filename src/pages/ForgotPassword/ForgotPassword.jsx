import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; 

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState(null);
    const navigate = useNavigate();

    // Simulação de redirecionamento após sucesso
    useEffect(() => {
        let timer;
        if (mensagem?.tipo === 'sucesso') {
            timer = setTimeout(() => navigate('/login'), 3000);
        }
        return () => clearTimeout(timer);
    }, [mensagem, navigate]);

    const handleSimularFluxo = (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem(null);

        // Simula um atraso de rede de 1.5 segundos
        setTimeout(() => {
            setLoading(false);
            
            // LÓGICA DE TESTE: 
            // Se o e-mail for "erro@teste.com", mostra erro. 
            // Qualquer outro, mostra sucesso.
            if (email === 'erro@teste.com') {
                setMensagem({ 
                    tipo: 'erro', 
                    texto: 'Este e-mail não foi encontrado em nossa base corporativa.' 
                });
            } else {
                setMensagem({ 
                    tipo: 'sucesso', 
                    texto: 'Link enviado! Verifique sua caixa de entrada.' 
                });
            }
        }, 1500);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Recuperar Acesso</h2>
                    <p>Digite seu e-mail para receber as instruções de recuperação.</p>
                </div>

                {/* Área de Alertas */}
                {mensagem && (
                    <div className={`auth-alert alert-${mensagem.tipo}`}>
                        <span className="alert-icon">
                            {mensagem.tipo === 'sucesso' ? '✅' : '❌'}
                        </span>
                        <div className="alert-content">
                            <span className="alert-text">{mensagem.texto}</span>
                            {mensagem.tipo === 'sucesso' && (
                                <small className="alert-subtext">Você será redirecionado em 3s...</small>
                            )}
                        </div>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSimularFluxo}>
                    <div className="form-group">
                        <label className="form-label">E-mail Corporativo</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="seu@empresa.com.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading || mensagem?.tipo === 'sucesso'}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={`btn-submit ${loading ? 'btn-loading' : ''}`}
                        disabled={loading || mensagem?.tipo === 'sucesso'}
                    >
                        {loading ? 'Enviando...' : 'Recuperar Senha'}
                    </button>

                    <Link to="/login" className="auth-back-link">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Voltar para o Login
                    </Link>
                </form>
            </div>
        </div>
    );
}
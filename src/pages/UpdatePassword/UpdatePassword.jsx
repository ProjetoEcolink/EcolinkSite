import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './UpdatePassword.css';

export default function UpdatePassword() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState(null);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMensagem({ 
                tipo: 'sucesso', 
                texto: 'Senha atualizada! Agora você já pode acessar sua conta.' 
            });

            // Após atualizar, volta para o login para ele entrar com a nova senha
            setTimeout(() => navigate('/login'), 2000);

        } catch (error) {
            setMensagem({ 
                tipo: 'erro', 
                texto: error.message || 'Erro ao definir nova senha.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Nova Senha</h2>
                    <p>Crie uma senha forte para proteger sua conta EcoLink.</p>
                </div>

                {mensagem && (
                    <div className={`auth-alert alert-${mensagem.tipo}`}>
                        <span className="alert-icon">
                            {mensagem.tipo === 'sucesso' ? '✅' : '❌'}
                        </span>
                        <div className="alert-content">
                            <span className="alert-text">{mensagem.texto}</span>
                        </div>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label className="form-label">Digite sua nova senha</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading || mensagem?.tipo === 'sucesso'}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={`btn-submit ${loading ? 'btn-loading' : ''}`}
                        disabled={loading || mensagem?.tipo === 'sucesso'}
                    >
                        {loading ? 'Salvando...' : 'Confirmar Nova Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
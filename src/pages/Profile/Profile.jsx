import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 
import './Profile.css';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        documento: '', 
        perfil: '' 
    });

    const navigate = useNavigate();

    useEffect(() => {
        const loadUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                const currentUser = session.user;
                setUser(currentUser);
                
                const meta = currentUser.user_metadata;
                
                setFormData({
                    nome: meta?.nome || '',
                    email: currentUser.email || '',
                    telefone: meta?.telefone || '',
                    documento: meta?.documento || '',
                    perfil: meta?.perfil || '' 
                });
            } else {
                // REMOVIDO: navigate('/login')
                // Agora, se não houver sessão, apenas não mostramos o perfil,
                // mas não forçamos a saída do usuário do site.
                setUser(false); 
            }
        };
        loadUserSession();
    }, []);

    const handleSave = async () => {
        try {
            const { error } = await supabase.auth.updateUser({
                data: { 
                    nome: formData.nome,
                    telefone: formData.telefone,
                    documento: formData.documento 
                }
            });

            if (error) throw error;
            setIsEditing(false);
            alert("Suas informações foram atualizadas com sucesso!");
        } catch (error) {
            alert("Erro ao salvar dados: " + error.message);
        }
    };

    // Logout: SÓ AQUI ele redireciona para o login
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('usuario');
            navigate('/home'); 
            window.location.reload(); 
        } catch (error) {
            console.error("Erro ao sair:", error.message);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const { error } = await supabase.rpc('delete_self_user');
            if (error) throw error;
            
            await supabase.auth.signOut();
            localStorage.removeItem('usuario');
            navigate('/login');
            window.location.reload();
        } catch (error) {
            alert("Erro crítico ao excluir conta: " + error.message);
        }
    };

    // Se o usuário tentar acessar o perfil sem estar logado
    if (user === false) {
        return (
            <div className="profile-page">
                <div className="profile-container" style={{textAlign: 'center', padding: '50px'}}>
                    <h2 className="text-white">Acesso Restrito</h2>
                    <p className="text-dim">Você precisa estar logado para ver seu perfil.</p>
                    <button className="btn-submit" onClick={() => navigate('/login')} style={{maxWidth: '200px', marginTop: '20px'}}>
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const getPerfilBadge = () => {
        if (formData.perfil === 'Empresa') return '🏢 Empresa / Gerador';
        if (formData.perfil === 'Usuario') return '♻️ Reciclador / Parceiro';
        return '👤 Usuário';
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                
                <div className="profile-card profile-header">
                    <div className="profile-info-left">
                        <div className="profile-avatar-box">
                            {formData.nome ? formData.nome.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="profile-titles">
                            <h1 className="text-white">{formData.nome || 'Usuário'}</h1>
                            <p className="text-dim">
                                <span className="profile-badge-text">{getPerfilBadge()}</span>
                                {` | ${formData.email}`}
                            </p>
                        </div>
                    </div>
                    <button className="btn-logout-link" onClick={() => setShowLogoutModal(true)}>
                        Sair da Conta
                    </button>
                </div>

                <div className="profile-card">
                    <div className="card-top-row">
                        <h2 className="text-white">Informações Pessoais</h2>
                        <button 
                            className="btn-edit-action" 
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancelar' : 'Editar Dados'}
                        </button>
                    </div>

                    <div className="profile-form-grid">
                        <div className="form-item">
                            <label>Nome Completo / Razão Social</label>
                            <input 
                                type="text" 
                                disabled={!isEditing} 
                                value={formData.nome}
                                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                className={isEditing ? "input-field editing" : "input-field"} 
                            />
                        </div>

                        <div className="form-item">
                            <label>E-mail (Inalterável)</label>
                            <input 
                                type="email" 
                                disabled={true} 
                                value={formData.email} 
                                className="input-field readonly" 
                            />
                        </div>

                        <div className="form-item">
                            <label>Telefone para Contato</label>
                            <input 
                                type="text" 
                                disabled={!isEditing} 
                                value={formData.telefone}
                                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                                className={isEditing ? "input-field editing" : "input-field"} 
                            />
                        </div>

                        <div className="form-item">
                            <label>{formData.perfil === 'Empresa' ? 'CNPJ' : 'CPF'}</label>
                            <input 
                                type="text" 
                                disabled={!isEditing} 
                                value={formData.documento}
                                onChange={(e) => setFormData({...formData, documento: e.target.value})}
                                className={isEditing ? "input-field editing" : "input-field"} 
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <button className="btn-save-full" onClick={handleSave}>
                            Confirmar Alterações
                        </button>
                    )}

                    {!isEditing && (
                        <div className="danger-zone-wrapper">
                            <button 
                                className="btn-delete-account" 
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Excluir minha conta
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="text-white">Deseja sair agora?</h3>
                        <p className="text-dim">Você será levado de volta à página de login.</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                                Voltar
                            </button>
                            <button 
                                className="btn-confirm-del" 
                                style={{background: 'var(--green-eco)'}} 
                                onClick={handleLogout}
                            >
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="text-white" style={{color: 'var(--red-danger)'}}>Confirma a exclusão?</h3>
                        <p className="text-dim">Essa ação não pode ser desfeita. Todos os seus dados serão apagados.</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn-confirm-del" onClick={handleDeleteAccount}>
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
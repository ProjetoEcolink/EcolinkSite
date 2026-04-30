import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { supabase } from '../../supabaseClient';
import { getOrCreateEmpresaForUser } from '../../utils/empresa';
import { buildLocalUserFromSupabase, clearAuthenticatedUser, persistAuthenticatedUser } from '../../utils/authUser';
import { PASSWORD_MAX_LENGTH, validatePasswordStrength } from '../../utils/passwordPolicy';

function ThemeIcon({ theme }) {
    if (theme === 'light') {
        return (
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" width="24" height="24">
                <path d="M20.354 15.354A9 9 0 1 1 8.646 3.646a7 7 0 0 0 11.708 11.708Z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    return (
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" width="24" height="24">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function EyeIcon({ open }) {
    if (open) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );
    }
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function normalizeStorageNames(lote) {
    const urls = [];
    if (Array.isArray(lote?.fotos_urls)) {
        urls.push(...lote.fotos_urls);
    } else if (typeof lote?.fotos_urls === 'string') {
        try {
            const parsed = JSON.parse(lote.fotos_urls);
            if (Array.isArray(parsed)) urls.push(...parsed);
        } catch {
            urls.push(lote.fotos_urls);
        }
    }

    if (lote?.foto_url) urls.push(lote.foto_url);

    return urls
        .map((url) => String(url || '').split('/').pop())
        .filter(Boolean);
}

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false); // ← novo
    const [showDeleteConfirmationEmail, setShowDeleteConfirmationEmail] = useState(false); // ← novo: modal de email de confirmação
    const [deletionEmailSent, setDeletionEmailSent] = useState(false); // ← novo: email foi enviado
    const [deletionLoading, setDeletionLoading] = useState(false); // ← novo: está enviando email
    const [showChangePassword, setShowChangePassword] = useState(false); // ← novo
    const [showNovaSenhaField, setShowNovaSenhaField] = useState(false); // ← novo: mostra/oculta nova senha
    const [showConfirmarSenhaField, setShowConfirmarSenhaField] = useState(false); // ← novo: mostra/oculta confirmação
    const [showPasswordSuccess, setShowPasswordSuccess] = useState(false); // ← novo: modal de sucesso
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showProfileSuccess, setShowProfileSuccess] = useState(false); // ← novo: modal de sucesso para atualização de perfil
    const [passwordData, setPasswordData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    }); // ← novo
    const [passwordError, setPasswordError] = useState(''); // ← novo
    const [showChangeEmail, setShowChangeEmail] = useState(false); // ← novo: modal de mudança de email
    const [emailStep, setEmailStep] = useState(1); // ← novo: controla etapas 1-3 do email
    const [showEmailSuccess, setShowEmailSuccess] = useState(false); // ← novo: modal de sucesso email
    const [emailData, setEmailData] = useState({
        senhaAtual: '',
        codigo: '',
        novoEmail: '',
        confirmarEmail: ''
    }); // ← novo
    const [emailError, setEmailError] = useState(''); // ← novo
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    }); // ← novo: gerenciamento de tema
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        documento: '', 
        perfil: '' 
    });

    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const userStr = localStorage.getItem('usuario');
            const localUser = userStr ? JSON.parse(userStr) : null;
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user
                ? persistAuthenticatedUser(buildLocalUserFromSupabase(session.user, localUser || {}))
                : localUser;

            if (currentUser) {
                setUser(currentUser);
                setFormData({
                    nome: currentUser.nome || '',
                    email: currentUser.email || '',
                    telefone: currentUser.telefone || '',
                    documento: currentUser.documento || '',
                    perfil: currentUser.perfil || ''
                });
            } else {
                setUser(false);
            }
        };

        loadUser();
    }, []);

    // useEffect para sincronizar tema
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setTheme(next);
    };

    const handleSave = async () => {
        const updatedUser = {
            ...user,
            nome: formData.nome,
            telefone: formData.telefone
        };

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.auth.updateUser({
                data: {
                    nome: updatedUser.nome,
                    perfil: updatedUser.perfil,
                    documento: updatedUser.documento,
                    telefone: updatedUser.telefone,
                },
            });
            await supabase
                .from('perfis')
                .update({
                    nome: updatedUser.nome,
                    telefone: updatedUser.telefone,
                })
                .eq('id', session.user.id);
        }

        persistAuthenticatedUser(updatedUser);
        setUser(updatedUser);
        setIsEditing(false);
        setShowSaveModal(false);
        setShowProfileSuccess(true);
        setTimeout(() => {
            setShowProfileSuccess(false);
        }, 2000);
    };

    const handleLogout = async () => {
        clearAuthenticatedUser();
        await supabase.auth.signOut();
        navigate('/');
        window.location.reload();
    };

    // Etapa 1 — Inicia envio de email de confirmação para deletar conta
    const handleDeleteAccountInitiate = () => {
        setShowDeleteModal(false);
        setShowDeleteConfirmationEmail(true);
        setDeletionLoading(true);
        setDeletionEmailSent(false);

        // Simula envio de email (delay de 1.5s)
        setTimeout(() => {
            setDeletionLoading(false);
            setDeletionEmailSent(true);
        }, 1500);
    };

    // Etapa 2 — Confirma exclusão (após clicar no link do email fake)
    const handleDeleteAccountConfirm = async () => {
        if (!user?.email) return;

        setDeletionLoading(true);
        const emailKey = user.email.toLowerCase();

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { error: rpcError } = await supabase.rpc('delete_my_account');
                if (rpcError) {
                    const empresaId = await getOrCreateEmpresaForUser(user);
                    const { data: lotesUsuario } = await supabase
                        .from('lotes')
                        .select('id, fotos_urls, foto_url')
                        .eq('empresa_id', empresaId);

                    const nomes = (lotesUsuario || [])
                        .flatMap((lote) => normalizeStorageNames(lote))
                        .filter(Boolean);

                    if (nomes.length) {
                        await supabase.storage.from('lotes-fotos').remove(nomes);
                    }

                    const { error: deleteLotesError } = await supabase
                        .from('lotes')
                        .delete()
                        .eq('empresa_id', empresaId);
                    if (deleteLotesError) throw deleteLotesError;

                    await supabase.from('empresas').delete().eq('id', empresaId);
                    await supabase.from('perfis').delete().eq('id', session.user.id);
                }
            }

            localStorage.removeItem(`ecolink-user-${emailKey}`);
            localStorage.removeItem(`ecolink-password-${emailKey}`);
            clearAuthenticatedUser();
            await supabase.auth.signOut();
            setShowDeleteConfirmationEmail(false);
            navigate('/');
            window.location.reload();
        } catch (error) {
            alert(`Erro ao excluir conta: ${error.message}`);
        } finally {
            setDeletionLoading(false);
        }
    };

    // Cancela exclusão
    const handleDeleteAccountCancel = () => {
        setShowDeleteConfirmationEmail(false);
        setDeletionEmailSent(false);
        setDeletionLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (!passwordData.senhaAtual || !passwordData.novaSenha || !passwordData.confirmarSenha) {
            setPasswordError('Preencha todos os campos para alterar a senha.');
            return;
        }

        const senhaErro = validatePasswordStrength(passwordData.novaSenha);
        if (senhaErro) {
            setPasswordError(senhaErro);
            return;
        }

        if (passwordData.novaSenha !== passwordData.confirmarSenha) {
            setPasswordError('As senhas nao coincidem.');
            return;
        }

        if (passwordData.novaSenha === passwordData.senhaAtual) {
            setPasswordError('A nova senha nao pode ser igual a senha atual.');
            return;
        }

        if (user?.authProvider === 'local-legacy') {
            setPasswordError('Esta conta foi criada no fluxo local antigo. Entre com uma conta Supabase para alterar a senha com seguranca.');
            return;
        }

        setIsPasswordLoading(true);
        try {
            const email = String(user?.email || '').trim().toLowerCase();
            if (!email) {
                setPasswordError('Nao foi possivel identificar o e-mail da conta para validar a senha.');
                return;
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: passwordData.senhaAtual,
            });

            if (signInError) {
                setPasswordError('Senha atual incorreta.');
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.novaSenha,
            });

            if (updateError) {
                setPasswordError(updateError.message || 'Nao foi possivel alterar a senha agora.');
                return;
            }

            const emailKey = String(email || '').toLowerCase();
            const usuarioAtualizado = { ...user };
            delete usuarioAtualizado.senha;

            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
            setUser(usuarioAtualizado);

            if (emailKey) {
                localStorage.removeItem(`ecolink-password-${emailKey}`);
                const usuarioLocalStorage = localStorage.getItem(`ecolink-user-${emailKey}`);
                if (usuarioLocalStorage) {
                    try {
                        const parsedUser = JSON.parse(usuarioLocalStorage);
                        delete parsedUser.senha;
                        localStorage.setItem(`ecolink-user-${emailKey}`, JSON.stringify(parsedUser));
                    } catch {
                        // Se nao conseguir ler o JSON legado, seguimos com a senha real no Supabase.
                    }
                }
            }

            handleClosePasswordModal();
            setShowPasswordSuccess(true);
            setTimeout(() => {
                setShowPasswordSuccess(false);
            }, 2000);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleClosePasswordModal = () => {
        setShowChangePassword(false);
        setShowNovaSenhaField(false);
        setShowConfirmarSenhaField(false);
        setIsPasswordLoading(false);
        setPasswordData({
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: ''
        });
        setPasswordError('');
    };

    // Etapa 1 — Validar senha atual para email
    const handleEmailStep1 = (e) => {
        e.preventDefault();
        setEmailError('');

        const emailKey = user.email.toLowerCase();
        const senhaSalva = user.senha || localStorage.getItem(`ecolink-password-${emailKey}`);

        if (!emailData.senhaAtual || emailData.senhaAtual !== senhaSalva) {
            setEmailError('Senha atual incorreta.');
            return;
        }

        setEmailStep(2);
    };

    // Etapa 2 — Validar código fake (6 dígitos) para email
    const handleEmailStep2 = (e) => {
        e.preventDefault();
        setEmailError('');

        if (emailData.codigo.length !== 6) {
            setEmailError('Digite exatamente 6 dígitos.');
            return;
        }

        setEmailStep(3);
    };

    // Etapa 3 — Salvar novo email
    const handleEmailStep3 = (e) => {
        e.preventDefault();
        setEmailError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailData.novoEmail)) {
            setEmailError('Digite um email válido.');
            return;
        }

        if (emailData.novoEmail !== emailData.confirmarEmail) {
            setEmailError('Os emails não coincidem.');
            return;
        }

        if (emailData.novoEmail.toLowerCase() === user.email.toLowerCase()) {
            setEmailError('O novo email não pode ser igual ao email atual.');
            return;
        }

        // Verifica se o email já está em uso
        const existingUser = localStorage.getItem(`ecolink-user-${emailData.novoEmail.toLowerCase()}`);
        if (existingUser) {
            setEmailError('Este email já está em uso.');
            return;
        }

        // Remove dados antigos
        const oldEmailKey = user.email.toLowerCase();
        localStorage.removeItem(`ecolink-user-${oldEmailKey}`);
        localStorage.removeItem(`ecolink-password-${oldEmailKey}`);

        // Atualiza email
        const usuarioAtualizado = {
            ...user,
            email: emailData.novoEmail
        };

        // Salva com nova chave
        const newEmailKey = emailData.novoEmail.toLowerCase();
        localStorage.setItem(`ecolink-user-${newEmailKey}`, JSON.stringify(usuarioAtualizado));
        localStorage.setItem(`ecolink-password-${newEmailKey}`, user.senha);
        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

        setUser(usuarioAtualizado);
        setFormData(prev => ({ ...prev, email: emailData.novoEmail }));

        setShowEmailSuccess(true);
        setTimeout(() => {
            setShowEmailSuccess(false);
            handleCloseEmailModal();
        }, 2000);
    };

    const handleCloseEmailModal = () => {
        setShowChangeEmail(false);
        setEmailStep(1);
        setEmailData({
            senhaAtual: '',
            codigo: '',
            novoEmail: '',
            confirmarEmail: ''
        });
        setEmailError('');
    };

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
        if (formData.perfil === 'Business' || formData.perfil === 'Empresa') return '🏢 Business';
        if (formData.perfil === 'User' || formData.perfil === 'Usuario') return '👤 User';
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
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <button onClick={toggleTheme} aria-label="Mudar tema" type="button" className="auth-theme-toggle" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                            <ThemeIcon theme={theme} />
                        </button>
                        <button className="btn-logout-link" onClick={() => setShowLogoutModal(true)}>
                            Sair da Conta
                        </button>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="card-top-row">
                        <h2 className="text-white">Informações Pessoais</h2>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button 
                                className="btn-edit-action" 
                                onClick={() => setShowChangeEmail(true)}
                                style={{background: 'var(--green-eco)'}}
                            >
                                Alterar Email
                            </button>
                            <button 
                                className="btn-edit-action" 
                                onClick={() => setShowChangePassword(true)}
                                style={{background: 'var(--green-eco)'}}
                            >
                                Alterar Senha
                            </button>
                            <button 
                                className="btn-edit-action" 
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancelar' : 'Editar Dados'}
                            </button>
                        </div>
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
                            <label>E-mail</label>
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

                        {/* CPF/CNPJ — sempre somente leitura */}
                        <div className="form-item">
                            <label>{formData.perfil === 'Business' || formData.perfil === 'Empresa' ? 'CNPJ (Inalterável)' : 'CPF (Inalterável)'}</label>
                            <input 
                                type="text" 
                                disabled={true}
                                value={formData.documento}
                                className="input-field readonly"
                            />
                        </div>
                    </div>

                    {/* Botão que abre modal de confirmação */}
                    {isEditing && (
                        <button className="btn-save-full" onClick={() => setShowSaveModal(true)}>
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

            {/* Modal: Deseja Salvar? */}
            {showSaveModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="text-white">Deseja salvar as alterações?</h3>
                        <p className="text-dim">As informações do seu perfil serão atualizadas.</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowSaveModal(false)}>
                                Cancelar
                            </button>
                            <button 
                                className="btn-confirm-del" 
                                style={{background: 'var(--green-eco)'}} 
                                onClick={handleSave}
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Logout */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="text-white">Deseja sair agora?</h3>
                        <p className="text-dim">Você será levado de volta à página inicial.</p>
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

            {/* Modal: Excluir Conta */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="text-white" style={{color: 'var(--red-danger)'}}>Você deseja realmente apagar essa conta?</h3>
                        <p className="text-dim">Essa ação não pode ser desfeita. Todos os seus dados serão apagados.</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn-confirm-del" onClick={handleDeleteAccountInitiate}>
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Sucesso ao alterar senha */}
            {showPasswordSuccess && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign: 'center'}}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'var(--green-eco)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'scaleIn 0.5s ease'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3 className="text-white">Senha alterada!</h3>
                        <p className="text-dim">Sua senha foi alterada com sucesso.</p>
                    </div>
                </div>
            )}

            {/* Modal: Sucesso ao alterar email */}
            {showEmailSuccess && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign: 'center'}}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'var(--green-eco)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'scaleIn 0.5s ease'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3 className="text-white">Email alterado!</h3>
                        <p className="text-dim">Seu email foi alterado com sucesso. Uma confirmação será enviada para o novo endereço.</p>
                    </div>
                </div>
            )}

            {/* Modal: Sucesso ao atualizar perfil */}
            {showProfileSuccess && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign: 'center'}}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'var(--green-eco)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'scaleIn 0.5s ease'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3 className="text-white">Perfil atualizado!</h3>
                        <p className="text-dim">Suas informações foram atualizadas com sucesso.</p>
                    </div>
                </div>
            )}

            {/* Modal: Confirmação de exclusão por email */}
            {showDeleteConfirmationEmail && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {!deletionEmailSent ? (
                            <>
                                <div style={{textAlign: 'center'}}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        background: '#f0f9ff',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 15px'
                                    }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green-eco)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white" style={{marginBottom: '10px'}}>Enviando confirmação</h3>
                                    <p className="text-dim">
                                        {deletionLoading ? 'Estamos enviando um email de confirmação para ' : 'Email de confirmação para '}
                                        <strong>{user.email}</strong>
                                    </p>
                                    <div style={{margin: '20px 0'}}>
                                        <div style={{
                                            display: 'inline-block',
                                            width: '20px',
                                            height: '20px',
                                            border: '3px solid var(--green-eco)',
                                            borderRadius: '50%',
                                            borderTop: '3px solid transparent',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    </div>
                                </div>
                                <div className="modal-buttons">
                                    <button className="btn-cancel" onClick={handleDeleteAccountCancel}>
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{textAlign: 'center'}}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'var(--green-eco)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 15px',
                                        animation: 'scaleIn 0.5s ease'
                                    }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white">Email enviado!</h3>
                                    <p className="text-dim">Verifique sua caixa de entrada em <strong>{user.email}</strong></p>
                                    <p className="text-dim" style={{marginTop: '15px', fontSize: '0.9rem', color: '#94a3b8'}}>Clique no link de confirmação no email para deletar sua conta permanentemente.</p>
                                </div>
                                <div className="modal-buttons">
                                    <button className="btn-cancel" onClick={handleDeleteAccountCancel}>
                                        Fechar
                                    </button>
                                    <button className="btn-confirm-del" style={{background: 'var(--green-eco)'}} onClick={handleDeleteAccountConfirm}>
                                        Confirmar Deleção
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Alterar Senha */}
            {showChangePassword && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '500px'}}>
                        <h3 className="text-white" style={{marginBottom: '10px'}}>Alterar senha</h3>
                        <p className="text-dim" style={{marginBottom: '20px'}}>
                            Confirme sua senha atual e defina uma nova senha segura.
                        </p>

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-item" style={{marginBottom: '15px'}}>
                                <label className="form-label">Senha atual</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    maxLength={PASSWORD_MAX_LENGTH}
                                    value={passwordData.senhaAtual}
                                    onChange={(e) => {
                                        setPasswordData({ ...passwordData, senhaAtual: e.target.value });
                                        setPasswordError('');
                                    }}
                                    required
                                />
                            </div>

                            <div className="form-item" style={{marginBottom: '15px'}}>
                                <label className="form-label">Nova senha</label>
                                <div className="fp-password-wrapper" style={{position: 'relative'}}>
                                    <input
                                        type={showNovaSenhaField ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="••••••••"
                                        maxLength={PASSWORD_MAX_LENGTH}
                                        value={passwordData.novaSenha}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, novaSenha: e.target.value });
                                            setPasswordError('');
                                        }}
                                        required
                                    />
                                    <button type="button" className="fp-eye-btn" onClick={() => setShowNovaSenhaField(!showNovaSenhaField)} aria-label="Mostrar senha">
                                        <EyeIcon open={showNovaSenhaField} />
                                    </button>
                                </div>
                            </div>

                            <div className="form-item" style={{marginBottom: '15px'}}>
                                <label className="form-label">Confirmar nova senha</label>
                                <div className="fp-password-wrapper" style={{position: 'relative'}}>
                                    <input
                                        type={showConfirmarSenhaField ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="••••••••"
                                        maxLength={PASSWORD_MAX_LENGTH}
                                        value={passwordData.confirmarSenha}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, confirmarSenha: e.target.value });
                                            setPasswordError('');
                                        }}
                                        required
                                    />
                                    <button type="button" className="fp-eye-btn" onClick={() => setShowConfirmarSenhaField(!showConfirmarSenhaField)} aria-label="Mostrar senha">
                                        <EyeIcon open={showConfirmarSenhaField} />
                                    </button>
                                </div>
                            </div>

                            {passwordError && <span className="fp-error">{passwordError}</span>}
                            <div className="modal-buttons" style={{marginTop: '20px'}}>
                                <button type="button" className="btn-cancel" onClick={handleClosePasswordModal} disabled={isPasswordLoading}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-confirm-del" style={{background: 'var(--green-eco)'}} disabled={isPasswordLoading}>
                                    {isPasswordLoading ? 'Alterando...' : 'Alterar Senha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Alterar Email — 3 etapas */}
            {showChangeEmail && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '500px'}}>
                        
                        {/* Indicador de etapas */}
                        {emailStep < 4 && (
                            <div className="fp-steps" style={{marginBottom: '30px', justifyContent: 'center'}}>
                                {[1, 2, 3].map((s) => (
                                    <React.Fragment key={s}>
                                        <div className={`fp-step ${emailStep >= s ? 'active' : ''} ${emailStep > s ? 'done' : ''}`}>
                                            {emailStep > s ? (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : s}
                                        </div>
                                        {s < 3 && <div className={`fp-step-line ${emailStep > s ? 'active' : ''}`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}

                        {/* Etapa 1 — Confirmar senha atual */}
                        {emailStep === 1 && (
                            <>
                                <h3 className="text-white" style={{marginBottom: '10px'}}>Confirme sua senha</h3>
                                <p className="text-dim" style={{marginBottom: '20px'}}>Digite sua senha atual para continuar.</p>
                                <form onSubmit={handleEmailStep1}>
                                    <div className="form-item" style={{marginBottom: '15px'}}>
                                        <label className="form-label">Senha Atual</label>
                                        <input 
                                            type="password" 
                                            className="form-input"
                                            placeholder="••••••••"
                                            maxLength={PASSWORD_MAX_LENGTH}
                                            value={emailData.senhaAtual}
                                            onChange={(e) => {setEmailData({...emailData, senhaAtual: e.target.value}); setEmailError('');}}
                                            required
                                        />
                                    </div>
                                    {emailError && <span className="fp-error">{emailError}</span>}
                                    <div className="modal-buttons" style={{marginTop: '20px'}}>
                                        <button type="button" className="btn-cancel" onClick={handleCloseEmailModal}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn-confirm-del" style={{background: 'var(--green-eco)'}}>
                                            Continuar
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Etapa 2 — Código de verificação */}
                        {emailStep === 2 && (
                            <>
                                <h3 className="text-white" style={{marginBottom: '10px'}}>Verificação de Segurança</h3>
                                <p className="text-dim" style={{marginBottom: '20px'}}>Enviamos um código de 6 dígitos para seu email atual.</p>
                                <form onSubmit={handleEmailStep2}>
                                    <div className="form-item" style={{marginBottom: '15px'}}>
                                        <label className="form-label">Código de Verificação</label>
                                        <input 
                                            type="text" 
                                            className="form-input"
                                            placeholder="123456"
                                            maxLength={6}
                                            value={emailData.codigo}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setEmailData({...emailData, codigo: value});
                                                setEmailError('');
                                            }}
                                            required
                                        />
                                    </div>
                                    {emailError && <span className="fp-error">{emailError}</span>}
                                    <div className="modal-buttons" style={{marginTop: '20px'}}>
                                        <button type="button" className="btn-cancel" onClick={() => {setEmailStep(1); setEmailError('');}}>
                                            Voltar
                                        </button>
                                        <button type="submit" className="btn-confirm-del" style={{background: 'var(--green-eco)'}}>
                                            Verificar
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Etapa 3 — Novo email */}
                        {emailStep === 3 && (
                            <>
                                <h3 className="text-white" style={{marginBottom: '10px'}}>Novo Email</h3>
                                <p className="text-dim" style={{marginBottom: '20px'}}>Digite seu novo endereço de email.</p>
                                <form onSubmit={handleEmailStep3}>
                                    <div className="form-item" style={{marginBottom: '15px'}}>
                                        <label className="form-label">Novo Email</label>
                                        <input 
                                            type="email" 
                                            className="form-input"
                                            placeholder="seu@email.com"
                                            value={emailData.novoEmail}
                                            onChange={(e) => {setEmailData({...emailData, novoEmail: e.target.value}); setEmailError('');}}
                                            required
                                        />
                                    </div>
                                    <div className="form-item" style={{marginBottom: '15px'}}>
                                        <label className="form-label">Confirmar Novo Email</label>
                                        <input 
                                            type="email" 
                                            className="form-input"
                                            placeholder="seu@email.com"
                                            value={emailData.confirmarEmail}
                                            onChange={(e) => {setEmailData({...emailData, confirmarEmail: e.target.value}); setEmailError('');}}
                                            required
                                        />
                                    </div>
                                    {emailError && <span className="fp-error">{emailError}</span>}
                                    <div className="modal-buttons" style={{marginTop: '20px'}}>
                                        <button type="button" className="btn-cancel" onClick={() => {setEmailStep(2); setEmailError('');}}>
                                            Voltar
                                        </button>
                                        <button type="submit" className="btn-confirm-del" style={{background: 'var(--green-eco)'}}>
                                            Alterar Email
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

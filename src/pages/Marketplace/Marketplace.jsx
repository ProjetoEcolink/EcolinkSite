import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './Marketplace.css';

export default function Marketplace() {
    const [lotes, setLotes] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
    const [contatosRevelados, setContatosRevelados] = useState({});
    const [loading, setLoading] = useState(true);
    const [deletando, setDeletando] = useState(null);
    const [loteAtivo, setLoteAtivo] = useState(null);
    const [modalConfirmarDelete, setModalConfirmarDelete] = useState(null); // { id, foto_url }

    const categorias = ['Todos', 'Monitores', 'Servidores / Placas', 'Notebooks', 'Misto'];

    useEffect(() => {
        buscarLotes();
    }, [categoriaAtiva]);

    // Fecha modal com ESC
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                if (modalConfirmarDelete) setModalConfirmarDelete(null);
                else setLoteAtivo(null);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [modalConfirmarDelete]);

    // Trava scroll do body quando modal aberto
    useEffect(() => {
        if (loteAtivo || modalConfirmarDelete) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [loteAtivo, modalConfirmarDelete]);

    const buscarLotes = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('lotes')
                .select(`
                    *,
                    empresas (
                        nome,
                        email,
                        telefone
                    )
                `)
                .eq('status', 'disponivel')
                .order('created_at', { ascending: false });

            if (categoriaAtiva !== 'Todos') {
                query = query.eq('categoria', categoriaAtiva);
            }

            const { data, error } = await query;
            if (error) throw error;
            setLotes(data || []);
        } catch (error) {
            console.error('Erro ao buscar lotes:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const revelarContato = (e, id) => {
        e.stopPropagation();
        setContatosRevelados(prev => ({ ...prev, [id]: true }));
    };

    const pedirConfirmacaoDelete = (e, id, foto_url) => {
        e.stopPropagation();
        setModalConfirmarDelete({ id, foto_url });
    };

    const confirmarDelete = async () => {
        if (!modalConfirmarDelete) return;
        const { id, foto_url } = modalConfirmarDelete;
        setModalConfirmarDelete(null);
        setDeletando(id);

        try {
            if (foto_url) {
                const nomeArquivo = foto_url.split('/').pop();
                await supabase.storage.from('lotes-fotos').remove([nomeArquivo]);
            }

            const { error } = await supabase.from('lotes').delete().eq('id', id);
            if (error) throw error;

            setLotes(prev => prev.filter(lote => lote.id !== id));
            setLoteAtivo(null);
        } catch (error) {
            console.error('Erro ao deletar lote:', error.message);
            alert('Erro ao remover lote: ' + error.message);
        } finally {
            setDeletando(null);
        }
    };

    const cancelarDelete = () => setModalConfirmarDelete(null);

    const abrirModal = (lote) => setLoteAtivo(lote);
    const fecharModal = () => setLoteAtivo(null);

    const loteModalAtualizado = loteAtivo
        ? lotes.find(l => l.id === loteAtivo.id) || loteAtivo
        : null;

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <h2>Vitrine de <span className="text-highlight">Lotes Disponíveis</span></h2>
                <p>Encontre os melhores ativos de TI e negocie direto com o gerador.</p>

                <div className="marketplace-filters">
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${categoriaAtiva === cat ? 'active' : ''}`}
                            onClick={() => setCategoriaAtiva(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="marketplace-status">
                    <p>Carregando lotes...</p>
                </div>
            ) : lotes.length === 0 ? (
                <div className="marketplace-status">
                    <p>Nenhum lote disponível nessa categoria no momento.</p>
                </div>
            ) : (
                <div className="marketplace-grid">
                    {lotes.map((lote) => (
                        <article
                            key={lote.id}
                            className="lote-card"
                            onClick={() => abrirModal(lote)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && abrirModal(lote)}
                            aria-label={`Ver detalhes do lote ${lote.titulo}`}
                        >
                            <div className="lote-image-placeholder">
                                {lote.foto_url ? (
                                    <img src={lote.foto_url} alt={lote.titulo} className="lote-foto" />
                                ) : (
                                    <span className="image-icon">📷</span>
                                )}
                                <span className="categoria-badge">{lote.categoria}</span>

                                <button
                                    className="btn-deletar"
                                    onClick={(e) => pedirConfirmacaoDelete(e, lote.id, lote.foto_url)}
                                    disabled={deletando === lote.id}
                                    title="Remover lote"
                                >
                                    {deletando === lote.id ? '...' : '🗑️'}
                                </button>
                            </div>

                            <div className="lote-info">
                                <h3 className="lote-titulo">{lote.titulo}</h3>
                                <p className="lote-empresa">🏢 {lote.empresas?.nome || 'Empresa Parceira'}</p>

                                <div className="lote-meta">
                                    <span>⚖️ {lote.peso_kg ? `${lote.peso_kg}kg` : 'Peso N/A'}</span>
                                    <span>📍 {lote.cidade}, {lote.estado}</span>
                                </div>

                                <p className="lote-descricao">{lote.descricao}</p>
                            </div>

                            <div className="lote-action">
                                <span className="card-ver-detalhes">Ver detalhes →</span>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* =========================================
                MODAL DE DETALHES DO LOTE
            ========================================= */}
            {loteModalAtualizado && (
                <div
                    className="modal-overlay"
                    onClick={fecharModal}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Detalhes do lote ${loteModalAtualizado.titulo}`}
                >
                    <div
                        className="modal-lote"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-fechar" onClick={fecharModal} aria-label="Fechar modal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="modal-imagem">
                            {loteModalAtualizado.foto_url ? (
                                <img src={loteModalAtualizado.foto_url} alt={loteModalAtualizado.titulo} />
                            ) : (
                                <div className="modal-sem-foto">📷</div>
                            )}
                            <span className="categoria-badge">{loteModalAtualizado.categoria}</span>
                        </div>

                        <div className="modal-conteudo">
                            <div className="modal-topo">
                                <div>
                                    <h2 className="modal-titulo">{loteModalAtualizado.titulo}</h2>
                                    <p className="modal-empresa">🏢 {loteModalAtualizado.empresas?.nome || 'Empresa Parceira'}</p>
                                </div>
                            </div>

                            <div className="modal-detalhes-grid">
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Peso</span>
                                    <span className="detalhe-valor">
                                        {loteModalAtualizado.peso_kg ? `${loteModalAtualizado.peso_kg} kg` : 'Não informado'}
                                    </span>
                                </div>
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Localização</span>
                                    <span className="detalhe-valor">
                                        {loteModalAtualizado.cidade}, {loteModalAtualizado.estado}
                                    </span>
                                </div>
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Categoria</span>
                                    <span className="detalhe-valor">{loteModalAtualizado.categoria}</span>
                                </div>
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Status</span>
                                    <span className="detalhe-valor detalhe-disponivel">Disponível</span>
                                </div>
                            </div>

                            {loteModalAtualizado.descricao && (
                                <div className="modal-descricao-bloco">
                                    <span className="detalhe-label">Descrição</span>
                                    <p className="modal-descricao-texto">{loteModalAtualizado.descricao}</p>
                                </div>
                            )}

                            <div className="modal-contato-bloco">
                                <div className="contato-revelado">
                                    <p className="contato-nome">👤 {loteModalAtualizado.empresas?.nome}</p>
                                    <p className="contato-dado">📞 {loteModalAtualizado.empresas?.telefone || 'Não informado'}</p>
                                    <p className="contato-dado">✉️ {loteModalAtualizado.empresas?.email || 'Não informado'}</p>

                                    {loteModalAtualizado.empresas?.telefone && (
                                        <a
                                            href={`https://wa.me/55${loteModalAtualizado.empresas.telefone.replace(/\D/g, '')}?text=Olá! Vi seu anúncio no EcoLink: ${loteModalAtualizado.titulo}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-whatsapp"
                                        >
                                            Chamar no WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="modal-rodape">
                                <button
                                    className="btn-deletar-modal"
                                    onClick={(e) => pedirConfirmacaoDelete(e, loteModalAtualizado.id, loteModalAtualizado.foto_url)}
                                    disabled={deletando === loteModalAtualizado.id}
                                >
                                    {deletando === loteModalAtualizado.id ? 'Removendo...' : '🗑️ Remover este lote'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL DE CONFIRMAÇÃO DE REMOÇÃO
            ========================================= */}
            {modalConfirmarDelete && (
                <div className="confirmar-delete-backdrop" onClick={cancelarDelete}>
                    <div className="confirmar-delete-container" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmar-delete-icon">🗑️</div>
                        <h3 className="confirmar-delete-titulo">Remover lote?</h3>
                        <p className="confirmar-delete-texto">
                            Esta ação é permanente. O lote será removido da vitrine e não poderá ser recuperado.
                        </p>
                        <div className="confirmar-delete-botoes">
                            <button className="confirmar-delete-btn-cancelar" onClick={cancelarDelete}>
                                Cancelar
                            </button>
                            <button className="confirmar-delete-btn-confirmar" onClick={confirmarDelete}>
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { getOrCreateEmpresaForUser } from '../../utils/empresa';
import {
    buildLegacyLotePayload,
    buildLotePayload,
    MAX_FOTOS_LOTE,
    normalizeMateriaisLote,
    normalizeFotoUrls,
    sanitizePesoInput,
    TIPOS_MATERIAIS_PADRAO,
} from '../../utils/loteUtils';
import '../Marketplace/Marketplace.css';
import './MyProducts.css';

function loteLocalLabel(lote) {
    if (lote.local_lote) return lote.local_lote;
    if (lote.cidade || lote.estado) return [lote.cidade, lote.estado].filter(Boolean).join(', ');
    return 'Local não informado';
}

export default function MyProducts() {
    const [empresaId, setEmpresaId] = useState(null);
    const [lotes, setLotes] = useState([]);
    const [lotesComprados, setLotesComprados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loteAtivo, setLoteAtivo] = useState(null);
    const [editingLote, setEditingLote] = useState(null);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [deletando, setDeletando] = useState(null);
    const [abaAtiva, setAbaAtiva] = useState('anunciados');

    // NOVO: Estado do Carrossel
    const [imagemAtualIndex, setImagemAtualIndex] = useState(0);

    const categorias = useMemo(() => TIPOS_MATERIAIS_PADRAO, []);

    // Contadores
    const totalAnunciados = lotes.filter(l => l.status !== 'entregue').length;
    const totalVendidos = lotes.filter(l => l.status === 'entregue').length;
    const totalComprados = lotesComprados.length;

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (!userStr) {
            setLoading(false);
            return;
        }

        const usuario = JSON.parse(userStr);
        const init = async () => {
            try {
                const id = await getOrCreateEmpresaForUser(usuario);
                setEmpresaId(id);
            } catch {
                setLoading(false);
            }
        };

        init();
    }, []);

    useEffect(() => {
        if (!empresaId) return;
        buscarLotesProprios();
        buscarLotesComprados();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empresaId, abaAtiva]);

    const buscarLotesProprios = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('lotes')
                .select('*')
                .eq('empresa_id', empresaId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLotes(data || []);
        } catch (error) {
            alert(`Erro ao carregar seus lotes: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const buscarLotesComprados = async () => {
        try {
            const userStr = localStorage.getItem('usuario');
            let email = '';
            if (userStr) {
                try {
                    email = JSON.parse(userStr).email;
                } catch {
                    email = '';
                }
            }
            const { data, error } = await supabase
                .from('lotes')
                .select('*')
                .eq('status', 'entregue')
                .eq('comprador_email', email)
                .order('comprado_em', { ascending: false });

            if (error) throw error;
            setLotesComprados(data || []);
        } catch (error) {
            console.error('Erro ao buscar lotes comprados:', error.message);
        }
    };

    const getLotesAtuais = () => {
        return abaAtiva === 'comprados' ? lotesComprados : lotes;
    };

    // NOVO: Função para abrir o modal visual e zerar o carrossel
    const abrirModalVisualizacao = (lote) => {
        setLoteAtivo(lote);
        setImagemAtualIndex(0);
    };

    const fecharModalVisualizacao = () => {
        setLoteAtivo(null);
    };

    const abrirEditor = (lote) => {
        const fotos = normalizeFotoUrls(lote);
        setEditingLote({
            ...lote,
            tipo_material: lote.tipo_material || lote.categoria || TIPOS_MATERIAIS_PADRAO[0],
            descricao_resumida: lote.descricao_resumida || '',
            descricao_completa: lote.descricao_completa || lote.descricao || '',
            numero_itens: lote.numero_itens || '',
            materiais_lote: normalizeMateriaisLote(lote.materiais_lote),
            local_lote: lote.local_lote || loteLocalLabel(lote),
            fotos_urls: fotos,
            fotos_urls_text: fotos.join('\n'),
            materiais_lote_text: normalizeMateriaisLote(lote.materiais_lote).join('\n'),
        });
    };

    const salvarEdicao = async () => {
        if (!editingLote) return;
        setSalvandoEdicao(true);

        try {
            const linhas = editingLote.fotos_urls_text
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .slice(0, MAX_FOTOS_LOTE);

            const payloadNovo = buildLotePayload(
                {
                    ...editingLote,
                    numero_itens: editingLote.numero_itens,
                    materiais_lote: editingLote.materiais_lote_text,
                    descricao_completa: editingLote.descricao_completa,
                    descricao_resumida: editingLote.descricao_resumida,
                    local_lote: editingLote.local_lote,
                },
                empresaId,
                linhas,
            );

            const { error: erroNovo } = await supabase
                .from('lotes')
                .update(payloadNovo)
                .eq('id', editingLote.id)
                .eq('empresa_id', empresaId);

            if (erroNovo) {
                const payloadLegado = buildLegacyLotePayload(editingLote, empresaId, linhas);
                const { error: erroLegado } = await supabase
                    .from('lotes')
                    .update(payloadLegado)
                    .eq('id', editingLote.id)
                    .eq('empresa_id', empresaId);

                if (erroLegado) {
                    throw new Error(erroNovo.message || erroLegado.message);
                }
            }

            setEditingLote(null);
            await buscarLotesProprios();
        } catch (error) {
            alert(`Erro ao salvar lote: ${error.message}`);
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const removerLote = async (lote) => {
        const confirmou = window.confirm('Deseja remover este lote? Esta ação não pode ser desfeita.');
        if (!confirmou) return;

        setDeletando(lote.id);
        try {
            const fotos = normalizeFotoUrls(lote);
            if (fotos.length) {
                const nomes = fotos.map((url) => url.split('/').pop()).filter(Boolean);
                if (nomes.length) {
                    await supabase.storage.from('lotes-fotos').remove(nomes);
                }
            }

            const { error } = await supabase
                .from('lotes')
                .delete()
                .eq('id', lote.id)
                .eq('empresa_id', empresaId);

            if (error) throw error;

            setLotes((prev) => prev.filter((item) => item.id !== lote.id));
            if (loteAtivo?.id === lote.id) {
                setLoteAtivo(null);
            }
        } catch (error) {
            alert(`Erro ao remover lote: ${error.message}`);
        } finally {
            setDeletando(null);
        }
    };

    // Funções do Carrossel
    const fotosModal = loteAtivo ? normalizeFotoUrls(loteAtivo) : [];
    
    const prevImage = (e) => {
        e.stopPropagation();
        setImagemAtualIndex((prev) => (prev === 0 ? fotosModal.length - 1 : prev - 1));
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setImagemAtualIndex((prev) => (prev === fotosModal.length - 1 ? 0 : prev + 1));
    };

    const lotesAtuais = getLotesAtuais();

    return (
        <div className="my-products-page">
            {/* O CSS injetado foi limpo das antigas galerias horizontais */}
            <style>{`
                .my-products-page {
                    max-width: 1320px;
                    margin: 0 auto;
                    padding-left: 24px;
                    padding-right: 24px;
                }
                @media (max-width: 850px) {
                    .my-products-page {
                        padding-left: 16px;
                        padding-right: 16px;
                    }
                }
                .foto-count-badge {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.65);
                    color: white;
                    font-size: 0.75rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                    z-index: 2;
                }
            `}</style>
            
            <header className="my-products-header">
                <div className="my-products-header-content">
                    <div className="my-products-title-area">
                        <h2>Meus <span className="text-highlight">Lotes</span></h2>
                        <p>Gerencie seus lotes anunciados e acompanhe suas compras.</p>
                    </div>
                    <div className="my-products-stats">
                        <div className="stat-card">
                            <span className="stat-value">{totalAnunciados}</span>
                            <span className="stat-label">Anunciados</span>
                        </div>
                        <div className="stat-card stat-sold">
                            <span className="stat-value">{totalVendidos}</span>
                            <span className="stat-label">Vendidos</span>
                        </div>
                        <div className="stat-card stat-bought">
                            <span className="stat-value">{totalComprados}</span>
                            <span className="stat-label">Comprados</span>
                        </div>
                    </div>
                </div>
                <div className="my-products-tabs">
                    <button type="button" className={`my-products-tab ${abaAtiva === 'anunciados' ? 'active' : ''}`} onClick={() => setAbaAtiva('anunciados')}>
                        Anunciados ({totalAnunciados})
                    </button>
                    <button type="button" className={`my-products-tab ${abaAtiva === 'comprados' ? 'active' : ''}`} onClick={() => setAbaAtiva('comprados')}>
                        Comprados ({totalComprados})
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="marketplace-status"><p>Carregando seus lotes...</p></div>
            ) : lotesAtuais.length === 0 ? (
                <div className="marketplace-status"><p>{abaAtiva === 'comprados' ? 'Você ainda não comprou lotes.' : 'Você ainda não publicou lotes.'}</p></div>
            ) : (
                <div className="marketplace-grid">
                    {lotesAtuais.map((lote) => {
                        const fotoUrls = normalizeFotoUrls(lote);
                        const fotoPrincipal = fotoUrls[0] || null;

                        return (
                            <article key={lote.id} className="lote-card">
                                <div className="lote-image-placeholder" onClick={() => abrirModalVisualizacao(lote)}>
                                    {fotoPrincipal ? (
                                        <img src={fotoPrincipal} alt={lote.titulo} className="lote-foto" />
                                    ) : (
                                        <span className="image-icon">📷</span>
                                    )}
                                    {fotoUrls.length > 1 && (
                                        <span className="foto-count-badge">+{fotoUrls.length - 1} foto(s)</span>
                                    )}
                                    <span className="categoria-badge">{lote.tipo_material || lote.categoria || 'Sem categoria'}</span>
                                </div>

                                <div className="lote-info">
                                    <h3 className="lote-titulo">{lote.titulo}</h3>
                                    <div className="lote-meta">
                                        <span>⚖️ {lote.peso_kg ? `${lote.peso_kg}kg` : 'Peso N/A'}</span>
                                        <span>📍 {loteLocalLabel(lote)}</span>
                                    </div>
                                    <p className="lote-descricao">{lote.descricao_resumida || lote.descricao || 'Sem descrição.'}</p>
                                </div>

                                <div className="my-products-actions">
                                    {abaAtiva === 'anunciados' ? (
                                        <>
                                            <button type="button" className="btn-manage" onClick={() => abrirEditor(lote)}>Editar</button>
                                            <button type="button" className="btn-manage btn-manage--danger" onClick={() => removerLote(lote)} disabled={deletando === lote.id}>
                                                {deletando === lote.id ? 'Removendo...' : 'Remover'}
                                            </button>
                                        </>
                                    ) : (
                                        <button type="button" className="btn-manage" onClick={() => abrirModalVisualizacao(lote)}>Ver lote entregue</button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE VISUALIZAÇÃO COM O NOVO CARROSSEL */}
            {loteAtivo && (
                <div className="modal-overlay" onClick={fecharModalVisualizacao}>
                    <div className="modal-lote" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-fechar" onClick={fecharModalVisualizacao} aria-label="Fechar modal">✕</button>
                        
                        <div className="modal-imagem carousel-container">
                            {fotosModal.length > 0 ? (
                                <>
                                    <img src={fotosModal[imagemAtualIndex]} alt={`${loteAtivo.titulo} - Imagem ${imagemAtualIndex + 1}`} />

                                    {fotosModal.length > 1 && (
                                        <>
                                            <button className="carousel-btn prev" onClick={prevImage}>❮</button>
                                            <button className="carousel-btn next" onClick={nextImage}>❯</button>

                                            <div className="carousel-dots">
                                                {fotosModal.map((_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`dot ${index === imagemAtualIndex ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImagemAtualIndex(index);
                                                        }}
                                                    ></span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="modal-sem-foto">📷</div>
                            )}
                            <span className="categoria-badge" style={{ zIndex: 20 }}>
                                {loteAtivo.tipo_material || loteAtivo.categoria || 'Sem categoria'}
                            </span>
                        </div>

                        <div className="modal-conteudo">
                            <h2 className="modal-titulo">{loteAtivo.titulo}</h2>
                            <div className="modal-detalhes-grid">
                                <div className="modal-detalhe"><span className="detalhe-label">Peso</span><span className="detalhe-valor">{loteAtivo.peso_kg || 'N/A'} kg</span></div>
                                <div className="modal-detalhe"><span className="detalhe-label">Local</span><span className="detalhe-valor">{loteLocalLabel(loteAtivo)}</span></div>
                                <div className="modal-detalhe"><span className="detalhe-label">Status</span><span className="detalhe-valor">{loteAtivo.status || 'disponivel'}</span></div>
                                <div className="modal-detalhe"><span className="detalhe-label">Fotos</span><span className="detalhe-valor">{normalizeFotoUrls(loteAtivo).length}</span></div>
                                <div className="modal-detalhe"><span className="detalhe-label">Itens no lote</span><span className="detalhe-valor">{loteAtivo.numero_itens || 'N/A'}</span></div>
                            </div>
                            <div className="modal-descricao-bloco">
                                <span className="detalhe-label">Resumo</span>
                                <p className="modal-descricao-texto">{loteAtivo.descricao_resumida || 'Sem resumo'}</p>
                                <span className="detalhe-label">Descrição completa</span>
                                <p className="modal-descricao-texto">{loteAtivo.descricao_completa || loteAtivo.descricao || 'Sem descrição completa'}</p>
                                <span className="detalhe-label">Materiais no lote</span>
                                <p className="modal-descricao-texto">{normalizeMateriaisLote(loteAtivo.materiais_lote).join(', ') || 'Não informado'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO (MANTIDO INTACTO) */}
            {editingLote && (
                <div className="modal-overlay" onClick={() => setEditingLote(null)}>
                    <div className="modal-edit-lote" onClick={(e) => e.stopPropagation()}>
                        <h3>Editar lote</h3>
                        <div className="form-group">
                            <label className="form-label">Título</label>
                            <input className="form-input" value={editingLote.titulo || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, titulo: e.target.value }))} />
                        </div>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Tipo de material</label>
                                <select className="form-input form-select" value={editingLote.tipo_material || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, tipo_material: e.target.value }))}>
                                    {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Peso (kg)</label>
                                <input className="form-input" value={editingLote.peso_kg || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, peso_kg: sanitizePesoInput(e.target.value) }))} />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Quantidade de itens</label>
                                <input className="form-input" value={editingLote.numero_itens || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, numero_itens: String(e.target.value || '').replace(/\D/g, '') }))} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Local do lote (API - não editável)</label>
                            <input className="form-input" value={editingLote.local_lote || ''} disabled readOnly />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descrição resumida</label>
                            <input className="form-input" value={editingLote.descricao_resumida || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, descricao_resumida: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descrição completa</label>
                            <textarea className="form-input form-textarea" rows="4" value={editingLote.descricao_completa || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, descricao_completa: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Materiais no lote (1 por linha)</label>
                            <textarea className="form-input form-textarea" rows="4" value={editingLote.materiais_lote_text || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, materiais_lote_text: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fotos (1 URL por linha, máx. {MAX_FOTOS_LOTE})</label>
                            <textarea className="form-input form-textarea" rows="4" value={editingLote.fotos_urls_text || ''} onChange={(e) => setEditingLote((prev) => ({ ...prev, fotos_urls_text: e.target.value }))} />
                        </div>
                        <div className="edit-actions">
                            <button type="button" className="btn-manage" onClick={() => setEditingLote(null)}>Cancelar</button>
                            <button type="button" className="btn-manage" onClick={salvarEdicao} disabled={salvandoEdicao}>
                                {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

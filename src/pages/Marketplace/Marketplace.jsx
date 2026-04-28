import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { getOrCreateEmpresaForUser } from '../../utils/empresa';
import { normalizeFotoUrls, TIPOS_MATERIAIS_PADRAO } from '../../utils/loteUtils';
import './Marketplace.css';

function loteLocalLabel(lote) {
    if (lote.local_lote) return lote.local_lote;
    if (lote.cidade || lote.estado) return [lote.cidade, lote.estado].filter(Boolean).join(', ');
    return 'Local não informado';
}

export default function Marketplace() {
    const [lotes, setLotes] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [loteAtivo, setLoteAtivo] = useState(null);
    const [empresaLogadaId, setEmpresaLogadaId] = useState(null);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [comprandoLoteId, setComprandoLoteId] = useState(null);

    const categorias = useMemo(() => ['Todos', ...TIPOS_MATERIAIS_PADRAO], []);

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (!userStr) return;

        const usuario = JSON.parse(userStr);
        setUsuarioLogado(usuario);
        const buscarEmpresa = async () => {
            const id = await getOrCreateEmpresaForUser(usuario);
            setEmpresaLogadaId(id);
        };

        buscarEmpresa();
    }, []);

    useEffect(() => {
        buscarLotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriaAtiva, empresaLogadaId]);

    useEffect(() => {
        const handleKey = (e) => e.key === 'Escape' && setLoteAtivo(null);
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => {
        document.body.style.overflow = loteAtivo ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [loteAtivo]);

    const buscarLotes = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('lotes')
                .select(`
                    *,
                    empresas (
                        id,
                        nome,
                        email,
                        telefone
                    )
                `)
                .eq('status', 'disponivel')
                .order('created_at', { ascending: false });

            if (categoriaAtiva !== 'Todos') {
                query = query.or(`tipo_material.eq.${categoriaAtiva},categoria.eq.${categoriaAtiva}`);
            }

            const { data, error } = await query;
            if (error) throw error;

            const filtrados = (data || []).filter((lote) => {
                if (!empresaLogadaId) return true;
                return lote.empresa_id !== empresaLogadaId;
            });

            setLotes(filtrados);
        } catch (error) {
            console.error('Erro ao buscar lotes:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (lote) => setLoteAtivo(lote);
    const fecharModal = () => setLoteAtivo(null);

    const comprarLote = async () => {
        if (!loteAtivo) return;
        if (!usuarioLogado) {
            alert('Entre na sua conta para comprar um lote.');
            return;
        }

        if (loteAtivo.empresa_id === empresaLogadaId) {
            alert('Este lote pertence a sua conta.');
            return;
        }

        const confirmou = window.confirm('Confirmar compra deste lote? Ele sairá do marketplace e ficará em Meus Produtos > Comprados.');
        if (!confirmou) return;

        setComprandoLoteId(loteAtivo.id);
        try {
            const compradorEmpresaId = empresaLogadaId || await getOrCreateEmpresaForUser(usuarioLogado);
            const agora = new Date().toISOString();
            const { data, error } = await supabase
                .from('lotes')
                .update({
                    status: 'entregue',
                    comprador_empresa_id: compradorEmpresaId,
                    comprador_email: usuarioLogado.email,
                    comprado_em: agora,
                    finalizado_em: agora,
                    entregue_em: agora,
                })
                .eq('id', loteAtivo.id)
                .eq('status', 'disponivel')
                .neq('empresa_id', compradorEmpresaId)
                .select()
                .single();

            if (error) throw error;
            if (!data) {
                throw new Error('Este lote nao esta mais disponivel para compra.');
            }

            setEmpresaLogadaId(compradorEmpresaId);
            setLotes((prev) => prev.filter((lote) => lote.id !== loteAtivo.id));
            setLoteAtivo(null);
            alert('Compra finalizada. O lote foi marcado como entregue e aparece em Meus Produtos > Comprados.');
        } catch (error) {
            alert(`Erro ao comprar lote: ${error.message}`);
        } finally {
            setComprandoLoteId(null);
        }
    };

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <h2>Marketplace <span className="text-highlight">EcoLink</span></h2>
                <p>Explore lotes publicados por outras empresas. Seus próprios anúncios aparecem em Meus Produtos.</p>

                <div className="marketplace-filters">
                    {categorias.map((cat) => (
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
                <div className="marketplace-status"><p>Carregando lotes...</p></div>
            ) : lotes.length === 0 ? (
                <div className="marketplace-status"><p>Nenhum lote disponível nessa categoria no momento.</p></div>
            ) : (
                <div className="marketplace-grid">
                    {lotes.map((lote) => {
                        const fotoUrls = normalizeFotoUrls(lote);
                        const fotoPrincipal = fotoUrls[0] || null;
                        const categoriaLabel = lote.tipo_material || lote.categoria || 'Sem categoria';

                        return (
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
                                    {fotoPrincipal ? (
                                        <img src={fotoPrincipal} alt={lote.titulo} className="lote-foto" />
                                    ) : (
                                        <span className="image-icon">📷</span>
                                    )}
                                    <span className="categoria-badge">{categoriaLabel}</span>
                                </div>

                                <div className="lote-info">
                                    <h3 className="lote-titulo">{lote.titulo}</h3>
                                    <p className="lote-empresa">🏢 {lote.empresas?.nome || 'Empresa parceira'}</p>

                                    <div className="lote-meta">
                                        <span>⚖️ {lote.peso_kg ? `${lote.peso_kg}kg` : 'Peso N/A'}</span>
                                        <span>📍 {loteLocalLabel(lote)}</span>
                                    </div>

                                    <p className="lote-descricao">{lote.descricao_resumida || lote.descricao || 'Sem descrição.'}</p>
                                </div>

                                <div className="lote-action">
                                    <span className="card-ver-detalhes">Ver detalhes →</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {loteAtivo && (
                <div className="modal-overlay" onClick={fecharModal} role="dialog" aria-modal="true" aria-label={`Detalhes do lote ${loteAtivo.titulo}`}>
                    <div className="modal-lote" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-fechar" onClick={fecharModal} aria-label="Fechar modal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="modal-imagem">
                            {normalizeFotoUrls(loteAtivo)[0] ? (
                                <img src={normalizeFotoUrls(loteAtivo)[0]} alt={loteAtivo.titulo} />
                            ) : (
                                <div className="modal-sem-foto">📷</div>
                            )}
                            <span className="categoria-badge">{loteAtivo.tipo_material || loteAtivo.categoria || 'Sem categoria'}</span>
                        </div>

                        <div className="modal-conteudo">
                            <div className="modal-topo">
                                <div>
                                    <h2 className="modal-titulo">{loteAtivo.titulo}</h2>
                                    <p className="modal-empresa">🏢 {loteAtivo.empresas?.nome || 'Empresa parceira'}</p>
                                </div>
                            </div>

                            <div className="modal-detalhes-grid">
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Peso</span>
                                    <span className="detalhe-valor">{loteAtivo.peso_kg ? `${loteAtivo.peso_kg} kg` : 'Não informado'}</span>
                                </div>
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Localização</span>
                                    <span className="detalhe-valor">{loteLocalLabel(loteAtivo)}</span>
                                </div>
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Material</span>
                                    <span className="detalhe-valor">{loteAtivo.tipo_material || loteAtivo.categoria || 'Não informado'}</span>
                                </div>
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Status</span>
                                    <span className="detalhe-valor detalhe-disponivel">Disponível</span>
                                </div>
                            </div>

                            {(loteAtivo.descricao_resumida || loteAtivo.descricao_completa || loteAtivo.descricao) && (
                                <div className="modal-descricao-bloco">
                                    <span className="detalhe-label">Descrição resumida</span>
                                    <p className="modal-descricao-texto">{loteAtivo.descricao_resumida || 'Não informada'}</p>
                                    <span className="detalhe-label">Descrição completa</span>
                                    <p className="modal-descricao-texto">{loteAtivo.descricao_completa || loteAtivo.descricao || 'Não informada'}</p>
                                </div>
                            )}

                            <div className="modal-contato-bloco">
                                <button
                                    type="button"
                                    className="btn-comprar-lote"
                                    onClick={comprarLote}
                                    disabled={comprandoLoteId === loteAtivo.id}
                                >
                                    {comprandoLoteId === loteAtivo.id ? 'Finalizando compra...' : 'Comprar e finalizar lote'}
                                </button>

                                <div className="contato-revelado">
                                    <p className="contato-nome">👤 {loteAtivo.empresas?.nome || 'Anunciante'}</p>
                                    <p className="contato-dado">📞 {loteAtivo.empresas?.telefone || 'Não informado'}</p>
                                    <p className="contato-dado">✉️ {loteAtivo.empresas?.email || 'Não informado'}</p>

                                    {loteAtivo.empresas?.telefone && (
                                        <a
                                            href={`https://wa.me/55${loteAtivo.empresas.telefone.replace(/\D/g, '')}?text=Olá! Tenho interesse no lote: ${loteAtivo.titulo}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-whatsapp"
                                        >
                                            Chamar no WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

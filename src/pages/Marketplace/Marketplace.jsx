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
    const [busca, setBusca] = useState('');

    // Estado para controlar a imagem atual do carrossel no Modal
    const [imagemAtualIndex, setImagemAtualIndex] = useState(0);

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
    }, [categoriaAtiva, empresaLogadaId, busca]); // Adicionado 'busca' nas dependências para filtrar em tempo real

    useEffect(() => {
        const handleKey = (e) => e.key === 'Escape' && fecharModal();
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => {
        document.body.style.overflow = loteAtivo ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [loteAtivo]);

    const buscarLotes = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('lotes')
                .select(`*, empresas (id, nome, email, telefone)`)
                .eq('status', 'disponivel')
                .order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            const normaliza = (str) => (str || '').toString().trim().toLowerCase();
            const categoriaAtivaNorm = normaliza(categoriaAtiva);

            const filtrados = (data || []).filter((lote) => {

                // Esconde os lotes do próprio usuário logado da vitrine
                if (empresaLogadaId && lote.empresa_id === empresaLogadaId) return false;

                // Filtro por Categoria Ativa (Botões)
                if (categoriaAtiva !== 'Todos') {
                    const cat = normaliza(lote.tipo_material) || normaliza(lote.categoria);
                    if (cat !== categoriaAtivaNorm) return false;
                }

                // Nova Lógica de Busca Aprimorada
                if (busca.trim()) {
                    const buscaNorm = normaliza(busca);
                    const titulo = normaliza(lote.titulo);
                    const descricao = normaliza(lote.descricao_resumida) + ' ' + normaliza(lote.descricao) + ' ' + normaliza(lote.descricao_completa);
                    const empresa = normaliza(lote.empresas?.nome);
                    const categoriaBusca = normaliza(lote.tipo_material) + ' ' + normaliza(lote.categoria);

                    if (
                        !titulo.includes(buscaNorm) && 
                        !descricao.includes(buscaNorm) && 
                        !empresa.includes(buscaNorm) && 
                        !categoriaBusca.includes(buscaNorm)
                    ) {
                        return false;
                    }
                }

                return true;
            });

            setLotes(filtrados);
        } catch (error) {
            console.error('Erro ao buscar lotes:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (lote) => {
        setLoteAtivo(lote);
        setImagemAtualIndex(0);
    };

    const fecharModal = () => {
        setLoteAtivo(null);
    };

    const comprarLote = async () => {
        if (!loteAtivo) return;
        if (!usuarioLogado) { alert('Entre na sua conta para comprar um lote.'); return; }
        if (loteAtivo.empresa_id === empresaLogadaId) { alert('Este lote pertence a sua conta.'); return; }

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
            if (!data) throw new Error('Este lote não está mais disponível para compra.');

            setEmpresaLogadaId(compradorEmpresaId);
            setLotes((prev) => prev.filter((lote) => lote.id !== loteAtivo.id));
            fecharModal();
            alert('Compra finalizada. O lote foi marcado como entregue e aparece em Meus Produtos > Comprados.');
        } catch (error) {
            alert(`Erro ao comprar lote: ${error.message}`);
        } finally {
            setComprandoLoteId(null);
        }
    };

    // Lógica do Carrossel (Avançar e Voltar)
    const fotosModal = loteAtivo ? normalizeFotoUrls(loteAtivo) : [];

    const prevImage = (e) => {
        e.stopPropagation();
        setImagemAtualIndex((prev) => (prev === 0 ? fotosModal.length - 1 : prev - 1));
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setImagemAtualIndex((prev) => (prev === fotosModal.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <div className="marketplace-header-top">
                        <div>
                            <h2 className="marketplace-titulo">
                                Mercado <span className="text-highlight">EcoLink</span>
                            </h2>
                            <p className="marketplace-subtitulo">
                                Lotes de eletrônicos disponíveis de outras empresas
                            </p>
                        </div>
                        <span className="marketplace-total">
                            {!loading && `${lotes.length} lote${lotes.length !== 1 ? 's' : ''}`}
                        </span>
                    </div>

                    <input
                        type="text"
                        className="marketplace-search"
                        placeholder="Buscar lotes..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        style={{
                            padding: '0.45rem 1rem',
                            borderRadius: '999px',
                            border: '1px solid var(--ui-border)',
                            fontSize: '0.95rem',
                            width: '100%',
                            maxWidth: 340,
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            marginTop: '0.2rem',
                            marginBottom: '0.2rem',
                        }}
                    />

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
                </div>
            </header>

            <main className="marketplace-body">
                {loading ? (
                    <div className="marketplace-status">
                        <div className="status-spinner" />
                        <p>Carregando lotes...</p>
                    </div>
                ) : lotes.length === 0 ? (
                    <div className="marketplace-status">
                        <p className="status-icon">📭</p>
                        <p>Nenhum lote disponível nessa categoria.</p>
                    </div>
                ) : (
                    <div className="marketplace-grid">
                        {lotes.map((lote) => {
                            const fotoUrls = normalizeFotoUrls(lote);
                            const fotoPrincipal = fotoUrls[0] || null;
                            const categoriaRaw = lote.tipo_material || lote.categoria || '';
                            const categoriaValida = TIPOS_MATERIAIS_PADRAO.includes(categoriaRaw);
                            const categoriaLabel = categoriaValida ? categoriaRaw : null;

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
                                    <div className="lote-img-wrap">
                                        {fotoPrincipal ? (
                                            <img src={fotoPrincipal} alt={lote.titulo} className="lote-foto" />
                                        ) : (
                                            <div className="lote-sem-foto">📷</div>
                                        )}
                                        {categoriaLabel && (
                                            <span className="categoria-badge">{categoriaLabel}</span>
                                        )}
                                    </div>

                                    <div className="lote-body">
                                        <h3 className="lote-titulo">{lote.titulo}</h3>

                                        <p className="lote-peso">
                                            {lote.peso_kg
                                                ? <><strong>{lote.peso_kg}</strong> kg</>
                                                : <span className="lote-peso-nd">Peso não informado</span>
                                            }
                                        </p>

                                        <p className="lote-descricao">
                                            {lote.descricao_resumida || lote.descricao || ''}
                                        </p>
                                    </div>

                                    <div className="lote-footer">
                                        <span className="lote-empresa">{lote.empresas?.nome || 'Empresa parceira'}</span>
                                        <span className="lote-local">{loteLocalLabel(lote)}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* MODAL COM CARROSSEL */}
            {loteAtivo && (
                <div
                    className="modal-overlay"
                    onClick={fecharModal}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Detalhes do lote ${loteAtivo.titulo}`}
                >
                    <div className="modal-lote" onClick={(e) => e.stopPropagation()}>

                        <button className="modal-fechar" onClick={fecharModal} aria-label="Fechar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

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
                            {TIPOS_MATERIAIS_PADRAO.includes(loteAtivo.tipo_material || loteAtivo.categoria) && (
                                <span className="categoria-badge" style={{ zIndex: 20 }}>
                                    {loteAtivo.tipo_material || loteAtivo.categoria}
                                </span>
                            )}
                        </div>

                        <div className="modal-conteudo">

                            <div className="modal-topo">
                                <h2 className="modal-titulo">{loteAtivo.titulo}</h2>
                                <p className="modal-empresa">{loteAtivo.empresas?.nome || 'Empresa parceira'}</p>
                            </div>

                            <div className="modal-peso-destaque">
                                <span className="modal-peso-valor">
                                    {loteAtivo.peso_kg ? `${loteAtivo.peso_kg} kg` : 'Peso não informado'}
                                </span>
                                <span className="modal-peso-label">peso do lote</span>
                            </div>

                            <div className="modal-detalhes-grid">
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
                                    <span className="detalhe-valor detalhe-disponivel">● Disponível</span>
                                </div>
                                <div className="modal-detalhe">
                                    <span className="detalhe-label">Anunciante</span>
                                    <span className="detalhe-valor">{loteAtivo.empresas?.nome || '—'}</span>
                                </div>
                            </div>

                            {(loteAtivo.descricao_resumida || loteAtivo.descricao_completa || loteAtivo.descricao) && (
                                <div className="modal-descricao-bloco">
                                    {loteAtivo.descricao_resumida && (
                                        <>
                                            <span className="detalhe-label">Resumo</span>
                                            <p className="modal-descricao-texto">{loteAtivo.descricao_resumida}</p>
                                        </>
                                    )}
                                    {(loteAtivo.descricao_completa || loteAtivo.descricao) && (
                                        <>
                                            <span className="detalhe-label">Descrição completa</span>
                                            <p className="modal-descricao-texto">{loteAtivo.descricao_completa || loteAtivo.descricao}</p>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="modal-acoes">

                                <div className="modal-contato">
                                    <div className="contato-info">
                                        <span className="contato-nome">{loteAtivo.empresas?.nome || 'Anunciante'}</span>
                                        <span className="contato-dado">{loteAtivo.empresas?.telefone || 'Telefone não informado'}</span>
                                        <span className="contato-dado">{loteAtivo.empresas?.email || 'E-mail não informado'}</span>
                                    </div>

                                    {loteAtivo.empresas?.telefone && (
                                        <a
                                            href={`https://wa.me/55${loteAtivo.empresas.telefone.replace(/\D/g, '')}?text=Olá! Tenho interesse no lote: ${loteAtivo.titulo}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-whatsapp"
                                        >
                                            Contatar no WhatsApp
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
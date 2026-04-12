import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './Marketplace.css';

export default function Marketplace() {
    const [lotes, setLotes] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
    const [contatosRevelados, setContatosRevelados] = useState({});
    const [loading, setLoading] = useState(true);
    const [deletando, setDeletando] = useState(null);

    const categorias = ['Todos', 'Monitores', 'Servidores / Placas', 'Notebooks', 'Misto'];

    useEffect(() => {
        buscarLotes();
    }, [categoriaAtiva]);

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

    const revelarContato = (id) => {
        setContatosRevelados(prev => ({ ...prev, [id]: true }));
    };

    const deletarLote = async (id, foto_url) => {
        const confirmar = window.confirm('Tem certeza que deseja remover este lote da vitrine?');
        if (!confirmar) return;

        setDeletando(id);
        try {
            // 1. Se tiver foto, remove do Storage também
            if (foto_url) {
                const nomeArquivo = foto_url.split('/').pop();
                await supabase.storage
                    .from('lotes-fotos')
                    .remove([nomeArquivo]);
            }

            // 2. Remove o lote do banco
            const { error } = await supabase
                .from('lotes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 3. Remove da lista local sem precisar recarregar
            setLotes(prev => prev.filter(lote => lote.id !== id));
        } catch (error) {
            console.error('Erro ao deletar lote:', error.message);
            alert('Erro ao remover lote: ' + error.message);
        } finally {
            setDeletando(null);
        }
    };

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
                        <article key={lote.id} className="lote-card">

                            <div className="lote-image-placeholder">
                                {lote.foto_url ? (
                                    <img src={lote.foto_url} alt={lote.titulo} className="lote-foto" />
                                ) : (
                                    <span className="image-icon">📷</span>
                                )}
                                <span className="categoria-badge">{lote.categoria}</span>

                                {/* Botão de deletar no canto superior esquerdo da imagem */}
                                <button
                                    className="btn-deletar"
                                    onClick={() => deletarLote(lote.id, lote.foto_url)}
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
                                {contatosRevelados[lote.id] ? (
                                    <div className="contato-revelado">
                                        <p className="contato-nome">👤 {lote.empresas?.nome}</p>
                                        <p className="contato-dado">📞 {lote.empresas?.telefone || 'Não informado'}</p>
                                        <p className="contato-dado">✉️ {lote.empresas?.email || 'Não informado'}</p>

                                        {lote.empresas?.telefone && (
                                            <a
                                                href={`https://wa.me/55${lote.empresas.telefone.replace(/\D/g, '')}?text=Olá! Vi seu anúncio no EcoLink: ${lote.titulo}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-whatsapp"
                                            >
                                                Chamar no WhatsApp
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        className="btn-revelar"
                                        onClick={() => revelarContato(lote.id)}
                                    >
                                        Ver Contato do Vendedor
                                    </button>
                                )}
                            </div>

                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
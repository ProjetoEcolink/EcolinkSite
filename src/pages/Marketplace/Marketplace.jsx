import React, { useState } from 'react';
import './Marketplace.css';

// Banco de dados falso (Mock) para o MVP
const mockLotes = [
    {
        id: 1,
        titulo: "Lote 50 Monitores Dell 19\"",
        empresa: "Tech Solutions S.A",
        peso: "Aprox. 120kg",
        categoria: "Monitores",
        local: "Curitiba, PR",
        descricao: "Monitores funcionando, trocados em atualização de parque tecnológico. Acompanha cabos de energia.",
        contato: { nome: "Carlos", telefone: "(41) 99999-0000", email: "carlos@techsolutions.com" }
    },
    {
        id: 2,
        titulo: "Sucata de Servidores HP",
        empresa: "DataCenter CloudBR",
        peso: "Aprox. 450kg",
        categoria: "Servidores / Placas",
        local: "São Paulo, SP",
        descricao: "Servidores antigos desativados. Sem HDDs (destruídos fisicamente por segurança). Alto teor de placas-mãe.",
        contato: { nome: "Ana", telefone: "(11) 98888-1111", email: "ana@cloudbr.com.br" }
    },
    {
        id: 3,
        titulo: "Lote Misto: Notebooks e Nobreaks",
        empresa: "Agência Criativa Ltda",
        peso: "Aprox. 80kg",
        categoria: "Misto",
        local: "Florianópolis, SC",
        descricao: "Cerca de 15 notebooks variados (telas quebradas ou baterias viciadas) e 5 nobreaks pesados.",
        contato: { nome: "Marcos", telefone: "(48) 97777-2222", email: "marcos@agenciacriativa.com" }
    }
];

export default function Marketplace() {
    // Estado para controlar quais contatos foram revelados (guarda o ID do lote)
    const [contatosRevelados, setContatosRevelados] = useState([]);

    const revelarContato = (id) => {
        if (!contatosRevelados.includes(id)) {
            setContatosRevelados([...contatosRevelados, id]);
        }
    };

    return (
        <div className="marketplace-page">
            <div className="marketplace-header">
                <h2>Vitrine de <span className="text-highlight">Lotes Disponíveis</span></h2>
                <p>Encontre os melhores ativos de TI e negocie direto com o gerador.</p>

                {/* Filtros simples para o MVP */}
                <div className="marketplace-filters">
                    <button className="filter-btn active">Todos</button>
                    <button className="filter-btn">Monitores</button>
                    <button className="filter-btn">Servidores</button>
                    <button className="filter-btn">Misto</button>
                </div>
            </div>

            <div className="marketplace-grid">
                {mockLotes.map((lote) => (
                    <div key={lote.id} className="lote-card">

                        {/* Imagem Placeholder */}
                        <div className="lote-image-placeholder">
                            <span className="image-icon">📷</span>
                            <span className="categoria-badge">{lote.categoria}</span>
                        </div>

                        <div className="lote-info">
                            <h3 className="lote-titulo">{lote.titulo}</h3>
                            <p className="lote-empresa">🏢 {lote.empresa}</p>

                            <div className="lote-meta">
                                <span>⚖️ {lote.peso}</span>
                                <span>📍 {lote.local}</span>
                            </div>

                            <p className="lote-descricao">{lote.descricao}</p>
                        </div>

                        <div className="lote-action">
                            {contatosRevelados.includes(lote.id) ? (
                                <div className="contato-revelado">
                                    <p className="contato-nome">👤 {lote.contato.nome}</p>
                                    <p className="contato-dado">📞 {lote.contato.telefone}</p>
                                    <p className="contato-dado">✉️ {lote.contato.email}</p>
                                    <a
                                        href={`https://wa.me/55${lote.contato.telefone.replace(/\D/g, '')}?text=Olá! Vi seu anúncio no EcoLink: ${lote.titulo}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-whatsapp"
                                    >
                                        Chamar no WhatsApp
                                    </a>
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
                    </div>
                ))}
            </div>
        </div>
    );
}
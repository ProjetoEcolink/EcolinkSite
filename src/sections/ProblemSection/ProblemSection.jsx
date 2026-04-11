import React, { useState } from 'react';
import './ProblemSection.css';

export default function ProblemSection() {
    const [activeCard, setActiveCard] = useState(0);

    const problems = [
        {
            id: 0,
            title: "Processos manuais e cotações demoradas",
            text: "Perda de tempo ligando para sucateiros que não entendem o valor dos seus ativos de hardware."
        },
        {
            id: 1,
            title: "Risco financeiro e de dados na venda",
            text: "Entregar material valioso contendo dados sensíveis sem garantia de recebimento ou laudo de destruição."
        },
        {
            id: 2,
            title: "Falta de rastreabilidade (Compliance MTR)",
            text: "Ausência de certificados válidos, expondo a empresa a multas ambientais e auditorias ESG negativas."
        }
    ];

    return (
        <section id="o-problema" className="problem-section">
            <div className="problem-container">

                {/* Coluna da Esquerda: Stack de Dashboards (A Inovação de UI) */}
                <div className="problem-visual-wrapper">
                    <div className="ui-fragments-stack">
                        
                        {/* Fundo Gradiente Verde Profundo */}
                        <div className="problem-graphic-glow ec-glow-forest-radial"></div>

                        {/* Fragmento 1: Cotação Demorada */}
                        <div className={`ui-fragment-card fragment-1 ${activeCard === 0 ? 'focused' : 'unfocused'}`}>
                            <div className="fragment-header">
                                <span className="fragment-dot dot-warning"></span>
                                <span className="fragment-title">Lote de Laptops #042</span>
                            </div>
                            <div className="fragment-body">
                                <div className="data-row">
                                    <span className="data-label">Status:</span>
                                    <span className="data-value warning-text">Aguardando Propostas</span>
                                </div>
                                <div className="data-row">
                                    <span className="data-label">Tempo em espera:</span>
                                    <span className="data-value">14 dias</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div className="progress-bar warning-bar" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Fragmento 2: Risco de Dados */}
                        <div className={`ui-fragment-card fragment-2 ${activeCard === 1 ? 'focused' : 'unfocused'}`}>
                            <div className="fragment-header">
                                <span className="fragment-dot dot-danger"></span>
                                <span className="fragment-title">Alerta de Segurança</span>
                            </div>
                            <div className="fragment-body">
                                <div className="data-row">
                                    <span className="data-label">Ativo:</span>
                                    <span className="data-value">Servidor Dell PowerEdge</span>
                                </div>
                                <div className="data-row">
                                    <span className="data-label">Destruição de Dados (Wipe):</span>
                                    <span className="data-value danger-text">Não Confirmada</span>
                                </div>
                                <div className="alert-box">
                                    Risco de vazamento LGPD identificado.
                                </div>
                            </div>
                        </div>

                        {/* Fragmento 3: Compliance MTR */}
                        <div className={`ui-fragment-card fragment-3 ${activeCard === 2 ? 'focused' : 'unfocused'}`}>
                            <div className="fragment-header">
                                <span className="fragment-dot dot-danger"></span>
                                <span className="fragment-title">Auditoria ESG Pendente</span>
                            </div>
                            <div className="fragment-body">
                                <div className="document-mockup">
                                    <div className="doc-line w-100"></div>
                                    <div className="doc-line w-75"></div>
                                    <div className="doc-status danger-text">MTR Ausente / Inválido</div>
                                </div>
                                <div className="data-row mt-2">
                                    <span className="data-label">Risco de Multa:</span>
                                    <span className="data-value danger-text">Alto</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Coluna da Direita: Textos e Lista Interativa */}
                <div className="problem-text-content">
                    <h2 className="problem-title">
                        O ciclo de vida da sua TI não precisa terminar no <span className="text-highlight">passivo e prejuízo.</span>
                    </h2>

                    <p className="problem-subtitle">
                        Acumular passivo tecnológico gera custos de armazenamento e riscos jurídicos ocultos. Negociar o descarte no mercado informal é um perigo para os seus dados e para a sua auditoria ESG.
                    </p>

                    <ul className="problem-list">
                        {problems.map((item, index) => (
                            <li 
                                key={item.id}
                                className={activeCard === index ? 'active-list-item' : ''}
                                onMouseEnter={() => setActiveCard(index)}
                            >
                                <div className="list-icon-container">
                                    <span className="icon-marker">✕</span>
                                </div>
                                <div className="list-text">
                                    <h4>{item.title}</h4>
                                    <p>{item.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Fundo sutil para preencher tela */}
                <div className="hero-floating-elements opacity-10">
                    <div className="tech-shape structure-shape node-a"></div>
                    <div className="tech-shape structure-shape node-d"></div>
                </div>

            </div>
        </section>
    );
}
import React from 'react';
import './FeaturesSection.css';

export default function FeaturesSection() {
    return (
        <section id="funcionalidades" className="features-section">
            <div className="features-container">

                {/* Cabeçalho da Seção */}
                <div className="features-header">
                    <h2 className="features-title">
                        Transforme eletrônicos parados em <span className="text-highlight">dinheiro.</span>
                    </h2>
                    <p className="features-subtitle">
                        Vender seu celular, notebook ou tablet antigo nunca foi tão fácil. Sem dor de cabeça, com segurança total e sem precisar sair de casa.
                    </p>
                </div>

                {/* Grid Premium SaaS */}
                <div className="features-grid-premium">
                    
                    {/* Passo 1: Foto e Valor */}
                    <div className="premium-card">
                        <div className="card-header">
                            <span className="step-badge">Passo 1</span>
                            <h3 className="card-title">Tire uma foto</h3>
                        </div>
                        
                        {/* Mini Dashboard Clean */}
                        <div className="card-ui-mockup">
                            <div className="mockup-header">Valor Estimado</div>
                            <div className="mockup-data-row">
                                <span>Notebook Antigo</span>
                                <span className="text-highlight font-mono">R$ 1.200</span>
                            </div>
                            <div className="mockup-bar-bg"><div className="mockup-bar-fill w-85"></div></div>
                        </div>

                        <p className="card-description">
                            Basta enviar uma foto do seu aparelho. Nossa inteligência artificial reconhece o modelo e diz na hora quanto ele vale no mercado.
                        </p>
                    </div>

                    {/* Passo 2: Melhor Oferta */}
                    <div className="premium-card">
                        <div className="card-header">
                            <span className="step-badge">Passo 2</span>
                            <h3 className="card-title">Receba a melhor oferta</h3>
                        </div>
                        
                        <div className="card-ui-mockup">
                            <div className="mockup-header">Oferta Selecionada</div>
                            <div className="mockup-data-row">
                                <span>Comprador Verificado</span>
                                <span className="text-highlight font-mono">R$ 1.250</span>
                            </div>
                            <div className="mockup-status status-safe">
                                <span className="status-dot"></span> Dinheiro seguro e reservado
                            </div>
                        </div>

                        <p className="card-description">
                            Nós encontramos compradores de confiança que pagam o melhor preço pelo seu eletrônico. Sem golpes e sem negociações chatas.
                        </p>
                    </div>

                    {/* Passo 3: Pagamento e Coleta */}
                    <div className="premium-card">
                        <div className="card-header">
                            <span className="step-badge">Passo 3</span>
                            <h3 className="card-title">Coleta e Pagamento PIX</h3>
                        </div>
                        
                        <div className="card-ui-mockup">
                            <div className="mockup-header">Acompanhamento</div>
                            <div className="mockup-data-row">
                                <span>Busca em Casa</span>
                                <span className="text-highlight font-mono">Agendada ✓</span>
                            </div>
                            <div className="mockup-status status-esg">
                                Você ajudou o planeta! 🌍
                            </div>
                        </div>

                        <p className="card-description">
                            Agendamos a retirada na sua porta. Assim que o aparelho for entregue, o dinheiro cai direto na sua conta. Simples assim.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
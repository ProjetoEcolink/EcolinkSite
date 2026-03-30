<<<<<<< HEAD
    import React from 'react';
=======
import React from 'react';
>>>>>>> bdeba10740cdfe17dba7c3475c9efb822e484128
import './AboutSection.css';

export default function AboutSection() {
    return (
        <section id="quem-somos" className="about-section">
            <div className="about-container">

                {/* Lado esquerdo: Manifesto, História e Pilares */}
                <div className="about-text-content">
                    <div className="about-badge">Nossa História</div>
                    
                    <h2 className="about-title">
                        A engenharia por trás da <span className="text-highlight">economia circular.</span>
                    </h2>

                    <div className="about-manifesto">
                        <p>
                            O EcoLink não é apenas uma plataforma de descarte; é uma infraestrutura tecnológica projetada para resolver um dos maiores gargalos do mundo corporativo: a gestão de fim de vida útil de ativos de TI.
                        </p>
                        <p>
                            Nascemos da união entre a engenharia ambiental de precisão e o desenvolvimento de software de alta performance. Entendemos que o mercado de reciclagem eletrônica era fragmentado, opaco e cheio de riscos ocultos para as grandes corporações. 
                        </p>
                        <p>
                            Criamos o EcoLink para ser o "fiel da balança", trazendo transparência total, auditoria em tempo real e previsibilidade financeira para transformar o seu passivo ambiental em uma receita limpa e 100% em conformidade com as leis de dados e ESG.
                        </p>
                    </div>

                    {/* Novos Pilares Estratégicos */}
                    <div className="about-pillars">
                        <div className="pillar-item">
                            <div className="pillar-icon">⚡</div>
                            <div className="pillar-text">
                                <h4>Tecnologia Proprietária</h4>
                                <p>IA para precificação instantânea de hardware obsoleto.</p>
                            </div>
                        </div>
                        <div className="pillar-item">
                            <div className="pillar-icon">🛡️</div>
                            <div className="pillar-text">
                                <h4>Segurança Escrow</h4>
                                <p>Risco zero com transações financeiras em conta-garantia.</p>
                            </div>
                        </div>
                        <div className="pillar-item">
                            <div className="pillar-icon">🌱</div>
                            <div className="pillar-text">
                                <h4>Compliance ESG</h4>
                                <p>Rastreabilidade completa e emissão automática de MTR.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado direito: Visual Inovador (Núcleo de Economia Circular / Dados) */}
                <div className="about-visual-wrapper">
                    <div className="tech-core-container">
                        
                        {/* Brilho de fundo adaptável */}
                        <div className="tech-glow"></div>
                        
                        {/* Anéis giratórios representando o ciclo (Circular Economy) */}
                        <div className="tech-ring ring-1"></div>
                        <div className="tech-ring ring-2"></div>
                        <div className="tech-ring ring-3"></div>
                        
                        {/* Núcleo central com ícone de conexão global */}
                        <div className="tech-core">
                            <svg className="core-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        
                        {/* Pontos flutuantes simulando dados/nós da rede */}
                        <div className="floating-node node-a"></div>
                        <div className="floating-node node-b"></div>
                        <div className="floating-node node-c"></div>

                    </div>
                </div>

            </div>
        </section>
    );
}
import React from 'react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer-section">
            <div className="footer-container">

                {/* Caixa de Captura Premium (CTA Final Flutuante) */}
                <div className="footer-cta-card">
                    <div className="cta-glow"></div>
                    <div className="cta-content">
                        <h2 className="cta-title">Faça parte do futuro da gestão de ativos.</h2>
                        <p className="cta-subtitle">
                            Garanta seu acesso antecipado e descubra quanto sua empresa pode recuperar no próximo descarte de TI.
                        </p>
                    </div>

                    <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Seu e-mail corporativo"
                                className="cta-input"
                                required
                            />
                            <button type="submit" className="cta-button">
                                Quero meu acesso
                            </button>
                        </div>
                    </form>
                </div>

                {/* Rodapé Principal */}
                <div className="footer-main">

                    {/* Coluna 1: Marca */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            Eco<span className="text-highlight">Link</span>
                        </div>
                        <p className="brand-description">
                            Transformando passivo ambiental em ativo financeiro de forma segura, rastreável e inteligente.
                        </p>
                    </div>

                    {/* Coluna 2: Links Rápidos */}
                    <div className="footer-links-group">
                        <h4 className="footer-links-title">Plataforma</h4>
                        <a href="#o-problema">O Problema</a>
                        <a href="#funcionalidades">Como Funciona</a>
                        <a href="#quem-somos">Quem Somos</a>
                    </div>

                    {/* Coluna 3: Legal e Contato */}
                    <div className="footer-links-group">
                        <h4 className="footer-links-title">Legal</h4>
                        <a href="#">Termos de Uso</a>
                        <a href="#">Política de Privacidade</a>
                        <a href="#">Segurança Escrow</a>
                    </div>
                </div>

                {/* Linha de Copyright */}
                <div className="footer-bottom">
                    <p>© 2026 EcoLink. Todos os direitos reservados.</p>
                    <p>Desenvolvido em Curitiba, PR.</p>
                </div>

            </div>
        </footer>
    );
}
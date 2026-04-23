import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">

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
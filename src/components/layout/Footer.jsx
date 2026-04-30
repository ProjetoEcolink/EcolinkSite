import React from 'react';
import './Footer.css';

export default function Footer() {

  // O seu e-mail de suporte real
  const emailSuporte = "juankonradoobregon2007@gmail.com";

  // URL mágica do Gmail Web (Passamos o email e o assunto pela URL)
  const gmailUrlSuporte = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailSuporte}&su=Dúvida%20sobre%20o%20EcoLink`;
  const gmailUrlErro = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailSuporte}&su=Reportar%20um%20Erro%20no%20EcoLink`;

  // Função que copia o e-mail (O Plano C)
  const handleCopiarEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailSuporte);
    alert(`O e-mail ${emailSuporte} foi copiado!`);
  };

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
              Conectando pessoas e empresas para transformar resíduos em valor sustentável.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="footer-links-group">
            <h4 className="footer-links-title">Plataforma</h4>
            <a href="/#o-problema">O Problema</a>
            <a href="/#funcionalidades">Como Funciona</a>
            <a href="/#quem-somos">Quem Somos</a>
          </div>

          {/* Coluna 3: Suporte */}
          <div className="footer-links-group">
            <h4 className="footer-links-title">Precisa de Ajuda?</h4>
            
            {/* Opção 1: Abre direto no Gmail Web (A que você pediu!) */}
            <a href={gmailUrlSuporte} target="_blank" rel="noopener noreferrer">
              Tirar uma dúvida
            </a>

            {/* Opção 2: Tenta abrir App Nativo do celular/PC (O mailto original) */}
            <a href={gmailUrlErro} target="_blank" rel="noopener noreferrer">
              Reportar erro 
            </a>
                        
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
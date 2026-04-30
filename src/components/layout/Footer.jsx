import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  // O seu e-mail de suporte real
  const emailSuporte = "juankonradoobregon2007@gmail.com";

  // URL mágica do Gmail Web
  const gmailUrlSuporte = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailSuporte}&su=Dúvida%20sobre%20o%20EcoLink`;
  const gmailUrlErro = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailSuporte}&su=Reportar%20um%20Erro%20no%20EcoLink`;

  // Monitora mudanças no hash da URL para rolar a tela após o carregamento da página
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Um pequeno delay garante que a página já renderizou os elementos
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // Função que gerencia o clique nos links da Plataforma
  const handleScroll = (e, hash) => {
    e.preventDefault();
    
    const rotaDaLandingPage = '/home'; 

    if (location.pathname === rotaDaLandingPage) {
      // Se já está na página certa, só rola a tela suavemente
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn(`Elemento com id="${id}" não encontrado nesta página.`);
      }
    } else {
      // Se está em outra página (ex: /meus-produtos), navega pra lá adicionando o hash
      navigate(`${rotaDaLandingPage}${hash}`);
    }
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
            {/* Agora usando a função handleScroll com botões ou links interceptados */}
            <a href="/#o-problema" onClick={(e) => handleScroll(e, '#o-problema')}>O Problema</a>
            <a href="/#funcionalidades" onClick={(e) => handleScroll(e, '#funcionalidades')}>Como Funciona</a>
            <a href="/#quem-somos" onClick={(e) => handleScroll(e, '#quem-somos')}>Quem Somos</a>
          </div>

          {/* Coluna 3: Suporte */}
          <div className="footer-links-group">
            <h4 className="footer-links-title">Precisa de Ajuda?</h4>
            
            <a href={gmailUrlSuporte} target="_blank" rel="noopener noreferrer">
              Tirar uma dúvida
            </a>

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
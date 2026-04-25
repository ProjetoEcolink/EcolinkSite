import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Navbar.css';

// ==========================================
// COMPONENTES DE ÍCONES (Nativos do React/SVG)
// ==========================================
function ThemeIcon({ theme }) {
    if (theme === 'light') {
        return (
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20.354 15.354A9 9 0 1 1 8.646 3.646a7 7 0 0 0 11.708 11.708Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    return (
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 12h10M17 8l3 4-3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Novos Ícones do Tutorial
const WelcomeIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
);

const StoreIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
        <path d="M12 3v6"/>
    </svg>
);

const PackageIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
);

const SettingsIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);
// ==========================================

export default function Navbar() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    });
    const [nome, setNome] = useState('');
    
    // --- ESTADOS DO NOVO TOUR ---
    const [mostrarTutorial, setMostrarTutorial] = useState(false);
    const [passoTutorial, setPassoTutorial] = useState(0);
    const [posicaoBalao, setPosicaoBalao] = useState({ top: 0, left: 0, setaPosition: 'center' });
    const [holofote, setHolofote] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Passos do Tutorial AGORA COM ÍCONES REACT!
    const passos = [
        {
            alvo: null,
            icone: <WelcomeIcon />, // Componente React no lugar do Emoji!
            titulo: 'Bem-vindo ao EcoLink!',
            texto: 'Preparamos um tour rápido para te mostrar como usar a plataforma. Vamos lá?'
        },
        {
            alvo: 'tour-marketplace',
            icone: <StoreIcon />,
            titulo: 'Vitrine de Lotes',
            texto: 'Aqui no Marketplace você encontra todos os lotes disponíveis e pode filtrar por categorias.'
        },
        {
            alvo: 'tour-painel',
            icone: <PackageIcon />,
            titulo: 'Área de Anúncios',
            texto: 'Se você é um Gerador, é aqui que você cadastra seus equipamentos e publica para os Recicladores.'
        },
        {
            alvo: 'tour-perfil-tema',
            icone: <SettingsIcon />,
            titulo: 'Perfil e Configurações',
            texto: 'Edite suas informações clicando no seu nome, e use a Lua/Sol para alternar o tema do site!'
        }
    ];

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            const user = JSON.parse(userStr);
            setNome(user.nome ? user.nome.split(' ')[0] : 'Usuario');
            
            const tutorialVisto = localStorage.getItem('ecoLink_tutorial_v2');
            if (!tutorialVisto) {
                setMostrarTutorial(true);
            }
        } else {
            setNome('');
        }
    }, [location]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (mostrarTutorial && passos[passoTutorial].alvo) {
            const elementoAlvo = document.getElementById(passos[passoTutorial].alvo);
            
            if (elementoAlvo) {
                const rect = elementoAlvo.getBoundingClientRect();
                
                setHolofote({
                    top: rect.top - 6,
                    left: rect.left - 6,
                    width: rect.width + 12,
                    height: rect.height + 12
                });

                let leftPos = rect.left + (rect.width / 2) - 150;
                let seta = 'center';

                if (leftPos < 20) { leftPos = 20; seta = 'left'; }
                if (leftPos + 300 > window.innerWidth) { leftPos = window.innerWidth - 320; seta = 'right'; }

                setPosicaoBalao({
                    top: rect.bottom + 15,
                    left: leftPos,
                    setaPosition: seta
                });
            }
        } else {
            setHolofote(null);
        }
    }, [mostrarTutorial, passoTutorial]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const handleLogout = async () => {
        const confirmou = window.confirm('Tem certeza que deseja sair da conta?');
        if (!confirmou) return;
        await supabase.auth.signOut();
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const goToSection = (section) => {
        if (location.pathname !== '/home') {
            navigate('/home');
            setTimeout(() => {
                const element = document.getElementById(section);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        } else {
            const element = document.getElementById(section);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const isActive = (path) => location.pathname === path;
    const isLogado = !!nome;

    const avancarTutorial = () => {
        if (passoTutorial < passos.length - 1) {
            setPassoTutorial(passoTutorial + 1);
        } else {
            finalizarTutorial();
        }
    };

    const finalizarTutorial = () => {
        localStorage.setItem('ecoLink_tutorial_v2', 'true');
        setMostrarTutorial(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo" onClick={() => goToSection('home')} style={{ cursor: 'pointer' }}>
                        Eco<span className="text-eco">Link</span>
                    </div>

                    <div className="nav-menu">
                        <div className="nav-links">
                            <button onClick={() => goToSection('home')} className="nav-link-btn">Home</button>
                            <button onClick={() => goToSection('o-problema')} className="nav-link-btn">O Problema</button>
                            <button onClick={() => goToSection('funcionalidades')} className="nav-link-btn">Funcionalidades</button>
                            <button onClick={() => goToSection('quem-somos')} className="nav-link-btn">Quem Somos</button>

                            {isLogado && (
                                <>
                                    <span className="nav-divider" />
                                    <Link id="tour-marketplace" to="/marketplace" className={`nav-link-btn ${isActive('/marketplace') ? 'nav-link-active' : ''}`}>
                                        Marketplace
                                    </Link>
                                    <Link id="tour-painel" to="/painel" className={`nav-link-btn ${isActive('/painel') ? 'nav-link-active' : ''}`}>
                                        Anunciar Lote
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="nav-actions" id="tour-perfil-tema">
                        {isLogado ? (
                            <Link to="/profile" className="nav-user-link">
                                Olá, <span>{nome}</span>
                            </Link>
                        ) : (
                            <div className="nav-auth-group">
                                <Link to="/login" className="nav-link-login">Entrar</Link>
                                <Link to="/register" className="nav-cta">Criar Conta</Link>
                            </div>
                        )}

                        <div className="nav-utility-group">
                            <button onClick={toggleTheme} className="theme-toggle-nav" title="Alternar tema" aria-label="Alternar tema">
                                <ThemeIcon theme={theme} />
                            </button>

                            {isLogado && (
                                <button onClick={handleLogout} className="theme-toggle-nav" title="Sair da conta" aria-label="Sair da conta">
                                    <LogoutIcon />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- ESTRUTURA DO TOUR --- */}
            {mostrarTutorial && (
                <div className={`tour-backdrop ${passos[passoTutorial].alvo ? 'tour-backdrop-transparente' : ''}`}>
                    
                    {holofote && (
                        <div className="tour-holofote-box" style={{
                            top: holofote.top,
                            left: holofote.left,
                            width: holofote.width,
                            height: holofote.height
                        }}></div>
                    )}

                    <div 
                        className={`tour-balao ${!passos[passoTutorial].alvo ? 'tour-central' : ''}`}
                        style={passos[passoTutorial].alvo ? { top: posicaoBalao.top, left: posicaoBalao.left } : {}}
                    >
                        {passos[passoTutorial].alvo && (
                            <div className={`tour-seta seta-${posicaoBalao.setaPosition}`}></div>
                        )}

                        <div className="tour-content">
                            {/* O Ícone injetado dinamicamente ganha a cor principal do texto! */}
                            <div className="tour-icon" style={{ color: 'var(--brand-main, #10b981)' }}>
                                {passos[passoTutorial].icone}
                            </div>
                            <div>
                                <h4 className="tour-title">{passos[passoTutorial].titulo}</h4>
                                <p className="tour-text">{passos[passoTutorial].texto}</p>
                            </div>
                        </div>

                        <div className="tour-footer">
                            <span className="tour-contador">{passoTutorial + 1} de {passos.length}</span>
                            <div className="tour-botoes">
                                <button className="tour-btn-pular" onClick={finalizarTutorial}>Pular</button>
                                <button className="tour-btn-proximo" onClick={avancarTutorial}>
                                    {passoTutorial === passos.length - 1 ? 'Entendi!' : 'Próximo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
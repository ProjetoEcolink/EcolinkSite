import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Seções Home
import HeroSection from './sections/HeroSection/HeroSection';
import ProblemSection from './sections/ProblemSection/ProblemSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import AboutSection from './sections/AboutSection/AboutSection';

// Páginas
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Marketplace from './pages/Marketplace/Marketplace';
import Painel from './pages/Painel/Painel';
import Cadastro from './pages/Cadastro/Cadastro';

// NOVAS PÁGINAS (Recuperação de Senha)
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword/UpdatePassword';

// Landing Page Component
const LandingPage = () => (
    <>
        <section id="home"><HeroSection /></section>
        <section id="o-problema"><ProblemSection /></section>
        <section id="funcionalidades"><FeaturesSection /></section>
        <section id="quem-somos"><AboutSection /></section>
    </>
);

// Rota protegida — redireciona pro login se não houver sessão ativa
const ProtectedRoute = ({ session, children }) => {
    if (session === null) return null; // Aguardando carregar sessão do Supabase
    if (!session) return <Navigate to="/login" replace />;
    return children;
};

// Gerenciador de Layout (Navbar e Footer aparecem apenas em rotas específicas)
const LayoutHandler = ({ children }) => {
    const location = useLocation();
    
    // Rotas de autenticação que NÃO devem exibir Navbar e Footer
    const hideLayout = [
        '/login', 
        '/register', 
        '/forgot-password', 
        '/update-password'
    ].includes(location.pathname);

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!hideLayout && <Navbar />}
            <main style={{ flex: '1 0 auto' }}>
                {children}
            </main>
            {!hideLayout && <Footer />}
        </div>
    );
};

function App() {
    const [session, setSession] = useState(null);

    useEffect(() => {
        // Busca sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session || false);
        });

        // Escuta mudanças no estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session || false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <BrowserRouter>
            <LayoutHandler>
                <Routes>
                    {/* --- Rotas Públicas (Com Navbar) --- */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<LandingPage />} />
                    <Route path="/marketplace" element={<Marketplace />} />

                    {/* --- Rotas de Autenticação (Sem Navbar) --- */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />

                    {/* --- Rotas Protegidas (Com Navbar) --- */}
                    <Route 
                        path="/painel" 
                        element={<ProtectedRoute session={session}><Painel /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/cadastro" 
                        element={<ProtectedRoute session={session}><Cadastro /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/profile" 
                        element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} 
                    />

                    {/* --- Erro 404 --- */}
                    <Route path="*" element={
                        <div style={{ textAlign: 'center', padding: '100px', color: 'white' }}>
                            <h1>404</h1>
                            <p>Página não encontrada</p>
                        </div>
                    } />
                </Routes>
            </LayoutHandler>
        </BrowserRouter>
    );
}

export default App;
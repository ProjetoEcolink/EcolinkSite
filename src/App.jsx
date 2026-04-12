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

// Landing Page
const LandingPage = () => (
  <>
    <section id="home"><HeroSection /></section>
    <section id="o-problema"><ProblemSection /></section>
    <section id="funcionalidades"><FeaturesSection /></section>
    <section id="quem-somos"><AboutSection /></section>
  </>
);

// Rota protegida — redireciona pro login se não logado
const ProtectedRoute = ({ session, children }) => {
    if (session === null) return null; // ainda carregando
    if (!session) return <Navigate to="/login" replace />;
    return children;
};

const LayoutHandler = ({ children }) => {
    const location = useLocation();
    const hideLayout = ['/', '/login', '/register'].includes(location.pathname);

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
    const [session, setSession] = useState(null); // null = carregando, false = sem sessão

    useEffect(() => {
        // Pega sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session || false);
        });

        // Escuta mudanças de sessão (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session || false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <BrowserRouter>
            <LayoutHandler>
                <Routes>
                    {/* Raiz — se logado vai pra /home, se não vai pro /login */}
                    <Route path="/" element={
                        session === null ? null :
                        session ? <Navigate to="/home" replace /> :
                        <Navigate to="/login" replace />
                    } />

                    {/* Auth — sem navbar */}
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* App — com navbar, público */}
                    <Route path="/home"        element={<LandingPage />} />
                    <Route path="/marketplace" element={<Marketplace />} />

                    {/* App — com navbar, protegido */}
                    <Route path="/painel"   element={<ProtectedRoute session={session}><Painel /></ProtectedRoute>} />
                    <Route path="/cadastro" element={<ProtectedRoute session={session}><Cadastro /></ProtectedRoute>} />
                    <Route path="/profile"  element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} />

                    {/* 404 */}
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
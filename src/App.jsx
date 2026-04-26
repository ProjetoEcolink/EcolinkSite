import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

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
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Profile from './pages/Profile/Profile';
import Marketplace from './pages/Marketplace/Marketplace';
import Dashboard from './pages/Dashboard/Dashboard'; // CAMINHO CORRIGIDO AQUI
import MyProducts from './pages/MyProducts/MyProducts';

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
const ProtectedRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem('usuario');
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return children;
};

// Gerencia a exibição da Navbar/Footer
const LayoutHandler = ({ children }) => {
    const location = useLocation();
    const hideLayout = ['/login', '/register', '/esqueci-senha'].includes(location.pathname);

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
    return (
        <BrowserRouter>
            <LayoutHandler>
                <Routes>
                    {/* Raiz e Home */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<LandingPage />} />

                    {/* Auth */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/esqueci-senha" element={<ForgotPassword />} />

                    {/* Público */}
                    <Route path="/marketplace" element={<Marketplace />} />

                    {/* Protegido (Só acessa se logado) */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/meus-produtos" element={
                        <ProtectedRoute>
                            <MyProducts />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />

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
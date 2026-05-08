import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';

import HeroSection from './sections/HeroSection/HeroSection';
import ProblemSection from './sections/ProblemSection/ProblemSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import AboutSection from './sections/AboutSection/AboutSection';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Profile from './pages/Profile/Profile';
import Marketplace from './pages/Marketplace/Marketplace';
import Dashboard from './pages/Dashboard/Dashboard';
import MyProducts from './pages/MyProducts/MyProducts';

const LandingPage = () => (
    <>
        <section id="home"><HeroSection /></section>
        <section id="o-problema"><ProblemSection /></section>
        <section id="funcionalidades"><FeaturesSection /></section>
        <section id="quem-somos"><AboutSection /></section>
    </>
);

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem('usuario');
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return children;
};

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
            <ScrollToTop />
            <LayoutHandler>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<LandingPage />} />

                    <Route path="/marketplace" element={
                        <ProtectedRoute>
                            <Marketplace />
                        </ProtectedRoute>
                    } />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/esqueci-senha" element={<ForgotPassword />} />

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

                    <Route path="*" element={
                        <div style={{ textAlign: 'center', padding: '100px', color: 'white' }}>
                            <h1>404</h1>
                            <p>Pagina nao encontrada</p>
                        </div>
                    } />
                </Routes>
            </LayoutHandler>
        </BrowserRouter>
    );
}

export default App;

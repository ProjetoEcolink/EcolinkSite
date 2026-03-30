import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HeroSection from './sections/HeroSection/HeroSection';
import ProblemSection from './sections/ProblemSection/ProblemSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import AboutSection from './sections/AboutSection/AboutSection';
import AuthSection from './sections/AuthSection/AuthSection';

// Página principal (landing page)
function LandingPage() {
  return (
    <div className="min-h-screen bg-eco-dark text-white font-sans selection:bg-green-400 selection:text-eco-dark">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}

// Página de auth isolada (sem navbar/footer da landing)
function AuthPage() {
  return (
    <div className="min-h-screen bg-eco-dark text-white font-sans">
      <AuthSection />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
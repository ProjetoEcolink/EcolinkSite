import React from 'react';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HeroSection from './sections/HeroSection/HeroSection';
import ProblemSection from './sections/ProblemSection/ProblemSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import AboutSection from './sections/AboutSection/AboutSection';

function App() {
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

export default App;
import React from 'react';
import HeroSection from '../sections/HeroSection/HeroSection';
import ProblemSection from '../sections/ProblemSection/ProblemSection';
import FeaturesSection from '../sections/FeaturesSection/FeaturesSection';
import AboutSection from '../sections/AboutSection/AboutSection';

export default function Home() {
    return (
        <>
            <HeroSection />
            <ProblemSection />
            <FeaturesSection />
            <AboutSection />
        </>
    );
}

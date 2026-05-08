import React from 'react';
import './HeroSection.css';

export default function HeroSection() {
    return (
        <section id="home" className="hero-section">
            <div className="hero-floating-elements">
                <div className="tech-shape chip-shape node-a"></div>
                <div className="tech-shape molecule-shape node-b"></div>
                <div className="tech-shape phone-shape node-c"></div>
                <div className="tech-shape laptop-shape node-d"></div>
                <div className="tech-shape structure-shape node-e"></div>
                <div className="tech-shape motherboard-shape node-f"></div>
                <div className="tech-shape battery-shape node-g"></div>
                <div className="tech-shape screen-shape node-h"></div>
                <div className="tech-shape chip-shape node-i"></div>
                <div className="tech-shape molecule-shape node-j"></div>
            </div>

            <div className="hero-glow"></div>

            <div className="hero-content">
                <div className="hero-pill">
                    <span className="pill-dot"></span>
                    Plataforma B2B de Logística Reversa
                </div>

                <h1 className="hero-title">
                    Bem-vindo! <br />
                    Monetize seus ativos de TI com{' '}
                    <span className="text-eco">
                        segurança auditável.
                    </span>
                </h1>

                <p className="hero-subtitle">
                    Transforme hardware obsoleto em receita e garanta o compliance ESG da sua empresa de ponta a ponta.
                </p>
            
                <div className="hero-trust">
                    <span>✓ Emissão de MTR</span>
                    <span className="trust-dot">•</span>
                    <span>✓ Avaliação por IA</span>
                    <span className="trust-dot">•</span>
                    <span>✓ Transações via Escrow</span>
                </div>
            </div>
        </section>
    );
}

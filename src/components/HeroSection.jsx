import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">MyGateway</h1>
        <p className="hero-subtitle">YOUR GATEWAY TO GOVERNMENT SERVICES</p>
        <div className="hero-divider"></div>
        
        <h2 className="hero-heading">One platform. Seamless access. <br/> Better public services.</h2>
        <p className="hero-description">
          MyGateway connects you to government services<br/>
          quickly, securely and conveniently.
        </p>
        
        <div className="hero-buttons">
          <button className="btn-primary">
            <ArrowRight size={18} className="btn-icon" /> Get Started
          </button>
          <button className="btn-secondary">
            <Info size={18} className="btn-icon info-icon" /> Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

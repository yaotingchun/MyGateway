import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import './App.css';
import bgImage from './assets/kolaxus_background3.jpg';

function App() {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentPage, setCurrentPage] = useState('home');   // 'home' | 'services'
  const [servicesCategory, setServicesCategory] = useState('All');

  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentPage('home');
  };

  const navigateTo = (page, opts = {}) => {
    setCurrentPage(page);
    if (opts.category) setServicesCategory(opts.category);
  };

  if (isLoggedIn) {
    if (currentPage === 'services') {
      return (
        <ServicesPage
          key={servicesCategory}
          initialCategory={servicesCategory}
          onNavigate={navigateTo}
          username={currentUser}
          onLogout={handleLogout}
        />
      );
    }
    return (
      <HomePage
        username={currentUser}
        onLogout={handleLogout}
        onNavigate={navigateTo}
      />
    );
  }

  return (
    <div className="app-container" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* Left-side white gradient overlay */}
      <div className="app-overlay"></div>

      {/* Hero content row */}
      <div className="main-content">
        <HeroSection />
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import AIAssistantPage from './components/AIAssistantPage';
import './App.css';
import bgImage from './assets/kolaxus_background3.webp';

function App() {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'ai' | 'applications' | 'profile'
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  const handleLogin = (username) => {
    setCurrentUser(username || 'Jason');
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentPage('home');
    setAiInitialQuery('');
  };

  const handleNavigate = (pageId, query = '') => {
    if (pageId === 'ai') {
      setAiInitialQuery(query || '');
      setCurrentPage('ai');
    } else {
      setCurrentPage(pageId);
    }
  };

  const handleAskAi = (query) => {
    setAiInitialQuery(query || '');
    setCurrentPage('ai');
  };

  if (isLoggedIn) {
    if (currentPage === 'ai') {
      return (
        <AIAssistantPage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          initialQuery={aiInitialQuery}
        />
      );
    }

    if (currentPage === 'applications') {
      return (
        <ServicesPage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    }

    return (
      <HomePage
        username={currentUser || 'Jason'}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onAskAi={handleAskAi}
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

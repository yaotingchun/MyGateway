import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import AIAssistantPage from './components/AIAssistantPage';
import ProfilePage from './components/ProfilePage';
import OnboardingWizard from './components/OnboardingWizard';
import { isFirstTimeUser } from './utils/profileStore';
import './App.css';
import bgImage from './assets/kolaxus_background3.webp';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'ai' | 'applications' | 'profile'
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  const handleLogin = async (username) => {
    const user = username || 'Jason';
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsCheckingUser(true);
    const firstTime = await isFirstTimeUser(user);
    if (firstTime) {
      setShowOnboarding(true);
    } else {
      setCurrentPage('home');
    }
    setIsCheckingUser(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentPage('home');
    setAiInitialQuery('');
    setShowOnboarding(false);
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
    if (isCheckingUser) {
      return (
        <div className="app-container" style={{ backgroundColor: '#EFF5FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#304166', fontWeight: 600 }}>Loading profile...</div>
        </div>
      );
    }

    let pageContent;
    if (currentPage === 'ai') {
      pageContent = (
        <AIAssistantPage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          initialQuery={aiInitialQuery}
        />
      );
    } else if (currentPage === 'profile') {
      pageContent = (
        <ProfilePage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    } else {
      pageContent = (
        <HomePage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onAskAi={handleAskAi}
        />
      );
    }

    return (
      <>
        {pageContent}
        {showOnboarding && (
          <OnboardingWizard 
            username={currentUser || 'Jason'} 
            onComplete={() => {
              setShowOnboarding(false);
              setCurrentPage('home');
            }} 
          />
        )}
      </>
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

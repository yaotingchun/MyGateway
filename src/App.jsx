import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import LoginModal from './components/LoginModal';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import CalendarPage from './components/CalendarPage';
import ApplicationsPage from './components/ApplicationsPage';
import AIAssistantPage from './components/AIAssistantPage';
import ProfilePage from './components/ProfilePage';
import OnboardingWizard from './components/OnboardingWizard';
import { isFirstTimeUser } from './utils/profileStore';
import './App.css';
import bgImage from './assets/kolaxus_background3.webp';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'ai' | 'applications' | 'services' | 'profile'
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [lang, setLang] = useState('EN');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogin = async (username) => {
    const user = username || 'Jason';
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentPage('home');
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
          lang={lang}
          onLangChange={setLang}
        />
      );
    } else if (currentPage === 'applications') {
      pageContent = (
        <ApplicationsPage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          lang={lang}
          onLangChange={setLang}
        />
      );
    } else if (currentPage === 'services') {
      pageContent = (
        <ServicesPage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          lang={lang}
          onLangChange={setLang}
        />
      );
    } else if (currentPage === 'calendar') {
      pageContent = (
        <CalendarPage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          lang={lang}
          onLangChange={setLang}
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
          lang={lang}
          onLangChange={setLang}
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
        <HeroSection onLoginClick={() => setIsLoginModalOpen(true)} />
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
}

export default App;

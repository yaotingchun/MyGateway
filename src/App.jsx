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

  // Global shortcut (Ctrl + Enter / Cmd + Enter) to demo First-Time User Onboarding
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isLoggedIn) {
          e.preventDefault();
          setIsLoginModalOpen(false);
          handleLogin('Ahmad', { isFirstTime: true });
        } else if (currentPage !== 'applications') {
          e.preventDefault();
          setShowOnboarding(true);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        setShowOnboarding((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn, currentPage]);

  const handleLogin = async (username, options = {}) => {
    const user = username || 'Jason';
    setCurrentUser(user);
    setIsLoggedIn(true);

    if (options.isFirstTime || user === 'Ahmad' || user === 'NewUser') {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
    setCurrentPage('home');
  };

  const [navParams, setNavParams] = useState(null);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentPage('home');
    setAiInitialQuery('');
    setNavParams(null);
    setShowOnboarding(false);
  };

  const handleNavigate = (pageId, query = '', params = null) => {
    if (pageId === 'ai') {
      setAiInitialQuery(query || '');
      setNavParams(null);
      setCurrentPage('ai');
    } else {
      setNavParams(params);
      setCurrentPage(pageId);
    }
  };

  const handleAskAi = (query) => {
    setAiInitialQuery(query || '');
    setNavParams(null);
    setCurrentPage('ai');
  };

  const handleTriggerOnboarding = () => {
    setShowOnboarding(true);
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
          onTriggerOnboarding={handleTriggerOnboarding}
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
          onTriggerOnboarding={handleTriggerOnboarding}
          initialAppId={navParams?.appId}
          initialServiceId={navParams?.serviceId}
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
          onTriggerOnboarding={handleTriggerOnboarding}
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
          onTriggerOnboarding={handleTriggerOnboarding}
        />
      );
    } else if (currentPage === 'profile') {
      pageContent = (
        <ProfilePage
          username={currentUser || 'Jason'}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          lang={lang}
          onLangChange={setLang}
          onTriggerOnboarding={handleTriggerOnboarding}
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
          onTriggerOnboarding={handleTriggerOnboarding}
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
        <HeroSection 
          onLoginClick={() => setIsLoginModalOpen(true)} 
        />
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

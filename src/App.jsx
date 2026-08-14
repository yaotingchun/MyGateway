import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import './App.css';
import bgImage from './assets/kolaxus_background3.jpg';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
  };

  if (isLoggedIn) {
    return <HomePage username={currentUser} onLogout={handleLogout} />;
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

import React, { useState } from 'react';
import { Bell, ChevronDown, Globe, LogOut, User } from 'lucide-react';
import './Navbar.css';
import logo from '../assets/logo.png';

const LANGS = [
  { code: 'EN', label: 'English' },
  { code: 'MY', label: 'Bahasa Melayu' },
];

const NAV_LINKS = [
  { id: 'home', label: 'Home', labelMY: 'Utama' },
  { id: 'ai', label: 'AI Assistant', labelMY: 'Pembantu AI' },
  { id: 'applications', label: 'Applications', labelMY: 'Permohonan' },
  { id: 'services', label: 'Services', labelMY: 'Perkhidmatan' },
  { id: 'calendar', label: 'Calendar', labelMY: 'Kalendar' },
  { id: 'profile', label: 'Profile', labelMY: 'Profil' },
];

const Navbar = ({ username, onLogout, activePage = 'home', onNavigate, lang = 'EN', onLangChange }) => {
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount] = useState(2);

  const handleNavClick = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <nav className="nb-root">
      <div className="nb-inner">
        {/* Logo */}
        <a
          href="#"
          className="nb-logo"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
        >
          <img src={logo} alt="MyGateway" className="nb-logo-img" />
        </a>

        {/* Nav links */}
        <ul className="nb-links">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <button
                id={`nav-${link.id}`}
                className={`nb-link ${activePage === link.id ? 'nb-link-active' : ''}`}
                onClick={() => handleNavClick(link.id)}
              >
                {lang === 'MY' && link.labelMY ? link.labelMY : link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="nb-right">
          {/* Language */}
          <div className="nb-lang-wrap">
            <button
              id="lang-toggle"
              className="nb-lang-btn"
              onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }}
            >
              <Globe size={16} />
              <span>{lang}</span>
              <ChevronDown size={14} className={langOpen ? 'nb-chevron-open' : ''} />
            </button>
            {langOpen && (
              <div className="nb-dropdown">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    className={`nb-dropdown-item ${lang === l.code ? 'nb-dropdown-active' : ''}`}
                  onClick={() => { if (onLangChange) onLangChange(l.code); setLangOpen(false); }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button id="notif-btn" className="nb-icon-btn nb-notif-btn">
            <Bell size={20} />
            {notifCount > 0 && <span className="nb-notif-badge">{notifCount}</span>}
          </button>

          {/* Profile */}
          <div className="nb-profile-wrap">
            <button
              id="profile-toggle"
              className="nb-profile-btn"
              onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}
            >
              <div className="nb-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="nb-username">{username.charAt(0).toUpperCase() + username.slice(1)}</span>
              <ChevronDown size={14} className={profileOpen ? 'nb-chevron-open' : ''} />
            </button>
            {profileOpen && (
              <div className="nb-dropdown nb-dropdown-right">
                <div className="nb-dropdown-user">
                  <div className="nb-avatar nb-avatar-lg">{username.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="nb-dropdown-name">{username.charAt(0).toUpperCase() + username.slice(1)}</p>
                    <p className="nb-dropdown-email">MyGateway User</p>
                  </div>
                </div>
                <hr className="nb-dropdown-divider" />
                <button 
                  className="nb-dropdown-item"
                  onClick={() => {
                    handleNavClick('profile');
                    setProfileOpen(false);
                  }}
                >
                  <User size={15} /> My Profile
                </button>
                <hr className="nb-dropdown-divider" />
                <button className="nb-dropdown-item nb-logout" onClick={onLogout}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

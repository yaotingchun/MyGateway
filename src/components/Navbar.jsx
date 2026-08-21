import React, { useState } from 'react';
import { Bell, ChevronDown, Globe, LogOut, User, Sparkles } from 'lucide-react';
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

const NAVBAR_NOTIFICATIONS = [
  {
    id: 'notif-action-signboard',
    type: 'action',
    label: 'Action Required',
    title: 'Premise License: Updated Signboard Artwork Required',
    desc: 'DBKL Licensing Officer requested an updated version of your Business Signboard Artwork with official DBP certification seal.',
    time: '10m ago',
    appId: 'APP-2026-FNB-8921',
    serviceId: 'step-pbt',
    actionText: 'Upload Document →',
    isAction: true,
  },
  {
    id: 'notif-ssm-done',
    type: 'completed',
    label: 'Completed',
    title: 'SSM Business Registration Approved',
    desc: 'Your EzBiz Business Registration (Borang D) has been officially issued.',
    time: '2h ago',
    appId: 'APP-2026-FNB-8921',
    serviceId: 'step-ssm',
    isAction: false,
  },
  {
    id: 'notif-license-renew',
    type: 'upcoming',
    label: 'Upcoming',
    title: 'Driving licence renewal reminder',
    desc: 'Renew your driving licence before 27 Aug 2026 to avoid penalties.',
    time: '1 day ago',
    isAction: false,
  },
];

const Navbar = ({ username, onLogout, activePage = 'home', onNavigate, lang = 'EN', onLangChange, onTriggerOnboarding }) => {
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount] = useState(1);

  const handleNavClick = (pageId, query = '', params = null) => {
    if (onNavigate) {
      onNavigate(pageId, query, params);
    }
  };

  const handleNotifClick = (notif) => {
    setNotifOpen(false);
    if (notif.appId && onNavigate) {
      onNavigate('applications', '', { appId: notif.appId, serviceId: notif.serviceId });
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
              onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); setNotifOpen(false); }}
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
          <div className="nb-notif-wrap">
            <button
              id="notif-btn"
              className={`nb-icon-btn nb-notif-btn ${notifOpen ? 'nb-btn-active' : ''}`}
              onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); setProfileOpen(false); }}
              title="Notifications"
            >
              <Bell size={20} />
              {notifCount > 0 && <span className="nb-notif-badge">{notifCount}</span>}
            </button>

            {notifOpen && (
              <div className="nb-notif-dropdown">
                <div className="nb-notif-header">
                  <div className="nb-notif-header-title">
                    <Bell size={16} />
                    <span>Notifications</span>
                  </div>
                  <span className="nb-notif-action-tag">1 Action Required</span>
                </div>

                <div className="nb-notif-items-list">
                  {NAVBAR_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`nb-notif-item nb-notif-item-${n.type} ${n.isAction ? 'nb-notif-highlight' : ''}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className="nb-notif-item-top">
                        <span className={`nb-notif-pill nb-notif-pill-${n.type}`}>
                          {n.type === 'action' && <span className="nb-pulsing-dot" />}
                          {n.label}
                        </span>
                        <span className="nb-notif-time">{n.time}</span>
                      </div>
                      <h4 className="nb-notif-item-title">{n.title}</h4>
                      <p className="nb-notif-item-desc">{n.desc}</p>
                      {n.actionText && (
                        <button
                          type="button"
                          className="nb-notif-cta-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotifClick(n);
                          }}
                        >
                          {n.actionText}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="nb-notif-footer">
                  <button
                    type="button"
                    className="nb-notif-view-all"
                    onClick={() => {
                      setNotifOpen(false);
                      handleNavClick('applications');
                    }}
                  >
                    View All Applications & History →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="nb-profile-wrap">
            <button
              id="profile-toggle"
              className="nb-profile-btn"
              onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); setNotifOpen(false); }}
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
                    <p className="nb-dropdown-email">MyGateway Citizen</p>
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

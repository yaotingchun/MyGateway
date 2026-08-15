import React, { useState } from 'react';
import { Landmark, FileText, Building2, ClipboardCheck, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import robotImg from '../assets/robot.png';
import './HomePage.css';


// ── Data ────────────────────────────────────────────────────────────────────

const AI_PROMPTS = [
  'I want to renew my licence',
  'How do I apply for housing assistance?',
  'I just had a baby. What government services can I apply for?',
];

const CATEGORIES = [
  { icon: '🚗', label: 'Transport', color: '#e8f0fe', accent: '#1a56db' },
  { icon: '🏠', label: 'Housing', color: '#e8f5e9', accent: '#2e7d32' },
  { icon: '🎓', label: 'Education', color: '#fff8e1', accent: '#f59e0b' },
  { icon: '💼', label: 'Employment', color: '#f3e8ff', accent: '#7c3aed' },
  { icon: '👨‍👩‍👧', label: 'Family', color: '#ffe4f0', accent: '#db2777' },
  { icon: '💰', label: 'Financial Assistance', color: '#e8fdf5', accent: '#059669' },
  { icon: '🏥', label: 'Healthcare', color: '#ffebee', accent: '#c53030' },
  { icon: '🏢', label: 'Business', color: '#e0f7fa', accent: '#006064' },
  { icon: '⚡', label: 'Utilities', color: '#fffde7', accent: '#ca8a04' },
];

const APPLICATIONS = [
  { 
    id: 1, 
    name: 'Home-based Food Business Registration', 
    agency: 'SSM', 
    status: 'processing', 
    detail: 'Step 2 of 4',
    progress: { current: 2, total: 4 }
  },
  { 
    id: 2, 
    name: 'Tax Registration (Sole Proprietor)', 
    agency: 'LHDN', 
    status: 'completed', 
    detail: 'Completed on 12 May 2024' 
  },
  { 
    id: 3, 
    name: 'Business License Application', 
    agency: 'MBJB', 
    status: 'action', 
    detail: 'Provide additional document' 
  },
  { 
    id: 4, 
    name: 'Food Handler Certificate', 
    agency: 'Ministry of Health (MOH)', 
    status: 'not-started', 
    detail: 'Not started yet' 
  },
];

const RECOMMENDATIONS = [
  { icon: '🎓', text: "You're eligible to apply for Education Assistance", tag: 'New' },
  { icon: '🚗', text: 'Your driving licence expires in 14 days', tag: 'Urgent' },
  { icon: '🏠', text: 'You may be eligible for Housing Assistance', tag: 'Recommended' },
  { icon: '💼', text: 'You have an upcoming tax-related requirement', tag: 'Reminder' },
];

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'action',
    icon: '🔴',
    label: 'Action Required',
    title: 'Housing application needs a document',
    desc: 'Your housing application requires an additional supporting document to proceed.',
    time: '2h ago',
  },
  {
    id: 2,
    type: 'upcoming',
    icon: '🟡',
    label: 'Upcoming',
    title: 'Driving licence expires in 14 days',
    desc: 'Renew your driving licence before 27 Aug 2026 to avoid penalties.',
    time: '1 day ago',
  },
  {
    id: 3,
    type: 'completed',
    icon: '🟢',
    label: 'Completed',
    title: 'Passport renewal approved',
    desc: 'Your passport renewal has been approved. Collect at Immigration office.',
    time: '3 days ago',
  },
];

// ── Status helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    processing: { label: 'In Progress', cls: 'badge-processing' },
    completed: { label: 'Completed', cls: 'badge-completed' },
    action: { label: 'Action Required', cls: 'badge-action' },
    'not-started': { label: 'Not Started', cls: 'badge-not-started' },
  };
  const { label, cls } = map[status] || {};
  return <span className={`hp-status-pill ${cls}`}>{label}</span>;
}

// ── Main Component ───────────────────────────────────────────────────────────

const HomePage = ({ username, onLogout, onNavigate, onAskAi }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handlePromptClick = (p) => {
    setQuery(p);
    if (onAskAi) {
      onAskAi(p);
    } else if (onNavigate) {
      onNavigate('ai', p);
    }
  };

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (onAskAi) {
      onAskAi(query);
    } else if (onNavigate) {
      onNavigate('ai', query);
    }
  };

  return (
    <div className="hp-root">
      <Navbar
        username={username}
        onLogout={onLogout}
        activePage="home"
        onNavigate={onNavigate}
      />

      <main className="hp-main">

        {/* ── Welcome ── */}
        <section className="hp-welcome">
          <div>
            <h1 className="hp-welcome-title">
              {greeting}, <span className="hp-name">{username.charAt(0).toUpperCase() + username.slice(1)}</span> 👋
            </h1>
            <p className="hp-welcome-sub">How can I help you today?</p>
          </div>
        </section>

        {/* ── AI Hero ── */}
        <section className="hp-ai-hero">
          <div className="hp-ai-card">
            <div className="hp-ai-text">
              <p className="hp-ai-eyebrow">✨ AI-Powered Assistant</p>
              <h2 className="hp-ai-heading">What do you need help with?</h2>
              <p className="hp-ai-sub">Tell us what you need, and we'll guide you through the government process.</p>

              <form className="hp-ai-search-wrap" onSubmit={handleAskSubmit}>
                <span className="hp-search-icon">🔍</span>
                <input
                  id="ai-search-input"
                  className="hp-ai-search"
                  type="text"
                  placeholder="Ask anything about government services..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" id="ai-search-btn" className="hp-ai-search-btn">Ask AI</button>
              </form>

              <div className="hp-ai-examples">
                <span className="hp-examples-label">Try:</span>
                {AI_PROMPTS.map((p) => (
                  <button
                    key={p}
                    className="hp-example-chip"
                    onClick={() => handlePromptClick(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="hp-ai-robot" onClick={() => onNavigate && onNavigate('ai')} style={{ cursor: 'pointer' }} title="Open AI Assistant">
              <img src={robotImg} className="hp-robot-img" alt="AI Assistant Robot" />
              <div className="hp-robot-glow"></div>
            </div>
          </div>
        </section>

        {/* ── Two-col: Categories + Notifications ── */}
        <div className="hp-two-col">

          {/* Popular Services */}
          <section className="hp-section hp-services">
            <div className="hp-section-header">
              <h2 className="hp-section-title">Popular Services</h2>
              <a href="#" className="hp-view-all">View all services →</a>
            </div>
            <div className="hp-categories-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  className="hp-cat-card"
                  style={{ '--cat-bg': cat.color, '--cat-accent': cat.accent }}
                >
                  <span className="hp-cat-icon">{cat.icon}</span>
                  <span className="hp-cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="hp-section hp-notifs">
            <div className="hp-section-header">
              <h2 className="hp-section-title">Important Actions</h2>
              <a href="#" className="hp-view-all">View all →</a>
            </div>
            <div className="hp-notif-list">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className={`hp-notif-card hp-notif-${n.type}`}>
                  <div className="hp-notif-dot">
                    <span>{n.icon}</span>
                  </div>
                  <div className="hp-notif-body">
                    <span className={`hp-notif-label hp-notif-label-${n.type}`}>{n.label}</span>
                    <p className="hp-notif-title">{n.title}</p>
                    <p className="hp-notif-desc">{n.desc}</p>
                  </div>
                  <span className="hp-notif-time">{n.time}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── My Applications ── */}
        <section className="hp-section hp-applications">
          <div className="hp-section-header">
            <h2 className="hp-section-title">My Applications</h2>
            <div className="hp-tab-bar">
              {['all', 'processing', 'completed', 'action', 'not-started'].map((t) => {
                let tabLabel = '';
                if (t === 'all') tabLabel = 'All';
                else if (t === 'processing') tabLabel = 'In Progress';
                else if (t === 'completed') tabLabel = 'Completed';
                else if (t === 'action') tabLabel = 'Action Required';
                else if (t === 'not-started') tabLabel = 'Not Started';

                return (
                  <button
                    key={t}
                    className={`hp-tab ${activeTab === t ? 'hp-tab-active' : ''}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {tabLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hp-app-list">
            {APPLICATIONS.filter((a) => activeTab === 'all' || a.status === activeTab).map((app) => {
              let IconComponent = Landmark;
              let iconClass = 'hp-app-icon-blue';
              
              if (app.status === 'processing') {
                IconComponent = Landmark;
                iconClass = 'hp-app-icon-blue';
              } else if (app.status === 'completed') {
                IconComponent = FileText;
                iconClass = 'hp-app-icon-green';
              } else if (app.status === 'action') {
                IconComponent = Building2;
                iconClass = 'hp-app-icon-purple';
              } else if (app.status === 'not-started') {
                IconComponent = ClipboardCheck;
                iconClass = 'hp-app-icon-cyan';
              }

              return (
                <div key={app.id} className="hp-app-item">
                  {/* Left part: Icon & Info */}
                  <div className="hp-app-item-left">
                    <div className={`hp-app-icon-wrapper ${iconClass}`}>
                      <IconComponent className="hp-app-icon-svg" size={22} />
                    </div>
                    <div className="hp-app-info">
                      <h4 className="hp-app-title">{app.name}</h4>
                      <span className="hp-app-subtitle">{app.agency}</span>
                    </div>
                  </div>

                  {/* Right part: Status Pill, Progress/Detail, Chevron */}
                  <div className="hp-app-item-right">
                    <div className="hp-app-status-container">
                      <StatusBadge status={app.status} />
                    </div>
                    
                    <div className="hp-app-detail-container">
                      {app.status === 'processing' && app.progress ? (
                        <div className="hp-app-progress-wrapper">
                          <span className="hp-app-detail-text">{app.detail}</span>
                          <div className="hp-app-progress-bar-bg">
                            <div 
                              className="hp-app-progress-bar-fill" 
                              style={{ width: `${(app.progress.current / app.progress.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className={`hp-app-detail-text ${app.status === 'action' ? 'hp-app-detail-red' : ''}`}>
                          {app.detail}
                        </span>
                      )}
                    </div>
                    
                    <ChevronRight className="hp-app-chevron" size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Recommended for You ── */}
        <section className="hp-section hp-recommended">
          <div className="hp-section-header">
            <h2 className="hp-section-title">Recommended for You</h2>
            <p className="hp-section-sub">Based on your profile &amp; activity</p>
          </div>
          <div className="hp-reco-grid">
            {RECOMMENDATIONS.map((r, i) => (
              <div key={i} className="hp-reco-card">
                <div className="hp-reco-top">
                  <span className="hp-reco-icon">{r.icon}</span>
                  <span className={`hp-reco-tag hp-reco-tag-${r.tag.toLowerCase()}`}>{r.tag}</span>
                </div>
                <p className="hp-reco-text">{r.text}</p>
                <button className="hp-reco-btn">Learn More →</button>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="hp-footer">
        <p>© 2026 MyGateway — Your Gateway to Government Services</p>
        <div className="hp-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help &amp; Support</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

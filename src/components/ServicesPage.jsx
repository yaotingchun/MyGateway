import React, { useEffect, useState } from 'react';
import { ExternalLink, Search, X, Loader2, ArrowLeft, Phone, Mail, Globe, MessageSquare, BookOpen, Info } from 'lucide-react';
import { getServices } from '../services/serviceService';
import Navbar from './Navbar';
import './ServicesPage.css';

// ── Category config (matches HomePage) ────────────────────────────────────────
const CATEGORIES = [
  { label: 'All',                  icon: '🏛️' },
  { label: 'Transport',            icon: '🚗' },
  { label: 'Housing',              icon: '🏠' },
  { label: 'Education',            icon: '🎓' },
  { label: 'Employment',           icon: '💼' },
  { label: 'Family',               icon: '👨‍👩‍👧' },
  { label: 'Financial Assistance', icon: '💰' },
  { label: 'Healthcare',           icon: '🏥' },
  { label: 'Business',             icon: '🏢' },
  { label: 'Utilities',            icon: '⚡' },
  { label: 'General',              icon: '📋' },
];

const PAGE_SIZE = 12;

// ── Helper to render text with links ──────────────────────────────────────────
const renderTextWithLinks = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    // Check if it's our formatted "Text (URL)"
    const linkMatch = line.match(/^(.*?) \((https?:\/\/[^\)]+)\)$/);
    if (linkMatch) {
       return (
         <p key={i}>
           <a href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="sp-inline-link">
             {linkMatch[1]}
           </a>
         </p>
       );
    }
    
    // Fallback for raw URLs in text
    const rawUrlMatch = line.match(/(https?:\/\/[^\s]+)/g);
    if (rawUrlMatch) {
       let parts = line.split(/(https?:\/\/[^\s]+)/g);
       return (
         <p key={i}>
           {parts.map((part, j) => 
             part.match(/^https?:\/\//) 
               ? <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="sp-inline-link">{part}</a> 
               : part
           )}
         </p>
       );
    }
    
    return <p key={i}>{line}</p>;
  });
};

// ── Helper to parse contacts into buttons ─────────────────────────────────────
const parseContactButtons = (text) => {
  if (!text) return [];
  const contacts = [];
  const seenUrls = new Set();

  const addContact = (type, label, url) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      contacts.push({ type, label, url });
    }
  };

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i-1] : '';

    // 1. Explicit links e.g. "Click Here (https://...)"
    const explicitMatch = line.match(/^(.*?) \((https?:\/\/[^\)]+)\)$/);
    if (explicitMatch) {
      let label = explicitMatch[1].trim();
      if (label.toLowerCase() === 'click here' || label.toLowerCase() === 'click' || !label) {
        label = (prevLine && !prevLine.includes('http')) ? prevLine : 'Website';
      }
      
      let type = 'link';
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('feedback') || lowerLabel.includes('chat') || lowerLabel.includes('aduan')) {
        type = 'chat';
      }
      addContact(type, label, explicitMatch[2]);
      continue;
    }

    // 2. Raw URLs
    const rawUrlMatch = line.match(/(https?:\/\/[^\s]+)/);
    if (rawUrlMatch) {
      let label = (prevLine && !prevLine.includes('http')) ? prevLine : 'Website';
      let type = 'link';
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('feedback') || lowerLabel.includes('chat') || lowerLabel.includes('aduan')) {
        type = 'chat';
      }
      addContact(type, label, rawUrlMatch[1]);
      continue;
    }

    // 3. Emails
    const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      addContact('email', 'Email', `mailto:${emailMatch[1]}`);
      continue;
    }

    // 4. Phones
    const phoneMatch = line.match(/(?:0[3-9][- ]?\d{3,4}[- ]?\d{4}|01[0-9][- ]?\d{3,4}[- ]?\d{4}|1[- ]?300[- ]?\d{2}[- ]?\d{4})/);
    if (phoneMatch) {
      const num = phoneMatch[0].replace(/[\s-]/g, '');
      addContact('phone', phoneMatch[0].trim(), `tel:${num}`);
      continue;
    }
  }

  return contacts;
};

// ── Service Card (4-State Flip Card) ──────────────────────────────────────────
function ServiceCard({ service }) {
  const [activeFace, setActiveFace] = useState('front'); // 'front', 'requirements', 'steps', 'contacts', 'other'
  const isFlipped = activeFace !== 'front';

  const cat = CATEGORIES.find(
    (c) => c.label.toLowerCase() === (service.category || '').toLowerCase()
  ) || CATEGORIES[CATEGORIES.length - 1];

  const renderBackContent = () => {
    switch (activeFace) {
      case 'requirements':
        return (
          <div className="sp-detail-section">
            <h4 className="sp-detail-title">Requirements</h4>
            <div className="sp-detail-text">{renderTextWithLinks(service.requirements)}</div>
          </div>
        );
      case 'steps':
        return (
          <div className="sp-detail-section">
            <h4 className="sp-detail-title">Steps</h4>
            <div className="sp-detail-text">{renderTextWithLinks(service.steps)}</div>
          </div>
        );
      case 'contacts':
        return (
          <div className="sp-detail-section">
            <h4 className="sp-detail-title">Contacts</h4>
            <div className="sp-contact-buttons" style={{ marginTop: '12px' }}>
              {parseContactButtons(service.contacts).map((contact, i) => {
                if (contact.type === 'phone') {
                  return (
                    <div
                      key={i}
                      className="sp-contact-btn sp-contact-pill"
                      style={{ cursor: 'text', userSelect: 'text' }}
                      title={contact.label}
                    >
                      <Phone size={14} />
                      <span>{contact.label}</span>
                    </div>
                  );
                }
                return (
                  <a
                    key={i}
                    href={contact.url}
                    className={`sp-contact-btn ${contact.type === 'email' ? 'sp-contact-circle' : 'sp-contact-pill'}`}
                    target={contact.type === 'link' || contact.type === 'chat' ? '_blank' : undefined}
                    rel={contact.type === 'link' || contact.type === 'chat' ? 'noopener noreferrer' : undefined}
                    title={contact.type === 'link' || contact.type === 'chat' ? contact.url : contact.label}
                  >
                    {contact.type === 'email' && <Mail size={14} />}
                    {contact.type === 'link' && (
                      <>
                        <Globe size={14} />
                        <span>{contact.label}</span>
                      </>
                    )}
                    {contact.type === 'chat' && (
                      <>
                        <MessageSquare size={14} />
                        <span>{contact.label}</span>
                      </>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        );
      case 'other': {
        const otherFields = [
          { key: 'targetAudience',  label: 'Target Audience'    },
          { key: 'methodOfService', label: 'Method of Service'  },
          { key: 'duration',        label: 'Duration'           },
          { key: 'chargePayment',   label: 'Charge & Payment'   },
          { key: 'paymentMethod',   label: 'Payment Method'     },
        ];
        const available = otherFields.filter((f) => service[f.key]);
        if (available.length === 0) {
          return (
            <div className="sp-detail-section">
              <div className="sp-other-empty">
                <Info size={28} />
                <p>Additional info not yet available for this service.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="sp-detail-section">
            {available.map((f) => (
              <div key={f.key} className="sp-other-field">
                <span className="sp-other-label">{f.label}</span>
                <div className="sp-detail-text">{renderTextWithLinks(service[f.key])}</div>
              </div>
            ))}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="sp-card-container">
      <div className={`sp-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
        
        {/* ── Front of Card ── */}
        <div className="sp-card-front">
          <div className="sp-card-header">
            <span className="sp-card-icon">{cat.icon}</span>
            <span className="sp-card-cat-pill">{service.category || 'General'}</span>
          </div>
          <h3 className="sp-card-name">{service.name}</h3>
          <p className="sp-card-agency">{service.agency}</p>
          
          <p className="sp-card-desc">
            {service.description
              ? service.description.slice(0, 120) + (service.description.length > 120 ? '…' : '')
              : 'No description available.'}
          </p>

          <div className="sp-card-actions">
            <div className="sp-card-front-buttons">
              {service.requirements && (
                <button className="sp-card-expand-btn" onClick={() => setActiveFace('requirements')}>
                  Requirements
                </button>
              )}
              {service.steps && (
                <button className="sp-card-expand-btn" onClick={() => setActiveFace('steps')}>
                  Steps
                </button>
              )}
              {service.contacts && (
                <button className="sp-card-expand-btn" onClick={() => setActiveFace('contacts')}>
                  Contact
                </button>
              )}
              <button
                className="sp-card-expand-btn sp-card-expand-btn--other"
                onClick={() => setActiveFace('other')}
              >
                Other
              </button>
            </div>
          </div>

          <div className="sp-card-footer">
            {service.learnMoreUrl && (
              <a
                className="sp-learn-more-link"
                href={service.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen size={13} /> Learn More
              </a>
            )}
            <a
              className="sp-card-btn"
              href={service.directUrl || service.serviceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Access <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* ── Back of Card ── */}
        <div className="sp-card-back">
          <div className="sp-card-back-header">
            <button 
              className="sp-card-back-btn" 
              onClick={() => setActiveFace('front')}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="sp-card-back-title">{service.name}</h3>
          </div>

          <div className="sp-card-back-content">
            {renderBackContent()}
          </div>
          
          <div className="sp-card-back-footer">
            {service.serviceUrl && (
              <a
                className="sp-learn-more-link sp-learn-more-link--back"
                href={service.serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen size={13} /> Learn More on gov.my
              </a>
            )}
            <a
              className="sp-card-btn sp-card-btn-full"
              href={service.directUrl || service.serviceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Access Service <ExternalLink size={14} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ServicesPage = ({ initialCategory = 'All', onNavigate, username = '', onLogout }) => {
  const [allServices, setAllServices]     = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [page, setPage]                   = useState(1);

  // ── Fetch all services once ───────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getServices()
      .then((data) => {
        setAllServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load services. Please try again.');
        setLoading(false);
      });
  }, []);

  // ── Filter whenever search / category changes ─────────────────────────────
  useEffect(() => {
    let results = allServices;

    if (activeCategory !== 'All') {
      results = results.filter(
        (s) => (s.category || 'General').toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.agency || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      );
    }

    setFiltered(results);
    setPage(1);
  }, [search, activeCategory, allServices]);

  const paginated  = filtered.slice(0, page * PAGE_SIZE);
  const hasMore    = paginated.length < filtered.length;

  const clearSearch = () => setSearch('');

  return (
    <div className="sp-root">
      <Navbar
        username={username}
        onLogout={onLogout}
        onNavigate={onNavigate}
        activePage="applications"
      />

      <main className="sp-main">
        {/* ── Header ── */}
        <div className="sp-header">
          <div className="sp-header-text">
            <h1 className="sp-title">Government Digital Services</h1>
            <p className="sp-subtitle">
              Browse {allServices.length > 0 ? allServices.length : '379+'} official government services — search or filter by category.
            </p>
          </div>

          {/* Search */}
          <div className="sp-search-wrap">
            <Search size={18} className="sp-search-icon" />
            <input
              id="services-search"
              className="sp-search"
              type="text"
              placeholder="Search by name, agency or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="sp-search-clear" onClick={clearSearch} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Controls ── */}
        <div className="sp-filters-row">
          <div className="sp-filter-group">
            <select 
              className="sp-filter-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.label} value={cat.label}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button className="sp-filter-btn" onClick={() => {}}>
            Recommended
          </button>

          <div className="sp-filter-group">
            <select className="sp-filter-select" defaultValue="Status">
              <option value="Status" disabled>Progress</option>
              <option value="In Progress">In Progress</option>
              <option value="Action Required">Action Required</option>
              <option value="Completed">Completed</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>
        </div>

        {/* ── Results count ── */}
        {!loading && !error && (
          <p className="sp-count">
            {activeCategory !== 'All' || search
              ? `Showing ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
              : `${allServices.length} services available`}
          </p>
        )}

        {/* ── States ── */}
        {loading && (
          <div className="sp-loading">
            <Loader2 size={36} className="sp-spinner" />
            <p>Loading services from Firestore…</p>
          </div>
        )}

        {error && <div className="sp-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="sp-empty">
            <span>😕</span>
            <p>No services match your search. Try a different keyword or category.</p>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && (
          <div className="sp-grid">
            {paginated.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* ── Load More ── */}
        {!loading && hasMore && (
          <div className="sp-load-more-wrap">
            <button className="sp-load-more" onClick={() => setPage((p) => p + 1)}>
              Load more ({filtered.length - paginated.length} remaining)
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ServicesPage;

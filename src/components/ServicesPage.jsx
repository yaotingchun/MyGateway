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

// ── BM / EN Translations ──────────────────────────────────────────────────────
const TRANSLATIONS = {
  EN: {
    pageTitle:        'Government Digital Services',
    pageSubtitle:     (n) => `Browse ${n} official government services — search or filter by category.`,
    searchPlaceholder:'Search by name, agency or keyword…',
    recommended:      'Recommended',
    progress:         'Progress',
    inProgress:       'In Progress',
    actionRequired:   'Action Required',
    completed:        'Completed',
    notStarted:       'Not Started',
    showing:          (n) => `Showing ${n} result${n !== 1 ? 's' : ''}`,
    available:        (n) => `${n} services available`,
    loading:          'Loading services from Firestore…',
    empty:            'No services match your search. Try a different keyword or category.',
    loadMore:         (n) => `Load more (${n} remaining)`,
    // Card
    requirements:     'Requirements',
    steps:            'Steps',
    contact:          'Contact',
    other:            'Other',
    access:           'Access',
    learnMore:        'Learn More',
    accessService:    'Access Service',
    learnMoreGov:     'Learn More on gov.my',
    back:             'Back',
    // Card back sections
    contacts:         'Contacts',
    // Other tab fields
    targetAudience:   'Target Audience',
    methodOfService:  'Method of Service',
    duration:         'Duration',
    chargePayment:    'Charge & Payment',
    paymentMethod:    'Payment Method',
    noOtherInfo:      'Additional info not yet available for this service.',
    // Categories
    all:              'All',
  },
  MY: {
    pageTitle:        'Perkhidmatan Digital Kerajaan',
    pageSubtitle:     (n) => `Layari ${n} perkhidmatan kerajaan rasmi — cari atau tapis mengikut kategori.`,
    searchPlaceholder:'Cari mengikut nama, agensi atau kata kunci…',
    recommended:      'Disyorkan',
    progress:         'Kemajuan',
    inProgress:       'Dalam Proses',
    actionRequired:   'Tindakan Diperlukan',
    completed:        'Selesai',
    notStarted:       'Belum Dimulakan',
    showing:          (n) => `Menunjukkan ${n} keputusan`,
    available:        (n) => `${n} perkhidmatan tersedia`,
    loading:          'Memuatkan perkhidmatan daripada Firestore…',
    empty:            'Tiada perkhidmatan yang sepadan. Cuba kata kunci atau kategori lain.',
    loadMore:         (n) => `Muatkan lagi (${n} lagi)`,
    // Card
    requirements:     'Keperluan',
    steps:            'Langkah',
    contact:          'Hubungi',
    other:            'Lain-lain',
    access:           'Akses',
    learnMore:        'Ketahui Lebih',
    accessService:    'Akses Perkhidmatan',
    learnMoreGov:     'Ketahui Lebih di gov.my',
    back:             'Kembali',
    // Card back sections
    contacts:         'Kenalan',
    // Other tab fields
    targetAudience:   'Kumpulan Sasaran',
    methodOfService:  'Kaedah Perkhidmatan',
    duration:         'Tempoh',
    chargePayment:    'Bayaran & Cas',
    paymentMethod:    'Kaedah Pembayaran',
    noOtherInfo:      'Maklumat tambahan belum tersedia untuk perkhidmatan ini.',
    // Categories
    all:              'Semua',
  },
};

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
function ServiceCard({ service, lang = 'EN' }) {
  const T = TRANSLATIONS[lang] || TRANSLATIONS.EN;
  const [activeFace, setActiveFace] = useState('front'); // 'front', 'requirements', 'steps', 'contacts', 'other'
  const isFlipped = activeFace !== 'front';

  const cat = CATEGORIES.find(
    (c) => c.label.toLowerCase() === (service.category || '').toLowerCase()
  ) || CATEGORIES[CATEGORIES.length - 1];

  // ── BM-aware field helpers ─────────────────────────────────────────────────
  const isBM  = lang === 'MY';
  const sName = (isBM && service.nameBM)        ? service.nameBM        : service.name;
  const sAgency = (isBM && service.agencyBM)    ? service.agencyBM      : service.agency;
  const sDesc   = (isBM && service.descriptionBM) ? service.descriptionBM : service.description;
  const sReqs   = (isBM && service.requirementsBM) ? service.requirementsBM : service.requirements;
  const sSteps  = (isBM && service.stepsBM)     ? service.stepsBM       : service.steps;
  const sContacts = (isBM && service.contactsBM) ? service.contactsBM   : service.contacts;
  // Other tab: use BM field keys when available, fall back to EN
  const otherFields = [
    { enKey: 'targetAudience',  bmKey: 'targetAudienceBM',  label: T.targetAudience  },
    { enKey: 'methodOfService', bmKey: 'methodOfServiceBM', label: T.methodOfService },
    { enKey: 'duration',        bmKey: 'durationBM',        label: T.duration        },
    { enKey: 'chargePayment',   bmKey: 'chargePaymentBM',   label: T.chargePayment   },
    { enKey: 'paymentMethod',   bmKey: 'paymentMethodBM',   label: T.paymentMethod   },
  ];
  const resolvedOtherFields = otherFields.map((f) => ({
    key:   (isBM && service[f.bmKey]) ? f.bmKey : f.enKey,
    label: f.label,
  }));

  const renderBackContent = () => {
    switch (activeFace) {
      case 'requirements':
        return (
          <div className="sp-detail-section">
            <h4 className="sp-detail-title">{T.requirements}</h4>
            <div className="sp-detail-text">{renderTextWithLinks(sReqs)}</div>
          </div>
        );
      case 'steps':
        return (
          <div className="sp-detail-section">
            <h4 className="sp-detail-title">{T.steps}</h4>
            <div className="sp-detail-text">{renderTextWithLinks(sSteps)}</div>
          </div>
        );
      case 'contacts':
        return (
          <div className="sp-detail-section">
            <h4 className="sp-detail-title">{T.contacts}</h4>
            <div className="sp-contact-buttons" style={{ marginTop: '12px' }}>
              {parseContactButtons(sContacts).map((contact, i) => {
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
          { key: 'targetAudience',  label: T.targetAudience  },
          { key: 'methodOfService', label: T.methodOfService },
          { key: 'duration',        label: T.duration        },
          { key: 'chargePayment',   label: T.chargePayment   },
          { key: 'paymentMethod',   label: T.paymentMethod   },
        ];
        const available = resolvedOtherFields.filter((f) => service[f.key]);
        if (available.length === 0) {
          return (
            <div className="sp-detail-section">
              <div className="sp-other-empty">
                <Info size={28} />
                <p>{T.noOtherInfo}</p>
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
          <h3 className="sp-card-name">{sName}</h3>
          <p className="sp-card-agency">{sAgency}</p>
          
          <p className="sp-card-desc">
            {sDesc
              ? sDesc.slice(0, 120) + (sDesc.length > 120 ? '…' : '')
              : (isBM ? 'Tiada penerangan tersedia.' : 'No description available.')}
          </p>

          <div className="sp-card-actions">
            <div className="sp-card-front-buttons">
              {sReqs && (
                <button className="sp-card-expand-btn" onClick={() => setActiveFace('requirements')}>
                  {T.requirements}
                </button>
              )}
              {sSteps && (
                <button className="sp-card-expand-btn" onClick={() => setActiveFace('steps')}>
                  {T.steps}
                </button>
              )}
              {sContacts && (
                <button className="sp-card-expand-btn" onClick={() => setActiveFace('contacts')}>
                  {T.contact}
                </button>
              )}
              <button
                className="sp-card-expand-btn sp-card-expand-btn--other"
                onClick={() => setActiveFace('other')}
              >
                {T.other}
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
                <BookOpen size={13} /> {T.learnMore}
              </a>
            )}
            <a
              className="sp-card-btn"
              href={service.directUrl || service.serviceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {T.access} <ExternalLink size={14} />
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
              <ArrowLeft size={16} /> {T.back}
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
                <BookOpen size={13} /> {T.learnMoreGov}
              </a>
            )}
            <a
              className="sp-card-btn sp-card-btn-full"
              href={service.directUrl || service.serviceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {T.accessService} <ExternalLink size={14} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ServicesPage = ({ initialCategory = 'All', onNavigate, username = '', onLogout, lang = 'EN', onLangChange }) => {
  const T = TRANSLATIONS[lang] || TRANSLATIONS.EN;
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
        activePage="services"
        lang={lang}
        onLangChange={onLangChange}
      />

      <main className="sp-main">
        {/* ── Header ── */}
        <div className="sp-header">
          <div className="sp-header-text">
            <h1 className="sp-title">{T.pageTitle}</h1>
            <p className="sp-subtitle">
              {T.pageSubtitle(allServices.length > 0 ? allServices.length : '379+')}
            </p>
          </div>

          {/* Search */}
          <div className="sp-search-wrap">
            <Search size={18} className="sp-search-icon" />
            <input
              id="services-search"
              className="sp-search"
              type="text"
              placeholder={T.searchPlaceholder}
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
                  {cat.label === 'All' ? T.all : cat.label}
                </option>
              ))}
            </select>
          </div>

          <button className="sp-filter-btn" onClick={() => {}}>
            {T.recommended}
          </button>

          <div className="sp-filter-group">
            <select className="sp-filter-select" defaultValue="Status">
              <option value="Status" disabled>{T.progress}</option>
              <option value="In Progress">{T.inProgress}</option>
              <option value="Action Required">{T.actionRequired}</option>
              <option value="Completed">{T.completed}</option>
              <option value="Not Started">{T.notStarted}</option>
            </select>
          </div>
        </div>

        {/* ── Results count ── */}
        {!loading && !error && (
          <p className="sp-count">
            {activeCategory !== 'All' || search
              ? T.showing(filtered.length)
              : T.available(allServices.length)}
          </p>
        )}

        {/* ── States ── */}
        {loading && (
          <div className="sp-loading">
            <Loader2 size={36} className="sp-spinner" />
            <p>{T.loading}</p>
          </div>
        )}

        {error && <div className="sp-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="sp-empty">
            <span>😕</span>
            <p>{T.empty}</p>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && (
          <div className="sp-grid">
            {paginated.map((service) => (
              <ServiceCard key={service.id} service={service} lang={lang} />
            ))}
          </div>
        )}

        {/* ── Load More ── */}
        {!loading && hasMore && (
          <div className="sp-load-more-wrap">
            <button className="sp-load-more" onClick={() => setPage((p) => p + 1)}>
              {T.loadMore(filtered.length - paginated.length)}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ServicesPage;

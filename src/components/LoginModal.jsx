import React, { useState, useEffect } from 'react';
import { X, User, ShieldAlert, Award, FileText, CreditCard, Landmark, Sparkles, CheckCircle2 } from 'lucide-react';
import './LoginModal.css';

// Crisp pixel-perfect QR Code SVG mockup
const QrCodeSvg = () => (
  <svg width="180" height="180" viewBox="0 0 29 29" fill="black" shapeRendering="crispEdges">
    <rect width="29" height="29" fill="white" />
    <path d="M0,0 h7 v7 h-7 z M1,1 v5 h5 v-5 z M2,2 h3 v3 h-3 z" />
    <path d="M22,0 h7 v7 h-7 z M23,1 v5 h5 v-5 z M24,2 h3 v3 h-3 z" />
    <path d="M0,22 h7 v7 h-7 z M1,23 v5 h5 v-5 z M2,24 h3 v3 h-3 z" />
    <path d="M20,20 h5 v5 h-5 z M21,21 v3 h3 v-3 z M22,22 h1 v1 h-1 z" />
    <path d="M8,2 h1 v1 h-1 z M10,2 h1 v1 h-1 z M12,2 h1 v1 h-1 z M14,2 h1 v1 h-1 z M16,2 h1 v1 h-1 z M18,2 h1 v1 h-1 z M20,2 h1 v1 h-1 z" />
    <path d="M2,8 v1 h1 v-1 z M2,10 v1 h1 v-1 z M2,12 v1 h1 v-1 z M2,14 v1 h1 v-1 z M2,16 v1 h1 v-1 z M2,18 v1 h1 v-1 z M2,20 v1 h1 v-1 z" />
    <path d="
      M8,0 h2 v1 h-2 z M11,0 h1 v2 h-1 z M13,0 h3 v1 h-3 z M17,0 h1 v1 h-1 z M19,0 h2 v1 h-2 z
      M8,3 h1 v2 h-1 z M10,3 h3 v1 h-3 z M14,3 h1 v1 h-1 z M16,3 h2 v1 h-2 z M19,3 h1 v2 h-1 z
      M8,6 h2 v1 h-2 z M11,6 h1 v1 h-1 z M13,6 h1 v1 h-1 z M15,6 h3 v1 h-3 z M19,6 h1 v1 h-1 z
      M0,8 h3 v1 h-3 z M4,8 h1 v1 h-1 z M6,8 h2 v1 h-2 z M9,8 h2 v1 h-2 z M12,8 h1 v2 h-1 z M14,8 h3 v1 h-3 z M18,8 h1 v1 h-1 z M20,8 h3 v1 h-3 z M24,8 h2 v1 h-2 z M27,8 h2 v1 h-2 z
      M0,10 h1 v2 h-1 z M3,10 h2 v1 h-2 z M6,10 h1 v1 h-1 z M8,10 h1 v1 h-1 z M10,10 h2 v1 h-2 z M13,10 h1 v1 h-1 z M15,10 h1 v1 h-1 z M17,10 h2 v1 h-2 z M20,10 h1 v2 h-1 z M22,10 h2 v1 h-2 z M25,10 h3 v1 h-3 z
      M2,12 h2 v1 h-2 z M5,12 h1 v1 h-1 z M7,12 h2 v1 h-2 z M10,12 h1 v1 h-1 z M12,12 h1 v1 h-1 z M14,12 h2 v1 h-2 z M17,12 h1 v1 h-1 z M19,12 h1 v1 h-1 z M21,12 h1 v1 h-1 z M23,12 h3 v1 h-3 z M27,12 h1 v1 h-1 z
      M0,14 h2 v1 h-2 z M3,14 h1 v2 h-1 z M5,14 h3 v1 h-3 z M9,14 h1 v1 h-1 z M11,14 h1 v1 h-1 z M13,14 h2 v1 h-2 z M16,14 h2 v1 h-2 z M19,14 h2 v1 h-2 z M22,14 h1 v1 h-1 z M24,14 h2 v1 h-2 z M27,14 h1 v1 h-1 z
      M1,16 h2 v1 h-2 z M4,16 h1 v1 h-1 z M6,16 h2 v1 h-2 z M9,16 h2 v1 h-2 z M12,16 h1 v1 h-1 z M14,16 h1 v2 h-1 z M16,16 h3 v1 h-3 z M20,16 h2 v1 h-2 z M23,16 h1 v1 h-1 z M25,16 h2 v1 h-2 z M28,16 h1 v1 h-1 z
      M0,18 h1 v1 h-1 z M2,18 h2 v1 h-2 z M5,18 h2 v1 h-2 z M8,18 h1 v1 h-1 z M10,18 h2 v1 h-2 z M13,18 h1 v1 h-1 z M15,18 h1 v1 h-1 z M17,18 h1 v1 h-1 z M19,18 h2 v1 h-2 z M22,18 h3 v1 h-3 z M26,18 h2 v1 h-2 z
      M0,20 h2 v1 h-2 z M3,20 h1 v1 h-1 z M5,20 h2 v1 h-2 z M8,20 h3 v1 h-3 z M12,20 h1 v1 h-1 z M14,20 h2 v1 h-2 z M17,20 h1 v1 h-1 z M19,20 h1 v1 h-1 z
      M8,22 h2 v1 h-2 z M11,22 h1 v1 h-1 z M13,22 h2 v1 h-2 z M16,22 h1 v1 h-1 z M18,22 h1 v1 h-1 z M26,22 h2 v1 h-2 z
      M8,24 h1 v2 h-1 z M10,24 h2 v1 h-2 z M13,24 h1 v1 h-1 z M15,24 h3 v1 h-3 z M19,24 h1 v1 h-1 z M25,24 h3 v1 h-3 z
      M9,26 h2 v1 h-2 z M12,26 h1 v1 h-1 z M14,26 h1 v1 h-1 z M16,26 h2 v1 h-2 z M19,26 h2 v1 h-2 z M25,26 h1 v2 h-1 z M27,26 h2 v1 h-2 z
      M8,28 h3 v1 h-3 z M12,28 h1 v1 h-1 z M14,28 h2 v1 h-2 z M17,28 h1 v1 h-1 z M19,28 h2 v1 h-2 z M22,28 h2 v1 h-2 z
    " />
  </svg>
);

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [showQrCode, setShowQrCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(174); // 2 minutes 54 seconds

  useEffect(() => {
    if (!showQrCode) return;

    setTimeLeft(174);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto login simulation after 8 seconds (mimics scanning QR code on phone)
    const autoLogin = setTimeout(() => {
      onLogin('Jason', { isFirstTime: false });
      onClose();
      setShowQrCode(false);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoLogin);
    };
  }, [showQrCode, onLogin, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleLoginClick(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginClick = (isFirstTime = false) => {
    onLogin(isFirstTime ? 'Ahmad' : 'Jason', { isFirstTime });
    onClose();
  };

  const handleOpenQr = () => {
    setShowQrCode(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `SESI AKAN TAMAT DALAM MASA ${mins} MINIT ${secs.toString().padStart(2, '0')} SAAT`;
  };

  return (
    <div className="login-modal-overlay">
      <div className={`login-modal-container ${showQrCode ? 'qr-active' : ''}`}>
        
        {/* Left Side: Gradient Banner with Connected Nodes (only shown in initial selection view) */}
        {!showQrCode && (
          <div className="login-modal-left">
            <div className="login-modal-text-content">
              <h1 className="login-modal-title">Gerbang</h1>
              <h1 className="login-modal-title">Perkhidmatan Digital</h1>
              <h1 className="login-modal-title">Kerajaan</h1>
              <p className="login-modal-subtitle">Untuk Warganegara</p>
            </div>

            {/* SVG Connections & Nodes */}
            <div className="network-bg">
              <svg className="network-svg" width="100%" height="100%">
                {/* Lines */}
                <line x1="10%" y1="90%" x2="30%" y2="85%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="30%" y1="85%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="50%" y1="80%" x2="70%" y2="70%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="70%" y1="70%" x2="90%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="90%" y1="50%" x2="75%" y2="35%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="75%" y1="35%" x2="50%" y2="30%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="50%" y1="30%" x2="20%" y2="40%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="20%" y1="40%" x2="10%" y2="60%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="10%" y1="60%" x2="10%" y2="90%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              </svg>

              {/* Nodes */}
              <div className="network-node" style={{ left: '10%', top: '90%' }}><Landmark size={14} /></div>
              <div className="network-node" style={{ left: '30%', top: '85%' }}><FileText size={14} /></div>
              <div className="network-node" style={{ left: '50%', top: '80%' }}><CreditCard size={14} /></div>
              <div className="network-node" style={{ left: '70%', top: '70%' }}><Award size={14} /></div>
              <div className="network-node" style={{ left: '90%', top: '50%' }}><User size={14} /></div>
              <div className="network-node" style={{ left: '75%', top: '35%' }}><ShieldAlert size={14} /></div>
            </div>
          </div>
        )}

        {/* Right Side / Full Screen QR Code Area */}
        <div className={`login-modal-right ${showQrCode ? 'qr-full-width' : ''}`}>
          {/* Close button */}
          <button className="login-modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>

          {showQrCode ? (
            /* QR Code Screen layout matching the first image */
            <div className="qr-screen-container">
              {/* Background concentric circles pattern */}
              <svg className="qr-bg-pattern" width="100%" height="100%">
                <circle cx="100%" cy="100%" r="200" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                <circle cx="100%" cy="100%" r="300" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                <circle cx="100%" cy="100%" r="400" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                <circle cx="0%" cy="0%" r="200" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                <circle cx="0%" cy="0%" r="300" fill="none" stroke="#f1f5f9" strokeWidth="15" />
              </svg>

              <div className="qr-screen-header">
                <div className="mydigitalid-logo larger-logo">
                  <span className="mydigitalid-my">my</span>
                  <span className="mydigitalid-digital">digital</span>
                  <span className="mydigitalid-id">ID</span>
                </div>
                <h2 className="qr-screen-title">LOG MASUK</h2>
              </div>

              {/* Orange countdown banner */}
              <div className="qr-countdown-banner">
                {formatTime(timeLeft)}
              </div>

              <p className="qr-instruction">
                Imbas kod QR menggunakan aplikasi MyDigital ID
              </p>

              {/* Clickable QR code to simulate instant scanning */}
              <div className="qr-code-box" onClick={() => handleLoginClick(false)} title="Klik untuk simulasi imbasan">
                <QrCodeSvg />
              </div>

              <button className="qr-cancel-btn" onClick={() => setShowQrCode(false)}>
                Batal
              </button>

              <p className="qr-footer-text">
                Lindungi Identiti Digital Anda Dengan MyDigital ID
              </p>
            </div>
          ) : (
            /* Dual Login Options Selection Panel */
            <div className="login-modal-content-inner">
              {/* Box 1: Citizen (MyDigitalID) */}
              <div className="login-box citizen-box">
                <h2 className="login-box-title">LOG MASUK</h2>
                <p className="login-box-subtitle">UNTUK WARGANEGARA</p>
                
                <div className="mydigitalid-logo-wrap">
                  <span className="melalui-text">melalui</span>
                  <div className="mydigitalid-logo">
                    <span className="mydigitalid-my">my</span>
                    <span className="mydigitalid-digital">digital</span>
                    <span className="mydigitalid-id">ID</span>
                  </div>
                </div>

                <button className="modal-login-btn citizen-btn" onClick={handleOpenQr}>
                  Log Masuk
                </button>

                <p className="register-link-text">
                  Masih belum ada akaun? <a href="#" className="modal-link" onClick={(e) => { e.preventDefault(); handleLoginClick(true); }}>Daftar akaun MyDigital ID</a>
                </p>
              </div>

              {/* Box 2: Non-Citizen */}
              <div className="login-box non-citizen-box">
                <h2 className="login-box-title">LOG MASUK</h2>
                <p className="login-box-subtitle">FOR NON-CITIZEN AND PERMANENT RESIDENT</p>

                <button className="modal-login-btn non-citizen-btn" onClick={() => handleLoginClick(false)}>
                  Log Masuk
                </button>

                <p className="register-link-text">
                  Masih belum ada akaun? <a href="#" className="modal-link" onClick={(e) => { e.preventDefault(); handleLoginClick(true); }}>Daftar disini</a>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginModal;

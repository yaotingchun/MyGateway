import React from 'react';
import Navbar from './Navbar';

const AIAssistant = ({ username, onLogout, onChangePage }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar username={username} onLogout={onLogout} activePage="ai" onChangePage={onChangePage} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', maxWidth: '500px', width: '100%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #1a56db, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0' }}>AI Assistant</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>This page is currently blank. Please check back later.</p>
        </div>
      </main>
      <footer style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '12px' }}>
        <p>© 2026 MyGateway — Optimized AI Services Portal</p>
      </footer>
    </div>
  );
};

export default AIAssistant;

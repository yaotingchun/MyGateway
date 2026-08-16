import React from 'react';
import './LoginForm.css';
import logo from '../assets/logo.png';

const LoginForm = ({ onOpenLoginModal }) => {
  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="MyGateway Logo" className="login-logo" />
        </div>
        <div className="login-body">
          <h3>Sign In</h3>
          <p>Access your government services with MyDigitalID</p>

          <div style={{ margin: '2rem 0' }}>
            <button className="login-submit-btn" onClick={onOpenLoginModal}>
              Log in
            </button>
          </div>

          <div className="login-footer">
            <a href="#">Help &amp; Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

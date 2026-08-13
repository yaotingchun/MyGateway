import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import './LoginForm.css';
import logo from '../assets/logo.png';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (username === 'user' && password === '00000000') {
      setLoading(true);
      setTimeout(() => {
        onLogin(username);
        setLoading(false);
      }, 800);
    } else {
      setError('Invalid username or password. Try user / 00000000');
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="MyGateway Logo" className="login-logo" />
        </div>
        <div className="login-body">
          <h3>Sign In</h3>
          <p>Access your government services</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="login-submit-btn" type="submit" disabled={loading}>
              {loading ? <span className="login-spinner"></span> : 'Login'}
            </button>
          </form>

          <div className="login-footer">
            <a href="#">Forgot Password?</a>
            <span className="divider">|</span>
            <a href="#">Help &amp; Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { ChevronRight, ArrowRight, Check, Sparkles, ShieldAlert } from 'lucide-react';
import { saveProfile, getDefaultProfile, calculateCompletion } from '../utils/profileStore';
import './OnboardingWizard.css';

const OnboardingWizard = ({ username, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState(getDefaultProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = async () => {
    setErrorMsg('');
    
    if (step === 2) {
      const { icNumber, dateOfBirth } = profileData;
      if (icNumber && dateOfBirth) {
        const cleanIc = icNumber.replace(/\D/g, '');
        
        if (cleanIc.length !== 12) {
          setErrorMsg('Validation Error: The IC / NRIC number must consist of exactly 12 digits.');
          return;
        }

        const dobParts = dateOfBirth.split('-');
        if (dobParts.length === 3) {
          const yy = dobParts[0].substring(2);
          const mm = dobParts[1];
          const dd = dobParts[2];
          const expectedStart = `${yy}${mm}${dd}`;
          
          if (!cleanIc.startsWith(expectedStart)) {
            setErrorMsg('Validation Error: The Date of Birth does not correspond to the first 6 digits of the IC / NRIC number.');
            return;
          }
        }
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSaving(true);
      await saveProfile(username, { ...profileData, isFirstTimeSetupComplete: true });
      setIsSaving(false);
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const updateField = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const { percentage } = calculateCompletion(profileData);

  return (
    <div className="ow-overlay">
      <div className="ow-card">
        {/* Progress Bar */}
        <div className="ow-progress-container">
          <div className="ow-progress-bar">
            <div 
              className="ow-progress-fill" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
          <div className="ow-step-indicator">Step {step} of 4</div>
        </div>

        <div className="ow-content">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="ow-step-content ow-step-welcome">
              <div className="ow-icon-circle">
                <Sparkles size={32} />
              </div>
              <h2>Welcome to MyGateway, {username}!</h2>
              <p className="ow-desc">
                Set up your Centralized Citizen Profile to get personalized recommendations and apply for government services with ease. Enter your info once, use it everywhere.
              </p>
            </div>
          )}

          {/* Step 2: Core Identity */}
          {step === 2 && (
            <div className="ow-step-content">
              <h2>Core Identity</h2>
              <p className="ow-desc">These details help us identify you across all services.</p>
              
              {errorMsg && (
                <div style={{ backgroundColor: '#fef2f2', color: '#ee4932', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} />
                  {errorMsg}
                </div>
              )}
              
              <div className="ow-form-grid">
                <div className="ow-input-group">
                  <label>Full Name as per IC</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ali Bin Abu" 
                    value={profileData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                  />
                </div>
                <div className="ow-input-group">
                  <label>IC / NRIC Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 900101-14-5123" 
                    value={profileData.icNumber}
                    onChange={(e) => updateField('icNumber', e.target.value)}
                  />
                </div>
                <div className="ow-input-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    value={profileData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="ow-input-group">
                  <label>Citizenship</label>
                  <select 
                    value={profileData.citizenship}
                    onChange={(e) => updateField('citizenship', e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="Malaysian Citizen">Malaysian Citizen</option>
                    <option value="Permanent Resident">Permanent Resident</option>
                    <option value="Non-Citizen">Non-Citizen</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="ow-step-content">
              <h2>Contact Information</h2>
              <p className="ow-desc">How can government agencies reach you?</p>
              
              <div className="ow-form-grid">
                <div className="ow-input-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. 012-3456789" 
                    value={profileData.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                  />
                </div>
                <div className="ow-input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. ali@example.com" 
                    value={profileData.emailAddress}
                    onChange={(e) => updateField('emailAddress', e.target.value)}
                  />
                </div>
                <div className="ow-input-group ow-full-width">
                  <label>Residential Address</label>
                  <textarea 
                    placeholder="Enter your full current address" 
                    rows={3}
                    value={profileData.residentialAddress}
                    onChange={(e) => updateField('residentialAddress', e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="ow-step-content ow-step-complete">
              <div className="ow-ring-container">
                <svg viewBox="0 0 36 36" className="ow-circular-chart">
                  <path className="ow-circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="ow-circle"
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="ow-percentage">{percentage}%</text>
                </svg>
              </div>
              <h2>You're all set for now!</h2>
              <p className="ow-desc">
                Your profile is {percentage}% complete. Complete your profile later to receive more personalized guidance and avoid filling forms multiple times.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="ow-footer">
          <div className="ow-footer-left">
            {step > 1 && step < 4 && (
              <button className="ow-btn-text" onClick={handleBack}>
                Back
              </button>
            )}
          </div>
          <div className="ow-footer-right">
            {step > 1 && step < 4 && (
              <button className="ow-btn-skip" onClick={handleSkip}>
                Skip for now
              </button>
            )}
            <button className="ow-btn-primary" onClick={handleNext} disabled={isSaving}>
              {step === 1 ? 'Get Started' : step === 4 ? (isSaving ? 'Saving...' : 'Go to Home') : 'Continue'}
              {step !== 4 && <ArrowRight size={16} className="ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;

import React, { useState, useEffect } from 'react';
import { getProfile, updateSection, clearSection, calculateCompletion } from '../utils/profileStore';
import Navbar from './Navbar';
import { ShieldCheck, ShieldAlert, Phone, Briefcase, GraduationCap, Users, Check, X } from 'lucide-react';
import './ProfilePage.css';

const FieldView = ({ label, value, verified, fullWidth }) => {
  return (
    <div className={`pp-field-view ${fullWidth ? 'pp-full-width' : ''}`}>
      <span className="pp-field-label">
        {label}
        {verified !== undefined && (
          <span className={`pp-verify-badge ${verified ? 'pp-verified' : 'pp-unverified'}`}>
            <span className="pp-dot"></span> {verified ? 'Verified' : 'Unverified'}
          </span>
        )}
      </span>
      <span className={`pp-field-value ${!value ? 'pp-empty-val' : ''}`}>
        {value || 'Not provided'}
      </span>
    </div>
  );
};

const FieldEdit = ({ label, field, type, fullWidth, value, originalValue, onChange }) => {
  const val = value || '';
  const isCompleted = originalValue && originalValue.trim() !== '';
  return (
    <div className={`pp-input-group ${fullWidth ? 'pp-full-width' : ''}`}>
      <label>{label}</label>
      <div className="pp-input-wrapper">
        <input 
          type={type} 
          value={val} 
          onChange={e => onChange(field, e.target.value)} 
        />
        {isCompleted && val === originalValue && <Check size={16} className="pp-input-check" />}
      </div>
    </div>
  );
};

const ProfilePage = ({ username, onLogout, onNavigate }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getProfile(username);
    setProfileData(data);
    setLoading(false);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setEditFormData({ ...profileData });
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditFormData({});
  };

  const handleSave = async (sectionFields, sectionId) => {
    setSaving(true);
    const updates = {};
    sectionFields.forEach(field => {
      updates[field] = editFormData[field];
    });

    if (sectionId === 'identity') {
      const { icNumber, dateOfBirth } = updates;
      if (icNumber && dateOfBirth) {
        const cleanIc = icNumber.replace(/\D/g, '');
        
        if (cleanIc.length !== 12) {
          showToast('Validation Error: The IC / NRIC number must consist of exactly 12 digits.');
          setSaving(false);
          return;
        }

        const dobParts = dateOfBirth.split('-');
        if (dobParts.length === 3) {
          const yy = dobParts[0].substring(2);
          const mm = dobParts[1];
          const dd = dobParts[2];
          const expectedStart = `${yy}${mm}${dd}`;
          
          if (!cleanIc.startsWith(expectedStart)) {
            showToast('Validation Error: The Date of Birth does not correspond to the first 6 digits of the IC / NRIC number.');
            setSaving(false);
            return;
          }
        }
      }
    }

    const result = await updateSection(username, updates);
    if (result && result.success) {
      setProfileData(prev => ({ ...prev, ...updates }));
      setEditingSection(null);
      showToast('Profile updated successfully');
    } else {
      showToast('Error: ' + (result?.error || 'Failed to update. Check Firebase permissions.'));
    }
    setSaving(false);
  };

  const handleClear = async (sectionFields) => {
    const success = await clearSection(username, sectionFields);
    if (success) {
      const updates = {};
      sectionFields.forEach(f => updates[f] = '');
      setProfileData(prev => ({ ...prev, ...updates }));
      showToast('Section cleared');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading || !profileData) {
    return (
      <div className="pp-root">
        <Navbar username={username} onLogout={onLogout} activePage="profile" onNavigate={onNavigate} />
        <div className="pp-loading">Loading profile...</div>
      </div>
    );
  }

  const { percentage, sectionStatus } = calculateCompletion(profileData);

  const handleFieldChange = (field, value) => {
    setEditFormData(prev => ({...prev, [field]: value}));
  };
  
  // Section Definitions
  const sections = [
    {
      id: 'identity',
      title: 'Core Identity',
      icon: <ShieldCheck size={20} />,
      isCore: true,
      fields: ['fullName', 'icNumber', 'dateOfBirth', 'citizenship'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Full Name" value={profileData.fullName} verified={profileData.verificationStatus?.fullName} />
          <FieldView label="IC / NRIC" value={profileData.icNumber} verified={profileData.verificationStatus?.icNumber} />
          <FieldView label="Date of Birth" value={profileData.dateOfBirth} verified={profileData.verificationStatus?.dateOfBirth} />
          <FieldView label="Citizenship" value={profileData.citizenship} verified={profileData.verificationStatus?.citizenship} />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit label="Full Name" field="fullName" type="text" value={editFormData.fullName} originalValue={profileData.fullName} onChange={handleFieldChange} />
          <FieldEdit label="IC / NRIC" field="icNumber" type="text" value={editFormData.icNumber} originalValue={profileData.icNumber} onChange={handleFieldChange} />
          <FieldEdit label="Date of Birth" field="dateOfBirth" type="date" value={editFormData.dateOfBirth} originalValue={profileData.dateOfBirth} onChange={handleFieldChange} />
          <div className="pp-input-group">
            <label>Citizenship</label>
            <select value={editFormData.citizenship || ''} onChange={e => handleFieldChange('citizenship', e.target.value)}>
              <option value="">Select</option>
              <option value="Malaysian Citizen">Malaysian Citizen</option>
              <option value="Permanent Resident">Permanent Resident</option>
              <option value="Non-Citizen">Non-Citizen</option>
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <Phone size={20} />,
      fields: ['phoneNumber', 'emailAddress', 'residentialAddress'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Phone Number" value={profileData.phoneNumber} />
          <FieldView label="Email Address" value={profileData.emailAddress} />
          <FieldView label="Residential Address" value={profileData.residentialAddress} fullWidth />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit label="Phone Number" field="phoneNumber" type="tel" value={editFormData.phoneNumber} originalValue={profileData.phoneNumber} onChange={handleFieldChange} />
          <FieldEdit label="Email Address" field="emailAddress" type="email" value={editFormData.emailAddress} originalValue={profileData.emailAddress} onChange={handleFieldChange} />
          <div className="pp-input-group pp-full-width">
            <label>Residential Address</label>
            <textarea rows={3} value={editFormData.residentialAddress || ''} onChange={e => handleFieldChange('residentialAddress', e.target.value)}></textarea>
          </div>
        </div>
      )
    },
    {
      id: 'employment',
      title: 'Employment',
      icon: <Briefcase size={20} />,
      fields: ['employmentStatus', 'occupation', 'employerName'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Employment Status" value={profileData.employmentStatus} />
          <FieldView label="Occupation" value={profileData.occupation} />
          <FieldView label="Employer / Company" value={profileData.employerName} fullWidth />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <div className="pp-input-group">
            <label>Employment Status</label>
            <select value={editFormData.employmentStatus || ''} onChange={e => handleFieldChange('employmentStatus', e.target.value)}>
              <option value="">Select</option>
              <option value="Employed">Employed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Student">Student</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <FieldEdit label="Occupation" field="occupation" type="text" value={editFormData.occupation} originalValue={profileData.occupation} onChange={handleFieldChange} />
          <FieldEdit label="Employer / Company" field="employerName" type="text" fullWidth value={editFormData.employerName} originalValue={profileData.employerName} onChange={handleFieldChange} />
        </div>
      )
    },
    {
      id: 'education',
      title: 'Education',
      icon: <GraduationCap size={20} />,
      fields: ['highestEducation', 'institutionName', 'fieldOfStudy'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Highest Education" value={profileData.highestEducation} />
          <FieldView label="Field of Study" value={profileData.fieldOfStudy} />
          <FieldView label="Institution Name" value={profileData.institutionName} fullWidth />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <div className="pp-input-group">
            <label>Highest Education</label>
            <select value={editFormData.highestEducation || ''} onChange={e => handleFieldChange('highestEducation', e.target.value)}>
              <option value="">Select</option>
              <option value="SPM">SPM</option>
              <option value="STPM/Diploma">STPM/Diploma</option>
              <option value="Degree">Degree</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <FieldEdit label="Field of Study" field="fieldOfStudy" type="text" value={editFormData.fieldOfStudy} originalValue={profileData.fieldOfStudy} onChange={handleFieldChange} />
          <FieldEdit label="Institution Name" field="institutionName" type="text" fullWidth value={editFormData.institutionName} originalValue={profileData.institutionName} onChange={handleFieldChange} />
        </div>
      )
    },
    {
      id: 'household',
      title: 'Household',
      icon: <Users size={20} />,
      fields: ['maritalStatus', 'numberOfDependents', 'householdInfo'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Marital Status" value={profileData.maritalStatus} />
          <FieldView label="Number of Dependents" value={profileData.numberOfDependents} />
          <FieldView label="Household Info" value={profileData.householdInfo} fullWidth />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <div className="pp-input-group">
            <label>Marital Status</label>
            <select value={editFormData.maritalStatus || ''} onChange={e => handleFieldChange('maritalStatus', e.target.value)}>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <FieldEdit label="Number of Dependents" field="numberOfDependents" type="number" value={editFormData.numberOfDependents} originalValue={profileData.numberOfDependents} onChange={handleFieldChange} />
          <div className="pp-input-group pp-full-width">
            <label>Household Info (Optional)</label>
            <textarea rows={2} value={editFormData.householdInfo || ''} onChange={e => handleFieldChange('householdInfo', e.target.value)}></textarea>
          </div>
        </div>
      )
    }
  ];

  const scrollToSection = (id) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pp-root">
      <Navbar username={username} onLogout={onLogout} activePage="profile" onNavigate={onNavigate} />
      
      <div className="pp-container">
        {/* Sidebar */}
        <aside className="pp-sidebar">
          <div className="pp-sidebar-card">
            <div className="pp-avatar-lg">{username.charAt(0).toUpperCase()}</div>
            <h3 className="pp-sidebar-name">{username}</h3>
            
            <div className="pp-ring-container">
              <svg viewBox="0 0 36 36" className="pp-circular-chart">
                <path className="pp-circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="pp-circle" strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="pp-percentage">{percentage}%</text>
              </svg>
            </div>
            
            <div className="pp-nav-links">
              {sections.map(sec => {
                const isComplete = sectionStatus[sec.id]?.isComplete;
                return (
                  <button key={sec.id} onClick={() => scrollToSection(sec.id)} className="pp-nav-link">
                    <span className="pp-nav-dot">{isComplete ? '●' : '○'}</span>
                    {sec.title}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="pp-content">
          {sections.map(section => {
            const isEditing = editingSection === section.id;
            const status = sectionStatus[section.id];
            
            return (
              <section id={`section-${section.id}`} key={section.id} className="pp-section-card">
                <div className="pp-section-header">
                  <div className="pp-section-title-wrap">
                    <div className="pp-section-icon">{section.icon}</div>
                    <h2 className="pp-section-title">{section.title}</h2>
                  </div>
                  <div className="pp-section-badge-wrap">
                    {status.completed === 0 ? (
                      <span className="pp-badge pp-badge-empty">Not started</span>
                    ) : status.isComplete ? (
                      <span className="pp-badge pp-badge-complete"><Check size={12}/> Completed</span>
                    ) : (
                      <span className="pp-badge pp-badge-partial">{status.completed}/{status.total} Complete</span>
                    )}
                  </div>
                </div>

                <div className="pp-section-body">
                  {isEditing ? section.renderEdit() : section.renderView()}
                </div>

                <div className="pp-section-footer">
                  {isEditing ? (
                    <div className="pp-footer-actions right">
                      <button className="pp-btn-cancel" onClick={handleCancel}>Cancel</button>
                      <button className="pp-btn-save" onClick={() => handleSave(section.fields, section.id)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  ) : (
                    <div className="pp-footer-actions between">
                      {!section.isCore ? (
                        <button className="pp-btn-clear" onClick={() => handleClear(section.fields)}>Clear Section</button>
                      ) : <div></div>}
                      <button className="pp-btn-edit" onClick={() => handleEdit(section.id)}>Edit</button>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {toastMessage && (
        <div className="pp-toast">
          <Check size={16} /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

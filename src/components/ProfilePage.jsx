import React, { useState, useEffect } from 'react';
import { getProfile, updateSection, clearSection, calculateCompletion } from '../utils/profileStore';
import Navbar from './Navbar';
import {
  User,
  Phone,
  Briefcase,
  GraduationCap,
  Users,
  Wallet,
  Car,
  Edit3,
  X,
  Save,
  Check
} from 'lucide-react';
import './ProfilePage.css';

const FieldView = ({ label, value, fullWidth }) => {
  return (
    <div className={`pp-field-view ${fullWidth ? 'pp-full-width' : ''}`}>
      <span className="pp-field-label">{label}</span>
      <span className={`pp-field-value ${!value ? 'pp-empty-val' : ''}`}>
        {value || 'Not provided'}
      </span>
    </div>
  );
};

const FieldEdit = ({ label, field, type, fullWidth, value, originalValue, onChange, options }) => {
  const val = value || '';
  const isCompleted = originalValue && String(originalValue).trim() !== '';

  return (
    <div className={`pp-input-group ${fullWidth ? 'pp-full-width' : ''}`}>
      <label>{label}</label>
      <div className="pp-input-wrapper">
        {options ? (
          <select value={val} onChange={(e) => onChange(field, e.target.value)}>
            <option value="">Select option</option>
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            rows={3}
            value={val}
            onChange={(e) => onChange(field, e.target.value)}
          />
        ) : (
          <input
            type={type}
            value={val}
            onChange={(e) => onChange(field, e.target.value)}
          />
        )}
        {isCompleted && val === originalValue && (
          <Check size={16} className="pp-input-check" />
        )}
      </div>
    </div>
  );
};

const ProfilePage = ({ username = 'Jason', onLogout, onNavigate, lang = 'EN', onLangChange }) => {
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
    sectionFields.forEach((field) => {
      updates[field] = editFormData[field];
    });

    if (sectionId === 'identity') {
      const { icNumber, dateOfBirth } = updates;
      if (icNumber && dateOfBirth) {
        const cleanIc = icNumber.replace(/\D/g, '');
        if (cleanIc.length !== 12) {
          showToast('Validation Error: Malaysian IC number must consist of 12 digits.');
          setSaving(false);
          return;
        }
      }
    }

    const result = await updateSection(username, updates);
    if (result && result.success) {
      setProfileData((prev) => ({ ...prev, ...updates }));
      setEditingSection(null);
      showToast('Profile updated successfully');
    } else {
      showToast('Error: ' + (result?.error || 'Failed to update.'));
    }
    setSaving(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading || !profileData) {
    return (
      <div className="pp-root">
        <Navbar username={username} onLogout={onLogout} activePage="profile" onNavigate={onNavigate} lang={lang} onLangChange={onLangChange} />
        <div className="pp-loading-container">
          <div className="pp-loading-card">
            <div className="pp-loading-spinner"></div>
            <p className="pp-loading-text">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const { percentage } = calculateCompletion(profileData);

  const handleFieldChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Clean, official government profile sections
  const sections = [
    {
      id: 'identity',
      title: 'Core Identity',
      icon: <User size={20} />,
      fields: ['fullName', 'icNumber', 'dateOfBirth', 'gender', 'stateOfBirth', 'citizenship', 'race', 'religion'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Full Name" value={profileData.fullName} />
          <FieldView label="IC / MyKad Number" value={profileData.icNumber} />
          <FieldView label="Date of Birth" value={profileData.dateOfBirth} />
          <FieldView label="Gender" value={profileData.gender} />
          <FieldView label="State of Birth" value={profileData.stateOfBirth} />
          <FieldView label="Citizenship" value={profileData.citizenship} />
          <FieldView label="Race" value={profileData.race} />
          <FieldView label="Religion" value={profileData.religion} />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit label="Full Name" field="fullName" type="text" value={editFormData.fullName} originalValue={profileData.fullName} onChange={handleFieldChange} />
          <FieldEdit label="IC / MyKad Number" field="icNumber" type="text" value={editFormData.icNumber} originalValue={profileData.icNumber} onChange={handleFieldChange} />
          <FieldEdit label="Date of Birth" field="dateOfBirth" type="date" value={editFormData.dateOfBirth} originalValue={profileData.dateOfBirth} onChange={handleFieldChange} />
          <FieldEdit label="Gender" field="gender" type="text" value={editFormData.gender} originalValue={profileData.gender} onChange={handleFieldChange} />
          <FieldEdit label="State of Birth" field="stateOfBirth" type="text" value={editFormData.stateOfBirth} originalValue={profileData.stateOfBirth} onChange={handleFieldChange} />
          <FieldEdit
            label="Citizenship"
            field="citizenship"
            value={editFormData.citizenship}
            originalValue={profileData.citizenship}
            onChange={handleFieldChange}
            options={['Malaysian Citizen', 'Permanent Resident (MyPR)', 'Non-Citizen']}
          />
          <FieldEdit label="Race" field="race" type="text" value={editFormData.race} originalValue={profileData.race} onChange={handleFieldChange} />
          <FieldEdit label="Religion" field="religion" type="text" value={editFormData.religion} originalValue={profileData.religion} onChange={handleFieldChange} />
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact Information & Address',
      icon: <Phone size={20} />,
      fields: ['phoneNumber', 'emailAddress', 'residentialAddress', 'postcode', 'city', 'state'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Mobile Phone Number" value={profileData.phoneNumber} />
          <FieldView label="Email Address" value={profileData.emailAddress} />
          <FieldView label="Residential Address" value={profileData.residentialAddress} fullWidth />
          <FieldView label="Postcode & City" value={`${profileData.postcode || ''} ${profileData.city || ''}`.trim()} />
          <FieldView label="State" value={profileData.state} />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit label="Mobile Phone Number" field="phoneNumber" type="tel" value={editFormData.phoneNumber} originalValue={profileData.phoneNumber} onChange={handleFieldChange} />
          <FieldEdit label="Email Address" field="emailAddress" type="email" value={editFormData.emailAddress} originalValue={profileData.emailAddress} onChange={handleFieldChange} />
          <FieldEdit label="Residential Address" field="residentialAddress" type="textarea" fullWidth value={editFormData.residentialAddress} originalValue={profileData.residentialAddress} onChange={handleFieldChange} />
          <FieldEdit label="Postcode" field="postcode" type="text" value={editFormData.postcode} originalValue={profileData.postcode} onChange={handleFieldChange} />
          <FieldEdit label="City" field="city" type="text" value={editFormData.city} originalValue={profileData.city} onChange={handleFieldChange} />
          <FieldEdit label="State" field="state" type="text" value={editFormData.state} originalValue={profileData.state} onChange={handleFieldChange} />
        </div>
      )
    },
    {
      id: 'socioeconomic',
      title: 'Employment & Income Information',
      icon: <Briefcase size={20} />,
      fields: ['employmentStatus', 'occupation', 'employerName', 'monthlyIncome', 'incomeCategory', 'taxNumber', 'maritalStatus', 'numberOfDependents'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Employment Status" value={profileData.employmentStatus} />
          <FieldView label="Occupation" value={profileData.occupation} />
          <FieldView label="Employer / Company Name" value={profileData.employerName} fullWidth />
          <FieldView label="Monthly Income" value={profileData.monthlyIncome} />
          <FieldView label="Income Category" value={profileData.incomeCategory} />
          <FieldView label="Income Tax Number (TIN)" value={profileData.taxNumber} />
          <FieldView label="Marital Status" value={profileData.maritalStatus} />
          <FieldView label="Number of Dependents" value={profileData.numberOfDependents} />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit
            label="Employment Status"
            field="employmentStatus"
            value={editFormData.employmentStatus}
            originalValue={profileData.employmentStatus}
            onChange={handleFieldChange}
            options={['Self-Employed', 'Employed (Private / Government)', 'Unemployed', 'Student', 'Retired']}
          />
          <FieldEdit label="Occupation" field="occupation" type="text" value={editFormData.occupation} originalValue={profileData.occupation} onChange={handleFieldChange} />
          <FieldEdit label="Employer / Company Name" field="employerName" type="text" fullWidth value={editFormData.employerName} originalValue={profileData.employerName} onChange={handleFieldChange} />
          <FieldEdit label="Monthly Income (RM)" field="monthlyIncome" type="text" value={editFormData.monthlyIncome} originalValue={profileData.monthlyIncome} onChange={handleFieldChange} />
          <FieldEdit
            label="Income Category"
            field="incomeCategory"
            value={editFormData.incomeCategory}
            originalValue={profileData.incomeCategory}
            onChange={handleFieldChange}
            options={['B40', 'M40', 'T20']}
          />
          <FieldEdit label="Income Tax Number (TIN)" field="taxNumber" type="text" value={editFormData.taxNumber} originalValue={profileData.taxNumber} onChange={handleFieldChange} />
          <FieldEdit
            label="Marital Status"
            field="maritalStatus"
            value={editFormData.maritalStatus}
            originalValue={profileData.maritalStatus}
            onChange={handleFieldChange}
            options={['Single', 'Married', 'Divorced', 'Widowed']}
          />
          <FieldEdit label="Number of Dependents" field="numberOfDependents" type="number" value={editFormData.numberOfDependents} originalValue={profileData.numberOfDependents} onChange={handleFieldChange} />
        </div>
      )
    },
    {
      id: 'financial',
      title: 'Banking & Financial Accounts',
      icon: <Wallet size={20} />,
      fields: ['bankName', 'bankAccountNumber', 'sspnAccount', 'kwspNumber', 'perkesoNumber'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Bank Name" value={profileData.bankName} />
          <FieldView label="Bank Account Number" value={profileData.bankAccountNumber} />
          <FieldView label="Simpan SSPN Account Number" value={profileData.sspnAccount} />
          <FieldView label="EPF / KWSP Member Number" value={profileData.kwspNumber} />
          <FieldView label="SOCSO / PERKESO Number" value={profileData.perkesoNumber} />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit label="Bank Name" field="bankName" type="text" value={editFormData.bankName} originalValue={profileData.bankName} onChange={handleFieldChange} />
          <FieldEdit label="Bank Account Number" field="bankAccountNumber" type="text" value={editFormData.bankAccountNumber} originalValue={profileData.bankAccountNumber} onChange={handleFieldChange} />
          <FieldEdit label="Simpan SSPN Account Number" field="sspnAccount" type="text" value={editFormData.sspnAccount} originalValue={profileData.sspnAccount} onChange={handleFieldChange} />
          <FieldEdit label="EPF / KWSP Member Number" field="kwspNumber" type="text" value={editFormData.kwspNumber} originalValue={profileData.kwspNumber} onChange={handleFieldChange} />
          <FieldEdit label="SOCSO / PERKESO Number" field="perkesoNumber" type="text" value={editFormData.perkesoNumber} originalValue={profileData.perkesoNumber} onChange={handleFieldChange} />
        </div>
      )
    },
    {
      id: 'education',
      title: 'Education Background',
      icon: <GraduationCap size={20} />,
      fields: ['highestEducation', 'institutionName', 'fieldOfStudy', 'graduationYear'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Highest Education Level" value={profileData.highestEducation} />
          <FieldView label="Field of Study" value={profileData.fieldOfStudy} />
          <FieldView label="Institution / University Name" value={profileData.institutionName} fullWidth />
          <FieldView label="Graduation Year" value={profileData.graduationYear} />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit
            label="Highest Education Level"
            field="highestEducation"
            value={editFormData.highestEducation}
            originalValue={profileData.highestEducation}
            onChange={handleFieldChange}
            options={['SPM', 'STPM / Matriculation', 'Diploma', 'Degree', 'Masters', 'PhD']}
          />
          <FieldEdit label="Field of Study" field="fieldOfStudy" type="text" value={editFormData.fieldOfStudy} originalValue={profileData.fieldOfStudy} onChange={handleFieldChange} />
          <FieldEdit label="Institution Name" field="institutionName" type="text" fullWidth value={editFormData.institutionName} originalValue={profileData.institutionName} onChange={handleFieldChange} />
          <FieldEdit label="Graduation Year" field="graduationYear" type="text" value={editFormData.graduationYear} originalValue={profileData.graduationYear} onChange={handleFieldChange} />
        </div>
      )
    },
    {
      id: 'licensing',
      title: 'Licensing & Other Details',
      icon: <Car size={20} />,
      fields: ['drivingLicence', 'bloodType'],
      renderView: () => (
        <div className="pp-grid">
          <FieldView label="Driving Licence Class" value={profileData.drivingLicence} />
          <FieldView label="Blood Type" value={profileData.bloodType} />
        </div>
      ),
      renderEdit: () => (
        <div className="pp-grid">
          <FieldEdit label="Driving Licence Class" field="drivingLicence" type="text" value={editFormData.drivingLicence} originalValue={profileData.drivingLicence} onChange={handleFieldChange} />
          <FieldEdit label="Blood Type" field="bloodType" type="text" value={editFormData.bloodType} originalValue={profileData.bloodType} onChange={handleFieldChange} />
        </div>
      )
    }
  ];

  return (
    <div className="pp-root">
      <Navbar username={username} onLogout={onLogout} activePage="profile" onNavigate={onNavigate} lang={lang} onLangChange={onLangChange} />

      <div className="pp-container">
        {/* Sidebar */}
        <aside className="pp-sidebar">
          <div className="pp-sidebar-card">
            <div className="pp-avatar-lg">
              {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'J'}
            </div>
            <h3 className="pp-sidebar-name">{profileData.fullName || username}</h3>
            <p className="pp-sidebar-ic">{profileData.icNumber || '980315-14-5219'}</p>

            <div className="pp-ring-container">
              <svg viewBox="0 0 36 36" className="pp-circular-chart">
                <path
                  className="pp-circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="pp-circle"
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="pp-percentage">
                  {percentage}%
                </text>
              </svg>
            </div>
            <p className="pp-completion-label">Profile Completed</p>

            <div className="pp-sidebar-nav">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  className="pp-side-link"
                  onClick={() => document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="pp-side-icon">{sec.icon}</span>
                  <span className="pp-side-text">{sec.title}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="pp-main">
          {/* Header Banner */}
          <div className="pp-gov-banner">
            <h1 className="pp-gov-title">Citizen Profile</h1>
            <p className="pp-gov-subtitle">
              Manage your personal information, contact address, employment, and registered government accounts.
            </p>
          </div>

          {/* Sections List */}
          <div className="pp-sections-list">
            {sections.map((sec) => {
              const isEditing = editingSection === sec.id;
              return (
                <section key={sec.id} id={`section-${sec.id}`} className="pp-card">
                  <div className="pp-card-header">
                    <div className="pp-header-left">
                      <div className="pp-card-icon">{sec.icon}</div>
                      <h3 className="pp-card-title">{sec.title}</h3>
                    </div>

                    <div className="pp-card-actions">
                      {!isEditing ? (
                        <button
                          type="button"
                          className="pp-btn-edit"
                          onClick={() => handleEdit(sec.id)}
                        >
                          <Edit3 size={15} />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <div className="pp-edit-actions">
                          <button
                            type="button"
                            className="pp-btn-cancel"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            <X size={15} />
                            <span>Cancel</span>
                          </button>
                          <button
                            type="button"
                            className="pp-btn-save"
                            onClick={() => handleSave(sec.fields, sec.id)}
                            disabled={saving}
                          >
                            <Save size={15} />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pp-card-body">
                    {isEditing ? sec.renderEdit() : sec.renderView()}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>

      {toastMessage && <div className="pp-toast">{toastMessage}</div>}
    </div>
  );
};

export default ProfilePage;

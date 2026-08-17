import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Lock,
  ExternalLink,
  Printer,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { submitApplicationStep } from '../services/journeyService';
import './PlanJourney.css';

export default function ApplicationSubmissionModal({
  isOpen,
  step,
  journey,
  username = 'Jason Tan',
  accumulatedArtifacts = {},
  onClose,
  onSubmitSuccess,
}) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form fields with smart autofills from accumulated artifacts
  useEffect(() => {
    if (step) {
      const stepId = step.id || '';
      setSubmissionReceipt(null);
      setError(null);

      if (stepId.includes('ssm') || stepId.includes('business')) {
        setFormData({
          applicantName: username || 'Jason Tan',
          icNumber: '950412-14-5823',
          businessName: 'Jason Kopitiam & Bakery',
          entityType: 'Sole Proprietorship (Milikan Tunggal - Trade Name)',
          businessNature: 'Food & Beverage, Cafe, Pastries and Retail Catering',
          premiseAddress: 'No. 28, Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur',
          periodYears: '1 Year (RM60)',
        });
      } else if (stepId.includes('food-handler') || stepId.includes('health')) {
        setFormData({
          traineeName: username || 'Jason Tan',
          icNumber: '950412-14-5823',
          slpmInstitution: 'Akademi Latihan Pengendali Makanan KKM (Online Certified)',
          clinicName: 'Klinik Kesihatan / Poliklinik Bangsar (Panel KKM)',
          vaccineType: 'Typhoid (TY2) Single Injection - 3 Years Validity',
          numberOfStaff: '2 Persons',
        });
      } else if (stepId.includes('pbt') || stepId.includes('premise')) {
        setFormData({
          businessName: accumulatedArtifacts.businessName || 'Jason Kopitiam & Bakery',
          ssmNumber: accumulatedArtifacts.ssmRegistrationNumber || '20260389142 (SSM)',
          slpmCert: accumulatedArtifacts.slpmCertificateNo || 'KKM/SLPM/2026/8914',
          typhoidCard: accumulatedArtifacts.typhoidVaccineCardNo || 'TY2-KKM-8914',
          localCouncil: 'Dewan Bandaraya Kuala Lumpur (DBKL)',
          premiseType: 'Restaurant / Cafe Ground Floor',
          premiseAddress: 'No. 28, Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur',
          signboardLanguage: 'Bahasa Melayu (DBP Sah Bahasa Approved)',
        });
      } else if (stepId.includes('ptptn') || stepId.includes('loan')) {
        setFormData({
          studentName: username || 'Jason Tan',
          icNumber: '950412-14-5823',
          institution: 'Universiti Malaya (UM)',
          programme: 'Bachelor of Computer Science (Honours)',
          sspnNumber: accumulatedArtifacts.sspnAccountNumber || 'SSPN-10884921',
          bankName: 'Bank Islam Malaysia Berhad',
          bankAccount: '1401-8020-9941-22',
          loanTier: 'Maximum Tier (100% Financing)',
        });
      } else {
        // Generic form
        setFormData({
          applicantName: username || 'Jason Tan',
          icNumber: '950412-14-5823',
          serviceName: step.title,
          agencyName: step.agency,
          contactPhone: '012-3456789',
          remarks: 'Submitted directly via MyGateway Unified Digital Platform.',
        });
      }
    }
  }, [step, username, accumulatedArtifacts]);

  if (!isOpen || !step) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitApplicationStep(
        username || 'guest',
        journey?.id || 'journey-default',
        step.id,
        formData,
        journey
      );

      setSubmissionReceipt(result);
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="submission-modal-backdrop" onClick={onClose}>
      <div
        className="submission-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="submission-modal-header">
          <div className="header-agency-info">
            <div className="agency-icon-badge">
              <Building2 size={20} />
            </div>
            <div>
              <span className="agency-subtitle">{step.agency}</span>
              <h3 className="submission-modal-title">{step.title}</h3>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="submission-modal-body">
          {submissionReceipt ? (
            /* ── Official Success Receipt ── */
            <div className="submission-receipt-card">
              <div className="receipt-status-header">
                <div className="success-pulse-icon">
                  <CheckCircle2 size={36} className="text-emerald-500" />
                </div>
                <h4 className="receipt-title">Application Submitted Successfully!</h4>
                <p className="receipt-subtitle">
                  Your application has been registered with {step.agency} via MyGateway.
                </p>
              </div>

              <div className="receipt-details-table">
                <div className="receipt-row highlight-row">
                  <span className="receipt-label">Official Reference No:</span>
                  <div className="receipt-value-with-copy">
                    <strong>{submissionReceipt.referenceNumber}</strong>
                    <button
                      className="copy-ref-btn"
                      onClick={() => handleCopyRef(submissionReceipt.referenceNumber)}
                      title="Copy reference number"
                    >
                      {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="receipt-row">
                  <span className="receipt-label">Application Status:</span>
                  <span className="receipt-badge-status">
                    <span className="status-dot-green"></span> Submitted & Validated
                  </span>
                </div>

                <div className="receipt-row">
                  <span className="receipt-label">Timestamp:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>

                {submissionReceipt.generatedOutputs && Object.entries(submissionReceipt.generatedOutputs).map(([key, val]) => {
                  if (key.endsWith('_ref') || key.endsWith('_submittedAt')) return null;
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div key={key} className="receipt-row artifact-generated-row">
                      <span className="receipt-label">✨ Produced Output ({label}):</span>
                      <strong className="artifact-value">{val}</strong>
                    </div>
                  );
                })}
              </div>

              <div className="downstream-unlock-banner">
                <Sparkles size={16} className="unlock-sparkle" />
                <p>
                  <strong>Journey Updated:</strong> Downstream dependent steps have been automatically
                  unlocked with these outputs pre-filled!
                </p>
              </div>

              <div className="receipt-actions">
                <button
                  className="submit-btn primary-receipt-btn"
                  onClick={onClose}
                >
                  Return to Journey
                </button>
              </div>
            </div>
          ) : (
            /* ── Application Submission Form ── */
            <form onSubmit={handleSubmit} className="submission-form-container">
              <div className="form-notice-banner">
                <ShieldCheck size={18} className="shield-notice-icon" />
                <div>
                  <strong>Official e-Service Portal Submission</strong>
                  <p>
                    Your data is verified via MyKad biometric authentication and encrypted end-to-end.
                  </p>
                </div>
              </div>

              {/* Dynamic Form Fields */}
              <div className="form-fields-grid">
                {/* 1. SSM Registration Form */}
                {step.id?.includes('ssm') && (
                  <>
                    <div className="form-group full-width">
                      <label>Proposed Business Trade Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.businessName || ''}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                        placeholder="e.g. Jason Cafe & Catering"
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>Business Entity Type</label>
                      <select
                        value={formData.entityType || ''}
                        onChange={(e) => handleChange('entityType', e.target.value)}
                      >
                        <option value="Sole Proprietorship (Milikan Tunggal - Trade Name)">Sole Proprietorship (Trade Name - RM60/yr)</option>
                        <option value="Sole Proprietorship (Personal Name)">Sole Proprietorship (Personal Name - RM30/yr)</option>
                        <option value="Partnership (Perkongsian)">Partnership (Perkongsian - RM60/yr)</option>
                      </select>
                    </div>

                    <div className="form-group half-width">
                      <label>Registration Period</label>
                      <select
                        value={formData.periodYears || ''}
                        onChange={(e) => handleChange('periodYears', e.target.value)}
                      >
                        <option value="1 Year (RM60)">1 Year (RM60)</option>
                        <option value="2 Years (RM120)">2 Years (RM120)</option>
                        <option value="5 Years (RM300)">5 Years (RM300)</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Business Nature / Category *</label>
                      <input
                        type="text"
                        required
                        value={formData.businessNature || ''}
                        onChange={(e) => handleChange('businessNature', e.target.value)}
                        placeholder="e.g. Restaurant, Bakery, Pastries and Catering"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Principal Business Premise Address *</label>
                      <textarea
                        rows={2}
                        required
                        value={formData.premiseAddress || ''}
                        onChange={(e) => handleChange('premiseAddress', e.target.value)}
                        placeholder="e.g. No. 28, Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur"
                      />
                    </div>
                  </>
                )}

                {/* 2. Food Handler Training & Typhoid Form */}
                {step.id?.includes('food-handler') && (
                  <>
                    <div className="form-group full-width">
                      <label>Accredited Training Institution (SLPM) *</label>
                      <input
                        type="text"
                        required
                        value={formData.slpmInstitution || ''}
                        onChange={(e) => handleChange('slpmInstitution', e.target.value)}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>Vaccination Type</label>
                      <input
                        type="text"
                        disabled
                        value={formData.vaccineType || ''}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>Designated Clinic (KKM Panel)</label>
                      <input
                        type="text"
                        required
                        value={formData.clinicName || ''}
                        onChange={(e) => handleChange('clinicName', e.target.value)}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Number of Food Handlers</label>
                      <select
                        value={formData.numberOfStaff || ''}
                        onChange={(e) => handleChange('numberOfStaff', e.target.value)}
                      >
                        <option value="1 Person">1 Person (Owner / Chef)</option>
                        <option value="2 Persons">2 Persons</option>
                        <option value="5 Persons">5 Persons</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 3. PBT Local Council Premise License Form */}
                {step.id?.includes('pbt') && (
                  <>
                    <div className="form-group half-width">
                      <label>SSM Registration Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.ssmNumber || ''}
                        onChange={(e) => handleChange('ssmNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group half-width">
                      <label>Registered Business Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.businessName || ''}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>SLPM Training Cert No. *</label>
                      <input
                        type="text"
                        required
                        value={formData.slpmCert || ''}
                        onChange={(e) => handleChange('slpmCert', e.target.value)}
                      />
                    </div>
                    <div className="form-group half-width">
                      <label>Typhoid Card No. *</label>
                      <input
                        type="text"
                        required
                        value={formData.typhoidCard || ''}
                        onChange={(e) => handleChange('typhoidCard', e.target.value)}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>Local Authority (PBT)</label>
                      <select
                        value={formData.localCouncil || ''}
                        onChange={(e) => handleChange('localCouncil', e.target.value)}
                      >
                        <option value="Dewan Bandaraya Kuala Lumpur (DBKL)">DBKL (Kuala Lumpur)</option>
                        <option value="Majlis Bandaraya Petaling Jaya (MBPJ)">MBPJ (Petaling Jaya)</option>
                        <option value="Majlis Bandaraya Shah Alam (MBSA)">MBSA (Shah Alam)</option>
                        <option value="Majlis Perbandaran Kajang (MPKJ)">MPKJ (Kajang)</option>
                        <option value="Majlis Bandaraya Johor Bahru (MBJB)">MBJB (Johor Bahru)</option>
                      </select>
                    </div>

                    <div className="form-group half-width">
                      <label>Signboard Language Compliance</label>
                      <input
                        type="text"
                        disabled
                        value={formData.signboardLanguage || ''}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Operating Premise Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.premiseAddress || ''}
                        onChange={(e) => handleChange('premiseAddress', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* 4. PTPTN Loan Form */}
                {step.id?.includes('ptptn') && (
                  <>
                    <div className="form-group half-width">
                      <label>Higher Education Institution (IPT) *</label>
                      <input
                        type="text"
                        required
                        value={formData.institution || ''}
                        onChange={(e) => handleChange('institution', e.target.value)}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>Degree / Diploma Programme *</label>
                      <input
                        type="text"
                        required
                        value={formData.programme || ''}
                        onChange={(e) => handleChange('programme', e.target.value)}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>Simpan SSPN Account No. *</label>
                      <input
                        type="text"
                        required
                        value={formData.sspnNumber || ''}
                        onChange={(e) => handleChange('sspnNumber', e.target.value)}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>Panel Bank & Account No. *</label>
                      <input
                        type="text"
                        required
                        value={formData.bankAccount || ''}
                        onChange={(e) => handleChange('bankAccount', e.target.value)}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Financing Tier</label>
                      <select
                        value={formData.loanTier || ''}
                        onChange={(e) => handleChange('loanTier', e.target.value)}
                      >
                        <option value="Maximum Tier (100% Financing - STR recipient)">Maximum Tier (100% Financing - STR recipient)</option>
                        <option value="Medium Tier (75% Financing - M40)">Medium Tier (75% Financing - M40)</option>
                        <option value="Minimum Tier (50% Financing - T20)">Minimum Tier (50% Financing - T20)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 5. Generic / Other Steps */}
                {!step.id?.includes('ssm') &&
                 !step.id?.includes('food-handler') &&
                 !step.id?.includes('pbt') &&
                 !step.id?.includes('ptptn') && (
                  <>
                    <div className="form-group half-width">
                      <label>Applicant Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.applicantName || ''}
                        onChange={(e) => handleChange('applicantName', e.target.value)}
                      />
                    </div>

                    <div className="form-group half-width">
                      <label>MyKad Number</label>
                      <input
                        type="text"
                        required
                        value={formData.icNumber || ''}
                        onChange={(e) => handleChange('icNumber', e.target.value)}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Application Purpose & Description</label>
                      <textarea
                        rows={3}
                        required
                        value={formData.remarks || ''}
                        onChange={(e) => handleChange('remarks', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="form-error-banner">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="submission-modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>Validating with {step.agency}...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application Now</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  FileText,
  Clock,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  ShieldCheck,
  Send,
  RefreshCw,
  Award,
  Lock,
  Paperclip,
  QrCode,
  Printer,
  FileCheck,
  User,
  Briefcase
} from 'lucide-react';
import './ServiceWorkspaceView.css';

const ServiceWorkspaceView = ({
  service,
  journey,
  activeApp,
  username = 'Jason',
  onBack,
  onUpdateServiceStatus
}) => {
  if (!service) return null;

  const isLocked = service.status === 'locked';
  const isSubmitted = (service.status === 'processing' || service.status === 'review_required' || service.status === 'rejected' || service.status === 'completed') && service.status !== 'ready_to_apply' && service.status !== 'pending';

  const [isEditingForm, setIsEditingForm] = useState(false);
  const [showCertView, setShowCertView] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [officerNote, setOfficerNote] = useState('');
  const [statutoryAgreed, setStatutoryAgreed] = useState(false);

  // Reset local edit/cert view if service changes
  useEffect(() => {
    setIsEditingForm(false);
    setShowCertView(false);
  }, [service?.id]);

  // Initialize official form data
  useEffect(() => {
    if (service) {
      setFormData({
        // Section 1: Citizen Profile Details
        fullName: username === 'Jason' ? 'Jason Tan Wei Lun' : username,
        icNumber: '980315-14-5219',
        phoneNumber: '+60 12-345 6789',
        emailAddress: 'jason.tan@example.com.my',
        residentialAddress: 'No. 42, Jalan Bukit Pantai, Bangsar, 59100 Kuala Lumpur',
        
        // Section 2: SSM Enterprise Fields
        businessName: service.submissionOutput?.businessName || 'Kopi & Roti Heritage Enterprise',
        businessType: 'Sole Proprietorship (Pemilikan Tunggal)',
        businessRegPeriod: '1 Year (RM60)',
        msicCode: '56101 - Restaurants & Mobile Food Services',
        businessStartDate: '2026-03-01',
        premiseOwnership: 'Rented Commercial Shop Lot',
        premiseAddress: 'No. 18, Ground Floor, Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur',
        
        // Section 2: Local Council (PBT) Fields
        ssmNumber: service.submissionOutput?.ssmNumber || '202601094821 (003491028-X)',
        localCouncil: 'Dewan Bandaraya Kuala Lumpur (DBKL)',
        premiseFloorArea: '145.5 sq metres',
        tenancyDuration: '24 Months (Exp: 2028-02-28)',
        signboardWording: 'RESTORAN KOPI & ROTI HERITAGE',
        dbpCertNo: 'DBP/2026/FNB/08912',
        slpmCert: service.submissionOutput?.slpmCert || 'SLPM-KKM-2026-99120',
        typhoidCard: service.submissionOutput?.typhoidCard || 'TY2-KL-2026-0812',

        // Section 2: LHDN Tax & e-Invoicing Fields
        taxFileCategory: 'Individual with Business Income (Borang B)',
        tinNumber: 'IG-910482180-01',
        eInvoicingMethod: 'MyInvois Portal & Open API Gateway',
        turnoverBracket: 'RM150,000 - RM500,000 / year',

        // Section 2: JAKIM Halal Fields
        halalScheme: 'Food & Beverage Premise / Restaurant',
        halalExecutiveId: 'JAKIM/CE/2026/0491',
        muslimStaffCount: '3 Trained Handlers',
        pestControlContractor: 'Rentokil Initial (M) Sdn Bhd',

        // Section 2: PTPTN Education Loan Fields
        sspnNumber: service.submissionOutput?.sspnAccountNumber || 'SSPN-10894218',
        institution: 'Universiti Malaya (UM)',
        programme: 'Bachelor of Business Administration (Hons)',
        mqaCode: 'MQA/FA10294',
        disbursementBank: 'Bank Islam Malaysia Berhad',
        bankAccountNo: '14028020941829',

        ...(service.submissionRecord?.formData || {}),
      });

      setStatutoryAgreed(service.status === 'completed');

      if (service.status === 'review_required') {
        setOfficerNote('Agency Officer Feedback (Licensing Division): Signboard artwork requires DBP Sah Bahasa certificate confirmation.');
      } else if (service.status === 'rejected') {
        setOfficerNote('Agency Rejection Reason: Information mismatch. Please verify applicant MyKad identity.');
      } else {
        setOfficerNote('');
      }
    }
  }, [service, username]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle formal submission
  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    if (isLocked) return;

    setIsSubmitting(true);

    const refNumber = 'MYG-' + service.id.toUpperCase().replace('STEP-', '') + '-' + Math.floor(100000 + Math.random() * 900000);

    const output = {};
    if (service.id.includes('ssm')) {
      output.ssmNumber = '20260109' + Math.floor(1000 + Math.random() * 9000) + ' (00349' + Math.floor(1000 + Math.random() * 9000) + '-X)';
      output.businessName = formData.businessName || 'Kopi & Roti Heritage Enterprise';
      output.expiryDate = '2027-03-01';
    } else if (service.id.includes('pbt')) {
      output.pbtLicenseNumber = 'DBKL/LESEN/2026/' + Math.floor(10000 + Math.random() * 90000);
      output.premiseAddress = formData.premiseAddress;
      output.expiryDate = '2027-02-28';
    } else if (service.id.includes('lhdn')) {
      output.taxIdNumber = formData.tinNumber || 'IG-910482180-01';
      output.eInvoicingStatus = 'Active (Live API Connected)';
    } else if (service.id.includes('jakim')) {
      output.halalCertNumber = 'JAKIM.700-2/1/1 049-03/2026';
      output.halalValidity = '2 Years (Exp: 2028-03-31)';
    } else if (service.id.includes('sspn')) {
      output.sspnAccountNumber = formData.sspnNumber || 'SSPN-10894218';
    } else if (service.id.includes('ptptn')) {
      output.ptptnRef = 'PTPTN-APP-2026-' + Math.floor(10000 + Math.random() * 90000);
      output.loanApprovedAmount = 'RM32,000 (RM4,000/semester)';
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditingForm(false);
      setShowCertView(false);
      onUpdateServiceStatus(service.id, 'processing', {
        referenceNumber: refNumber,
        submittedAt: new Date().toISOString(),
        formData: formData,
        output: output
      });
    }, 600);
  };

  // Status simulation actions
  const handleSetPhase = (newStatus) => {
    setIsEditingForm(false);
    setShowCertView(false);
    if (newStatus === 'ready_to_apply') {
      onUpdateServiceStatus(service.id, 'ready_to_apply', {
        formData: formData,
        referenceNumber: null,
        submittedAt: null
      });
      return;
    }
    onUpdateServiceStatus(service.id, newStatus, {
      formData: formData,
      referenceNumber: service.submissionRecord?.referenceNumber || ('MYG-' + service.id.toUpperCase() + '-882910'),
      submittedAt: service.submissionRecord?.submittedAt || new Date().toISOString()
    });
  };

  // Get Phase Badge configuration
  const getPhaseBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', className: 'status-completed', icon: <CheckCircle2 size={13} /> };
      case 'processing':
        return { label: 'Processing', className: 'status-processing', icon: <RefreshCw size={12} className="spin-icon" /> };
      case 'review_required':
        return { label: 'Review Required', className: 'status-review', icon: <AlertTriangle size={13} /> };
      case 'rejected':
        return { label: 'Rejected / Resubmit', className: 'status-rejected', icon: <AlertCircle size={13} /> };
      case 'locked':
        return { label: 'Prerequisite Required', className: 'status-locked', icon: <Lock size={12} /> };
      default:
        return { label: 'Ready to Apply', className: 'status-ready', icon: <CheckCircle2 size={12} /> };
    }
  };

  const currentPhase = getPhaseBadge(service.status);

  return (
    <div className="gov-service-page">

      {/* ── Top Navigation Bar / Breadcrumb ── */}
      <div className="gov-page-nav-bar">
        <button
          type="button"
          className="gov-nav-back-btn"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Back to Application Journey ({activeApp?.id})</span>
        </button>

        <div className="gov-nav-right-meta">
          <span className="gov-nav-app-id">{activeApp?.id}</span>
          <span className={`gov-phase-pill ${currentPhase.className}`}>
            {currentPhase.icon}
            <span>{currentPhase.label}</span>
          </span>
        </div>
      </div>

      {/* ── Main Government Card Container ── */}
      <div className="gov-page-card">

        {/* ── Official Government Agency Banner ── */}
        <div className="gov-card-top-banner">
          <div className="banner-left">
            <div className="gov-agency-crest">
              <Building2 size={24} />
            </div>
            <div>
              <div className="banner-agency-row">
                <span className="agency-name-tag">{service.agency}</span>
                <span className="sub-tag">Official Government e-Service</span>
              </div>
              <h1 className="banner-service-heading">{service.title}</h1>
            </div>
          </div>
        </div>

        {/* ── Body Content (Application Form OR Status Page directly, No Tabs) ── */}
        <div className="gov-card-body">

          {/* ════════════════════════════════════════════════════════════════════
              VIEW A: OFFICIAL DIGITAL CERTIFICATE (When opened from Status Page)
             ════════════════════════════════════════════════════════════════════ */}
          {showCertView && service.status === 'completed' && (
            <div className="gov-cert-full-view">
              <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto' }}>
                <button
                  type="button"
                  className="gov-nav-back-btn"
                  style={{ marginBottom: '16px' }}
                  onClick={() => setShowCertView(false)}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Application Status & Timeline</span>
                </button>

                <div className="gov-cert-document">
                  <div className="cert-crest-top">
                    <Building2 size={32} />
                  </div>
                  <h2 className="cert-h2">GOVERNMENT OF MALAYSIA</h2>
                  <h3 className="cert-h3">{service.agency.toUpperCase()}</h3>
                  <h4 className="cert-h4">OFFICIAL DIGITAL REGISTRATION CERTIFICATE</h4>

                  <div className="cert-table-box">
                    <div className="cert-line">
                      <span className="line-k">Certificate Serial No:</span>
                      <span className="line-v mono">{service.submissionRecord?.referenceNumber || 'MYG-SSM-2026-891024'}</span>
                    </div>

                    <div className="cert-line">
                      <span className="line-k">Business / Entity Name:</span>
                      <span className="line-v">{formData.businessName || formData.fullName}</span>
                    </div>

                    <div className="cert-line">
                      <span className="line-k">Owner NRIC / Identity No:</span>
                      <span className="line-v mono">{formData.icNumber}</span>
                    </div>

                    <div className="cert-line">
                      <span className="line-k">Operating Premise Address:</span>
                      <span className="line-v">{formData.premiseAddress || formData.residentialAddress}</span>
                    </div>

                    <div className="cert-line">
                      <span className="line-k">Issuance Date:</span>
                      <span className="line-v">{new Date(service.submissionRecord?.submittedAt || Date.now()).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    <div className="cert-line">
                      <span className="line-k">Statutory Status:</span>
                      <span className="line-v status-green">ACTIVE & OFFICIALLY REGISTERED</span>
                    </div>
                  </div>

                  <div className="cert-stamp-row">
                    <div className="stamp-qr">
                      <QrCode size={52} />
                      <span>Scan for official verification on MyGateway Public Ledger</span>
                    </div>
                    <div className="stamp-seal">
                      <div className="seal-ring">
                        <FileCheck size={24} />
                        <span>OFFICIAL SEAL</span>
                      </div>
                    </div>
                  </div>

                  <div className="cert-btns">
                    <button
                      type="button"
                      className="gov-action-btn-back"
                      onClick={() => window.print()}
                    >
                      <Printer size={15} />
                      <span>Print Certificate</span>
                    </button>

                    <button
                      type="button"
                      className="gov-action-btn-submit"
                      onClick={() => alert('Official PDF certificate downloaded.')}
                    >
                      <Download size={15} />
                      <span>Download PDF Certificate</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              VIEW B: APPLICATION FORM (Before Submission OR When Editing)
             ════════════════════════════════════════════════════════════════════ */}
          {!showCertView && (!isSubmitted || isEditingForm) && (
            <form onSubmit={handleSubmitForm} className="gov-full-form">

              {/* Notice when editing an already-submitted form */}
              {isEditingForm && (
                <div className="gov-notice-banner notice-review" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    <span><strong>Editing Application Details:</strong> Update required fields below and submit to resubmit your application.</span>
                  </div>
                  <button
                    type="button"
                    className="gov-action-btn-back"
                    style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                    onClick={() => setIsEditingForm(false)}
                  >
                    Cancel & Return to Status
                  </button>
                </div>
              )}

              {/* Compact Information Strip */}
              <div className="gov-info-strip">
                <div className="info-cell">
                  <span className="cell-lbl">Timeframe:</span>
                  <span className="cell-val">{service.timeframe || '1 - 3 Working Days'}</span>
                </div>
                <div className="info-divider"></div>
                <div className="info-cell">
                  <span className="cell-lbl">Statutory Fee:</span>
                  <span className="cell-val">{service.fee || 'Free'}</span>
                </div>
                <div className="info-divider"></div>
                <div className="info-cell">
                  <span className="cell-lbl">Filing Channel:</span>
                  <span className="cell-val">MyGateway e-Service (100% Online)</span>
                </div>
              </div>

              {/* Locked Warning */}
              {isLocked && (
                <div className="gov-notice-banner notice-locked">
                  <Lock size={16} />
                  <span>Prerequisite Required: Please complete previous prerequisite applications before submitting this application. You may review the form parameters below.</span>
                </div>
              )}

              {/* Officer Note */}
              {service.status === 'review_required' && (
                <div className="gov-notice-banner notice-review">
                  <AlertTriangle size={16} />
                  <span>Officer Review Action: {officerNote}</span>
                </div>
              )}

              {/* SECTION 1: APPLICANT DETAILS */}
              <div className="gov-section-block">
                <div className="gov-section-bar">
                  <User size={16} className="bar-icon" />
                  <span>1. Applicant Identification & Personal Details</span>
                </div>

                <div className="gov-fields-grid">
                  <div className="gov-input-col">
                    <label>Full Name (As per NRIC) *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                    />
                  </div>

                  <div className="gov-input-col">
                    <label>NRIC / Identity Card No. *</label>
                    <input
                      type="text"
                      required
                      value={formData.icNumber}
                      onChange={(e) => handleChange('icNumber', e.target.value)}
                    />
                  </div>

                  <div className="gov-input-col">
                    <label>Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    />
                  </div>

                  <div className="gov-input-col">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.emailAddress}
                      onChange={(e) => handleChange('emailAddress', e.target.value)}
                    />
                  </div>

                  <div className="gov-input-col span-2">
                    <label>Principal Residential Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.residentialAddress}
                      onChange={(e) => handleChange('residentialAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: REGISTRATION PARAMETERS */}
              <div className="gov-section-block">
                <div className="gov-section-bar">
                  <Briefcase size={16} className="bar-icon" />
                  <span>2. Registration Parameters & Agency Form Fields</span>
                </div>

                <div className="gov-fields-grid">
                  {/* SSM Fields */}
                  {service.id.includes('ssm') && (
                    <>
                      <div className="gov-input-col span-2">
                        <label>Proposed Business Trade Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.businessName}
                          onChange={(e) => handleChange('businessName', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Entity Type *</label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => handleChange('businessType', e.target.value)}
                        >
                          <option value="Sole Proprietorship (Pemilikan Tunggal)">Sole Proprietorship</option>
                          <option value="Partnership (Perkongsian)">Partnership</option>
                          <option value="Sdn Bhd (Sendirian Berhad)">Private Limited Company (Sdn Bhd)</option>
                        </select>
                      </div>

                      <div className="gov-input-col">
                        <label>Registration Period *</label>
                        <select
                          value={formData.businessRegPeriod}
                          onChange={(e) => handleChange('businessRegPeriod', e.target.value)}
                        >
                          <option value="1 Year (RM60)">1 Year (RM60)</option>
                          <option value="2 Years (RM120)">2 Years (RM120)</option>
                          <option value="5 Years (RM300)">5 Years (RM300)</option>
                        </select>
                      </div>

                      <div className="gov-input-col span-2">
                        <label>Economic Activity Classification (MSIC Code) *</label>
                        <input
                          type="text"
                          required
                          value={formData.msicCode}
                          onChange={(e) => handleChange('msicCode', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Business Commencement Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.businessStartDate}
                          onChange={(e) => handleChange('businessStartDate', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Premise Ownership</label>
                        <select
                          value={formData.premiseOwnership}
                          onChange={(e) => handleChange('premiseOwnership', e.target.value)}
                        >
                          <option value="Rented Commercial Shop Lot">Rented Commercial Shop Lot</option>
                          <option value="Self-Owned Commercial Property">Self-Owned Commercial Property</option>
                          <option value="Home / Online Based">Home / Online Based</option>
                        </select>
                      </div>

                      <div className="gov-input-col span-2">
                        <label>Principal Place of Operating Premise Address *</label>
                        <input
                          type="text"
                          required
                          value={formData.premiseAddress}
                          onChange={(e) => handleChange('premiseAddress', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Local Council (PBT) Fields */}
                  {service.id.includes('pbt') && (
                    <>
                      <div className="gov-input-col">
                        <label>Verified SSM Registration Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.ssmNumber}
                          onChange={(e) => handleChange('ssmNumber', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Local Council Authority (PBT) *</label>
                        <select
                          value={formData.localCouncil}
                          onChange={(e) => handleChange('localCouncil', e.target.value)}
                        >
                          <option value="Dewan Bandaraya Kuala Lumpur (DBKL)">Kuala Lumpur City Hall (DBKL)</option>
                          <option value="Majlis Bandaraya Petaling Jaya (MBPJ)">Petaling Jaya City Council (MBPJ)</option>
                          <option value="Majlis Bandaraya Shah Alam (MBSA)">Shah Alam City Council (MBSA)</option>
                          <option value="Majlis Perbandaran Kajang (MPKJ)">Kajang Municipal Council (MPKJ)</option>
                        </select>
                      </div>

                      <div className="gov-input-col span-2">
                        <label>Operating Premise Address *</label>
                        <input
                          type="text"
                          required
                          value={formData.premiseAddress}
                          onChange={(e) => handleChange('premiseAddress', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Premise Floor Area ($m^2$) *</label>
                        <input
                          type="text"
                          required
                          value={formData.premiseFloorArea}
                          onChange={(e) => handleChange('premiseFloorArea', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Tenancy Agreement Duration *</label>
                        <input
                          type="text"
                          required
                          value={formData.tenancyDuration}
                          onChange={(e) => handleChange('tenancyDuration', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Signboard Text / Wording (Malay Language) *</label>
                        <input
                          type="text"
                          required
                          value={formData.signboardWording}
                          onChange={(e) => handleChange('signboardWording', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>DBP Language Certification Ref No. *</label>
                        <input
                          type="text"
                          required
                          value={formData.dbpCertNo}
                          onChange={(e) => handleChange('dbpCertNo', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>MOH Food Handler Training (SLPM) Cert No. *</label>
                        <input
                          type="text"
                          required
                          value={formData.slpmCert}
                          onChange={(e) => handleChange('slpmCert', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Typhoid Vaccination Card No. (TY2) *</label>
                        <input
                          type="text"
                          required
                          value={formData.typhoidCard}
                          onChange={(e) => handleChange('typhoidCard', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* LHDN Tax & e-Invoicing Fields */}
                  {service.id.includes('lhdn') && (
                    <>
                      <div className="gov-input-col">
                        <label>Income Tax File Category *</label>
                        <select
                          value={formData.taxFileCategory}
                          onChange={(e) => handleChange('taxFileCategory', e.target.value)}
                        >
                          <option value="Individual with Business Income (Borang B)">Individual with Business Income (Form B)</option>
                          <option value="Company / Enterprise (Borang C)">Company / Partnership (Form C)</option>
                        </select>
                      </div>

                      <div className="gov-input-col">
                        <label>Tax Identification Number (TIN) *</label>
                        <input
                          type="text"
                          required
                          value={formData.tinNumber}
                          onChange={(e) => handleChange('tinNumber', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>MyInvois Integration Method *</label>
                        <select
                          value={formData.eInvoicingMethod}
                          onChange={(e) => handleChange('eInvoicingMethod', e.target.value)}
                        >
                          <option value="MyInvois Portal & Open API Gateway">MyInvois Portal & Open API Gateway</option>
                          <option value="Direct ERP / POS Integration">Direct ERP / POS Integration</option>
                        </select>
                      </div>

                      <div className="gov-input-col">
                        <label>Estimated Annual Turnover *</label>
                        <select
                          value={formData.turnoverBracket}
                          onChange={(e) => handleChange('turnoverBracket', e.target.value)}
                        >
                          <option value="Under RM150,000 / year">Under RM150,000 / year</option>
                          <option value="RM150,000 - RM500,000 / year">RM150,000 - RM500,000 / year</option>
                          <option value="RM500,000 - RM1,000,000 / year">RM500,000 - RM1,000,000 / year</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* JAKIM Halal Fields */}
                  {service.id.includes('jakim') && (
                    <>
                      <div className="gov-input-col">
                        <label>Halal Certification Scheme *</label>
                        <select
                          value={formData.halalScheme}
                          onChange={(e) => handleChange('halalScheme', e.target.value)}
                        >
                          <option value="Food & Beverage Premise / Restaurant">Food & Beverage Premise / Restaurant</option>
                          <option value="Food Manufacturing">Food Manufacturing</option>
                        </select>
                      </div>

                      <div className="gov-input-col">
                        <label>Certified Halal Executive ID *</label>
                        <input
                          type="text"
                          required
                          value={formData.halalExecutiveId}
                          onChange={(e) => handleChange('halalExecutiveId', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Number of Muslim Handlers *</label>
                        <input
                          type="text"
                          required
                          value={formData.muslimStaffCount}
                          onChange={(e) => handleChange('muslimStaffCount', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Pest Control Service Contractor *</label>
                        <input
                          type="text"
                          required
                          value={formData.pestControlContractor}
                          onChange={(e) => handleChange('pestControlContractor', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* PTPTN Loan Fields */}
                  {service.id.includes('ptptn') && (
                    <>
                      <div className="gov-input-col">
                        <label>Verified Simpan SSPN Account No. *</label>
                        <input
                          type="text"
                          required
                          value={formData.sspnNumber}
                          onChange={(e) => handleChange('sspnNumber', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Higher Education Institution (Public / Private) *</label>
                        <input
                          type="text"
                          required
                          value={formData.institution}
                          onChange={(e) => handleChange('institution', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Degree / Course of Study Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.programme}
                          onChange={(e) => handleChange('programme', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>MQA Accreditation Reference Code *</label>
                        <input
                          type="text"
                          required
                          value={formData.mqaCode}
                          onChange={(e) => handleChange('mqaCode', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Disbursement Bank Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.disbursementBank}
                          onChange={(e) => handleChange('disbursementBank', e.target.value)}
                        />
                      </div>

                      <div className="gov-input-col">
                        <label>Applicant Bank Account Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.bankAccountNo}
                          onChange={(e) => handleChange('bankAccountNo', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Fallback for other general services */}
                  {!service.id.includes('ssm') &&
                   !service.id.includes('pbt') &&
                   !service.id.includes('lhdn') &&
                   !service.id.includes('jakim') &&
                   !service.id.includes('ptptn') && (
                    <>
                      <div className="gov-input-col span-2">
                        <label>Purpose & Description of Application *</label>
                        <input
                          type="text"
                          required
                          defaultValue={service.description || 'Government public digital service application'}
                        />
                      </div>
                      <div className="gov-input-col">
                        <label>Preferred Branch / UTC Counter</label>
                        <select defaultValue="Putrajaya / UTC KL">
                          <option value="Putrajaya / UTC KL">Putrajaya / UTC KL</option>
                          <option value="UTC Selangor">UTC Selangor</option>
                          <option value="UTC Penang">UTC Penang</option>
                        </select>
                      </div>
                      <div className="gov-input-col">
                        <label>Document Reference Number</label>
                        <input type="text" defaultValue="MYG-DOC-2026-88124" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION 3: SUPPORTING DOCUMENTS */}
              <div className="gov-section-block">
                <div className="gov-section-bar">
                  <Paperclip size={16} className="bar-icon" />
                  <span>3. Supporting Documents & Official Verifications</span>
                </div>

                <div className="gov-docs-grid">
                  <div className="gov-doc-item">
                    <span className="doc-item-title">Copy of NRIC Identity Card (Front & Back)</span>
                    <span className="doc-badge-verified">Verified with JPN</span>
                  </div>

                  {service.id.includes('ssm') && (
                    <div className="gov-doc-item">
                      <span className="doc-item-title">Tenancy Agreement / Land Ownership Grant</span>
                      <span className="doc-badge-attached">Attached</span>
                    </div>
                  )}

                  {service.id.includes('pbt') && (
                    <>
                      <div className="gov-doc-item">
                        <span className="doc-item-title">SSM Business Registration Certificate (Form D / E)</span>
                        <span className="doc-badge-verified">Verified with SSM</span>
                      </div>
                      <div className="gov-doc-item">
                        <span className="doc-item-title">MOH SLPM Training Certificate & TY2 Typhoid Card</span>
                        <span className="doc-badge-verified">Verified with MOH</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION 4: STATUTORY DECLARATION */}
              <div className="gov-declaration-card">
                <label className="gov-decl-checkbox">
                  <input
                    type="checkbox"
                    required
                    checked={statutoryAgreed}
                    onChange={(e) => setStatutoryAgreed(e.target.checked)}
                    disabled={isLocked}
                  />
                  <span>
                    I hereby solemnly declare under the <strong>Statutory Declarations Act 1960</strong> that all information and documents submitted herein are authentic, complete, and correct.
                  </span>
                </label>
              </div>

              {/* Bottom Actions Bar */}
              <div className="gov-page-actions">
                <button
                  type="button"
                  className="gov-action-btn-back"
                  onClick={onBack}
                >
                  Back
                </button>

                {!isLocked ? (
                  <button
                    type="submit"
                    className="gov-action-btn-submit"
                    disabled={isSubmitting || !statutoryAgreed}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={15} className="spin-icon" />
                        <span>Submitting to Agency...</span>
                      </>
                    ) : service.status === 'completed' ? (
                      <>
                        <RefreshCw size={15} />
                        <span>Update & Resubmit</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Application to Agency</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="gov-locked-hint">
                    <Lock size={14} />
                    <span>Lengkapkan prasyarat untuk membolehkan penghantaran.</span>
                  </div>
                )}
              </div>

            </form>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              VIEW C: APPLICATION STATUS & LIFECYCLE HORIZONTAL TIMELINE
              (Rendered directly after submission, No tabs)
             ════════════════════════════════════════════════════════════════════ */}
          {!showCertView && isSubmitted && !isEditingForm && (
            <div className="gov-lifecycle-view">

              {/* 1. BIG STATUS SIGN ON TOP WITH FULL DESCRIPTION */}
              <div className={`gov-big-status-card status-theme-${service.status || 'processing'}`}>
                <div className="big-status-left-icon">
                  {service.status === 'completed' ? (
                    <div className="status-icon-bubble bubble-completed">
                      <CheckCircle2 size={36} />
                    </div>
                  ) : service.status === 'review_required' ? (
                    <div className="status-icon-bubble bubble-review">
                      <AlertTriangle size={34} />
                    </div>
                  ) : service.status === 'rejected' ? (
                    <div className="status-icon-bubble bubble-rejected">
                      <AlertCircle size={34} />
                    </div>
                  ) : (
                    <div className="status-icon-bubble bubble-processing">
                      <RefreshCw size={32} className="spin-slow" />
                    </div>
                  )}
                </div>

                <div className="big-status-content">
                  <div className="big-status-badge-row">
                    <span className={`big-status-type-pill pill-${service.status || 'processing'}`}>
                      {service.status === 'completed'
                        ? 'OFFICIAL APPROVAL GRANTED'
                        : service.status === 'review_required'
                        ? 'ACTION REQUIRED • REVIEW'
                        : service.status === 'rejected'
                        ? 'APPLICATION REJECTED'
                        : 'OFFICIALLY SUBMITTED • IN PROGRESS'}
                    </span>
                    <span className="big-status-ref-tag">
                      Ref: {service.submissionRecord?.referenceNumber || ('MYG-' + service.id.toUpperCase().replace('STEP-', '') + '-882910')}
                    </span>
                  </div>

                  <h2 className="big-status-title">
                    {service.status === 'completed'
                      ? 'Application Approved & Officially Registered'
                      : service.status === 'review_required'
                      ? 'Officer Review & Additional Clarification Required'
                      : service.status === 'rejected'
                      ? 'Application Rejected by Agency'
                      : 'Application Successfully Lodged & Under Active Processing'}
                  </h2>

                  <p className="big-status-desc">
                    {service.status === 'completed'
                      ? `Your statutory application with ${service.agency} has been fully validated, approved, and officially recorded in the National Digital Register. Your official certificate is active and ready.`
                      : service.status === 'review_required'
                      ? `The licensing officer from ${service.agency} has reviewed your filing and requested clarification. Please review the officer's feedback below and update your details.`
                      : service.status === 'rejected'
                      ? `Your application could not be approved due to statutory discrepancies with agency rules. Please review the reasons and resubmit with updated documents.`
                      : `Your application has been received and digitally recorded on the MyGateway portal. Centralized statutory cross-checking against official databases is currently in progress by ${service.agency}.`}
                  </p>

                  <div className="big-status-meta-strip">
                    <div className="meta-item">
                      <span className="meta-k">Submitted At:</span>
                      <span className="meta-v">
                        {service.submissionRecord?.submittedAt
                          ? new Date(service.submissionRecord.submittedAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date().toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="meta-pipe" />
                    <div className="meta-item">
                      <span className="meta-k">Responsible Agency:</span>
                      <span className="meta-v">{service.agency}</span>
                    </div>
                    <div className="meta-pipe" />
                    <div className="meta-item">
                      <span className="meta-k">Estimated Turnaround:</span>
                      <span className="meta-v">{service.timeframe || '1 - 3 Working Days'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. OFFICER ACTION BOX (if Review Required or Rejected) */}
              {(service.status === 'review_required' || service.status === 'rejected') && (
                <div className="officer-feedback-banner">
                  <div className="feedback-top">
                    <AlertTriangle size={20} className="feedback-icon" />
                    <div>
                      <h4>Official Agency Officer Feedback:</h4>
                      <p>{officerNote || (service.status === 'review_required' ? 'Signboard artwork requires DBP Sah Bahasa certificate confirmation.' : 'Information mismatch. Please verify applicant MyKad identity.')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="feedback-action-btn"
                    onClick={() => setIsEditingForm(true)}
                  >
                    Edit Application & Resubmit
                  </button>
                </div>
              )}

              {/* 3. HORIZONTAL TIMELINE UI (100% Aligned 4-Column Units) */}
              <div className="gov-horizontal-timeline-card">
                <div className="timeline-card-header">
                  <h3>Application Lifecycle & Milestone Timeline</h3>
                  <span className="timeline-live-tag">
                    <Clock size={13} /> Real-time Agency SLA Tracking
                  </span>
                </div>

                <div className="horizontal-timeline-stepper">
                  {/* Continuous Connecting Line Behind Nodes */}
                  <div className="timeline-background-track">
                    <div
                      className={`timeline-progress-fill fill-${service.status || 'processing'}`}
                      style={{
                        width: service.status === 'completed'
                          ? '100%'
                          : service.status === 'review_required' || service.status === 'rejected'
                          ? '66.6%'
                          : '33.3%'
                      }}
                    />
                  </div>

                  {/* 4 Stage Units - Perfectly Aligned Columns */}
                  <div className="timeline-columns-grid">

                    {/* Milestone 1 */}
                    <div className="milestone-stage-unit">
                      <span className="unit-date-label label-done">Aug 17</span>
                      <div className="unit-node-wrap node-done">
                        <div className="node-icon-circle">
                          <Check size={16} />
                        </div>
                      </div>
                      <div className="unit-text-details">
                        <span className="milestone-step-tag">Milestone 1</span>
                        <h4 className="milestone-title">Digital Filing Lodged</h4>
                        <p className="milestone-desc">Application & payment received with official timestamp.</p>
                        <span className="milestone-status-pill pill-done">Completed</span>
                      </div>
                    </div>

                    {/* Milestone 2 */}
                    <div className="milestone-stage-unit">
                      <span className={`unit-date-label ${service.status === 'processing' || service.status === 'review_required' || service.status === 'completed' ? 'label-done' : ''}`}>Aug 18</span>
                      <div className={`unit-node-wrap ${service.status === 'completed' || service.status === 'review_required' || service.status === 'rejected' ? 'node-done' : service.status === 'processing' ? 'node-active' : ''}`}>
                        <div className="node-icon-circle">
                          {service.status === 'completed' || service.status === 'review_required' || service.status === 'rejected' ? (
                            <Check size={16} />
                          ) : (
                            <RefreshCw size={14} className="spin-slow" />
                          )}
                        </div>
                      </div>
                      <div className="unit-text-details">
                        <span className="milestone-step-tag">Milestone 2</span>
                        <h4 className="milestone-title">Automated Verification</h4>
                        <p className="milestone-desc">Data cross-checked with JPN, SSM, LHDN & PBT databases.</p>
                        <span className={`milestone-status-pill ${service.status === 'completed' || service.status === 'review_required' || service.status === 'rejected' ? 'pill-done' : 'pill-active'}`}>
                          {service.status === 'completed' || service.status === 'review_required' || service.status === 'rejected' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    {/* Milestone 3 */}
                    <div className="milestone-stage-unit">
                      <span className={`unit-date-label ${service.status === 'review_required' ? 'label-review' : service.status === 'completed' ? 'label-done' : ''}`}>Aug 19</span>
                      <div className={`unit-node-wrap ${service.status === 'completed' ? 'node-done' : service.status === 'review_required' ? 'node-review' : service.status === 'rejected' ? 'node-rejected' : ''}`}>
                        <div className="node-icon-circle">
                          {service.status === 'completed' ? (
                            <Check size={16} />
                          ) : service.status === 'review_required' ? (
                            <AlertTriangle size={15} />
                          ) : service.status === 'rejected' ? (
                            <AlertCircle size={15} />
                          ) : (
                            <span className="node-num">3</span>
                          )}
                        </div>
                      </div>
                      <div className="unit-text-details">
                        <span className="milestone-step-tag">Milestone 3</span>
                        <h4 className="milestone-title">Technical Officer Review</h4>
                        <p className="milestone-desc">Assessment by licensing officer & committee evaluation.</p>
                        <span className={`milestone-status-pill ${service.status === 'completed' ? 'pill-done' : service.status === 'review_required' ? 'pill-review' : service.status === 'rejected' ? 'pill-rejected' : 'pill-pending'}`}>
                          {service.status === 'completed' ? 'Completed' : service.status === 'review_required' ? 'Review Required' : service.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Milestone 4 */}
                    <div className="milestone-stage-unit">
                      <span className={`unit-date-label ${service.status === 'completed' ? 'label-done' : ''}`}>Aug 20</span>
                      <div className={`unit-node-wrap ${service.status === 'completed' ? 'node-completed-final' : ''}`}>
                        <div className="node-icon-circle">
                          {service.status === 'completed' ? (
                            <Award size={18} />
                          ) : (
                            <span className="node-num">4</span>
                          )}
                        </div>
                      </div>
                      <div className="unit-text-details">
                        <span className="milestone-step-tag">Milestone 4</span>
                        <h4 className="milestone-title">Official Approval & Cert</h4>
                        <p className="milestone-desc">Registration approved and digital certificate issued.</p>
                        <span className={`milestone-status-pill ${service.status === 'completed' ? 'pill-done' : 'pill-pending'}`}>
                          {service.status === 'completed' ? 'Active & Issued' : 'Pending'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* 4. COMPLETED QUICK ACTION (View Certificate) */}
              {service.status === 'completed' && (
                <div className="cert-ready-cta-box">
                  <div className="cta-left">
                    <Award size={24} className="cta-icon" />
                    <div>
                      <h4>Official Registration Certificate is Ready</h4>
                      <p>Your official digital certificate with secure verification QR code is available.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="view-cert-cta-btn"
                    onClick={() => setShowCertView(true)}
                  >
                    View Official Digital Certificate
                  </button>
                </div>
              )}

              {/* 5. SIMULATION TOOLBAR (For Testing Lifecycle States) */}
              <div className="gov-simulation-box">
                <span className="sim-head">Simulate Agency Lifecycle Phase:</span>
                <div className="sim-btns">
                  <button
                    type="button"
                    className={`sim-tag-btn ${service.status === 'processing' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('processing')}
                  >
                    ⏳ Processing
                  </button>
                  <button
                    type="button"
                    className={`sim-tag-btn ${service.status === 'review_required' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('review_required')}
                  >
                    ⚠️ Review Required
                  </button>
                  <button
                    type="button"
                    className={`sim-tag-btn ${service.status === 'rejected' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('rejected')}
                  >
                    ❌ Rejected
                  </button>
                  <button
                    type="button"
                    className={`sim-tag-btn ${service.status === 'completed' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('completed')}
                  >
                    ✔ Approved / Completed
                  </button>
                  <button
                    type="button"
                    className="sim-tag-btn"
                    style={{ background: '#f8fafc', color: '#64748b' }}
                    onClick={() => handleSetPhase('ready_to_apply')}
                    title="Reset back to initial unsubmitted form"
                  >
                    📝 Reset to Form
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ServiceWorkspaceView;

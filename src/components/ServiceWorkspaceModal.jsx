import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  ArrowRight,
  RefreshCw,
  Award,
  Lock,
  Paperclip,
  QrCode,
  Printer,
  FileCheck,
  User,
  MapPin,
  Wallet,
  Briefcase,
  Globe
} from 'lucide-react';
import './ServiceWorkspaceModal.css';

const ServiceWorkspaceModal = ({
  isOpen,
  service,
  journey,
  username = 'Jason',
  onClose,
  onUpdateServiceStatus
}) => {
  if (!isOpen || !service) return null;

  const isLocked = service.status === 'locked';

  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'status_timeline' | 'documents'
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [officerNote, setOfficerNote] = useState('');
  const [statutoryAgreed, setStatutoryAgreed] = useState(false);

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
      onUpdateServiceStatus(service.id, 'completed', {
        referenceNumber: refNumber,
        submittedAt: new Date().toISOString(),
        formData: formData,
        output: output
      });
      setActiveTab('status_timeline');
    }, 850);
  };

  // Status simulation actions
  const handleSetPhase = (newStatus) => {
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
        return { label: 'Ready to Apply', className: 'status-ready', icon: <ArrowRight size={12} /> };
    }
  };

  const currentPhase = getPhaseBadge(service.status);

  return (
    <div className="gov-modal-overlay">
      <div className="gov-modal-dialog">

        {/* ── Official Government Portal Header ── */}
        <div className="gov-modal-header">
          <div className="gov-header-left">
            <div className="gov-emblem-badge">
              <Building2 size={20} />
            </div>
            <div>
              <div className="gov-header-meta">
                <span className="gov-agency-title">{service.agency}</span>
                <span className={`gov-phase-pill ${currentPhase.className}`}>
                  {currentPhase.icon}
                  <span>{currentPhase.label}</span>
                </span>
              </div>
              <h2 className="gov-modal-title">{service.title}</h2>
            </div>
          </div>

          <button
            type="button"
            className="gov-close-btn"
            onClick={onClose}
            title="Tutup / Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="gov-nav-tabs">
          <button
            type="button"
            className={`gov-tab ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <FileText size={14} />
            <span>Borang Permohonan / Application Form</span>
          </button>

          <button
            type="button"
            className={`gov-tab ${activeTab === 'status_timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('status_timeline')}
          >
            <Clock size={14} />
            <span>Status & Fasa Proses / Lifecycle</span>
          </button>

          {service.status === 'completed' && (
            <button
              type="button"
              className={`gov-tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <Award size={14} />
              <span>Sijil Digital / Issued Certificate</span>
            </button>
          )}
        </div>

        {/* ── Modal Content Body ── */}
        <div className="gov-modal-body">

          {/* ════════════════════════════════════════════════════════════════════
              TAB 1: GOVERNMENT FORM
             ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmitForm} className="gov-form-layout">

              {/* Compact Information Strip */}
              <div className="gov-summary-strip">
                <div className="summary-item">
                  <span className="summary-label">Tempoh Proses / Timeframe:</span>
                  <span className="summary-val">{service.timeframe || '1 - 3 Hari Bekerja'}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item">
                  <span className="summary-label">Fi Berkanun / Statutory Fee:</span>
                  <span className="summary-val">{service.fee || 'Percuma / Free'}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item">
                  <span className="summary-label">Saluran / Channel:</span>
                  <span className="summary-val">MyGateway e-Service (100% Online)</span>
                </div>
              </div>

              {/* Locked Warning */}
              {isLocked && (
                <div className="gov-alert-strip alert-locked">
                  <Lock size={15} />
                  <span>Prasyarat Diperlukan: Sila lengkapkan permohonan prasyarat terdahulu sebelum menghantar permohonan ini.</span>
                </div>
              )}

              {/* Officer Note */}
              {service.status === 'review_required' && (
                <div className="gov-alert-strip alert-review">
                  <AlertTriangle size={15} />
                  <span>Tindakan Pegawai: {officerNote}</span>
                </div>
              )}

              {/* SECTION 1: MAKLUMAT PEMOHON / APPLICANT DETAILS */}
              <div className="gov-form-section">
                <div className="gov-section-header">
                  <User size={15} className="section-icon" />
                  <span>1. Maklumat Pemohon / Applicant Identification</span>
                </div>

                <div className="gov-grid-2col">
                  <div className="gov-field-row">
                    <label>Nama Penuh (Mengikut MyKad) *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                    />
                  </div>

                  <div className="gov-field-row">
                    <label>No. MyKad / Identity Card No. *</label>
                    <input
                      type="text"
                      required
                      value={formData.icNumber}
                      onChange={(e) => handleChange('icNumber', e.target.value)}
                    />
                  </div>

                  <div className="gov-field-row">
                    <label>No. Telefon Bimbit / Mobile No. *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    />
                  </div>

                  <div className="gov-field-row">
                    <label>Alamat Emel / Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.emailAddress}
                      onChange={(e) => handleChange('emailAddress', e.target.value)}
                    />
                  </div>

                  <div className="gov-field-row full-width">
                    <label>Alamat Kediaman / Residential Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.residentialAddress}
                      onChange={(e) => handleChange('residentialAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: BUTIRAN PERMOHONAN / APPLICATION DETAILS */}
              <div className="gov-form-section">
                <div className="gov-section-header">
                  <Briefcase size={15} className="section-icon" />
                  <span>2. Butiran Pendaftaran & Operasi / Registration Parameters</span>
                </div>

                <div className="gov-grid-2col">
                  {/* SSM Fields */}
                  {service.id.includes('ssm') && (
                    <>
                      <div className="gov-field-row full-width">
                        <label>Cadangan Nama Perniagaan / Proposed Business Trade Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.businessName}
                          onChange={(e) => handleChange('businessName', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Jenis Milikan / Entity Type *</label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => handleChange('businessType', e.target.value)}
                        >
                          <option value="Sole Proprietorship (Pemilikan Tunggal)">Sole Proprietorship (Pemilikan Tunggal)</option>
                          <option value="Partnership (Perkongsian)">Partnership (Perkongsian)</option>
                          <option value="Sdn Bhd (Sendirian Berhad)">Sdn Bhd (Sendirian Berhad)</option>
                        </select>
                      </div>

                      <div className="gov-field-row">
                        <label>Tempoh Pendaftaran / Registration Period *</label>
                        <select
                          value={formData.businessRegPeriod}
                          onChange={(e) => handleChange('businessRegPeriod', e.target.value)}
                        >
                          <option value="1 Year (RM60)">1 Tahun (RM60)</option>
                          <option value="2 Years (RM120)">2 Tahun (RM120)</option>
                          <option value="5 Years (RM300)">5 Tahun (RM300)</option>
                        </select>
                      </div>

                      <div className="gov-field-row full-width">
                        <label>Kod & Klasifikasi Aktiviti Ekonomi (MSIC) *</label>
                        <input
                          type="text"
                          required
                          value={formData.msicCode}
                          onChange={(e) => handleChange('msicCode', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Tarikh Mula Perniagaan / Start Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.businessStartDate}
                          onChange={(e) => handleChange('businessStartDate', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Jenis Premis / Premise Ownership</label>
                        <select
                          value={formData.premiseOwnership}
                          onChange={(e) => handleChange('premiseOwnership', e.target.value)}
                        >
                          <option value="Rented Commercial Shop Lot">Premis Sewa / Rented Commercial</option>
                          <option value="Self-Owned Commercial Property">Milik Sendiri / Owned Property</option>
                          <option value="Home / Online Based">Dalam Talian / Online Based</option>
                        </select>
                      </div>

                      <div className="gov-field-row full-width">
                        <label>Alamat Tempat Utama Perniagaan / Principal Business Address *</label>
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
                      <div className="gov-field-row">
                        <label>No. Pendaftaran SSM Disahkan *</label>
                        <input
                          type="text"
                          required
                          value={formData.ssmNumber}
                          onChange={(e) => handleChange('ssmNumber', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Pihak Berkuasa Tempatan (PBT) *</label>
                        <select
                          value={formData.localCouncil}
                          onChange={(e) => handleChange('localCouncil', e.target.value)}
                        >
                          <option value="Dewan Bandaraya Kuala Lumpur (DBKL)">Dewan Bandaraya Kuala Lumpur (DBKL)</option>
                          <option value="Majlis Bandaraya Petaling Jaya (MBPJ)">Majlis Bandaraya Petaling Jaya (MBPJ)</option>
                          <option value="Majlis Bandaraya Shah Alam (MBSA)">Majlis Bandaraya Shah Alam (MBSA)</option>
                          <option value="Majlis Perbandaran Kajang (MPKJ)">Majlis Perbandaran Kajang (MPKJ)</option>
                        </select>
                      </div>

                      <div className="gov-field-row full-width">
                        <label>Alamat Premis Beroperasi *</label>
                        <input
                          type="text"
                          required
                          value={formData.premiseAddress}
                          onChange={(e) => handleChange('premiseAddress', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Keluasan Lantai Premis ($m^2$) *</label>
                        <input
                          type="text"
                          required
                          value={formData.premiseFloorArea}
                          onChange={(e) => handleChange('premiseFloorArea', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Tempoh Perjanjian Sewa Premis *</label>
                        <input
                          type="text"
                          required
                          value={formData.tenancyDuration}
                          onChange={(e) => handleChange('tenancyDuration', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Perkataan Papan Tanda (Bahasa Melayu) *</label>
                        <input
                          type="text"
                          required
                          value={formData.signboardWording}
                          onChange={(e) => handleChange('signboardWording', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>No. Rujukan Sijil DBP Sah Bahasa *</label>
                        <input
                          type="text"
                          required
                          value={formData.dbpCertNo}
                          onChange={(e) => handleChange('dbpCertNo', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>No. Sijil Latihan Pengendali Makanan (SLPM) *</label>
                        <input
                          type="text"
                          required
                          value={formData.slpmCert}
                          onChange={(e) => handleChange('slpmCert', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>No. Kad Suntikan Typhoid (TY2) *</label>
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
                      <div className="gov-field-row">
                        <label>Kategori Fail Cukai Pendapatan *</label>
                        <select
                          value={formData.taxFileCategory}
                          onChange={(e) => handleChange('taxFileCategory', e.target.value)}
                        >
                          <option value="Individual with Business Income (Borang B)">Individu Berniaga (Borang B)</option>
                          <option value="Company / Enterprise (Borang C)">Syarikat / Perkongsian (Borang C)</option>
                        </select>
                      </div>

                      <div className="gov-field-row">
                        <label>No. Pengenalan Cukai (TIN) *</label>
                        <input
                          type="text"
                          required
                          value={formData.tinNumber}
                          onChange={(e) => handleChange('tinNumber', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Kaedah Integrasi MyInvois *</label>
                        <select
                          value={formData.eInvoicingMethod}
                          onChange={(e) => handleChange('eInvoicingMethod', e.target.value)}
                        >
                          <option value="MyInvois Portal & Open API Gateway">Portal MyInvois & Gateway API</option>
                          <option value="Direct ERP / POS Integration">Integrasi Terus ERP / POS</option>
                        </select>
                      </div>

                      <div className="gov-field-row">
                        <label>Anggaran Pendapatan Tahunan *</label>
                        <select
                          value={formData.turnoverBracket}
                          onChange={(e) => handleChange('turnoverBracket', e.target.value)}
                        >
                          <option value="Under RM150,000 / year">Bawah RM150,000 / tahun</option>
                          <option value="RM150,000 - RM500,000 / year">RM150,000 - RM500,000 / tahun</option>
                          <option value="RM500,000 - RM1,000,000 / year">RM500,000 - RM1,000,000 / tahun</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* JAKIM Halal Fields */}
                  {service.id.includes('jakim') && (
                    <>
                      <div className="gov-field-row">
                        <label>Skim Pensijilan Halal *</label>
                        <select
                          value={formData.halalScheme}
                          onChange={(e) => handleChange('halalScheme', e.target.value)}
                        >
                          <option value="Food & Beverage Premise / Restaurant">Premis Makanan & Minuman / Restoran</option>
                          <option value="Food Manufacturing">Pengilangan Makanan</option>
                        </select>
                      </div>

                      <div className="gov-field-row">
                        <label>No. Eksekutif Halal Diiktiraf *</label>
                        <input
                          type="text"
                          required
                          value={formData.halalExecutiveId}
                          onChange={(e) => handleChange('halalExecutiveId', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Bilangan Pengendali Muslim *</label>
                        <input
                          type="text"
                          required
                          value={formData.muslimStaffCount}
                          onChange={(e) => handleChange('muslimStaffCount', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Kontraktor Kawalan Makhluk Perosak *</label>
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
                      <div className="gov-field-row">
                        <label>No. Akaun Simpan SSPN Disahkan *</label>
                        <input
                          type="text"
                          required
                          value={formData.sspnNumber}
                          onChange={(e) => handleChange('sspnNumber', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Institusi Pengajian Tinggi (IPTA / IPTS) *</label>
                        <input
                          type="text"
                          required
                          value={formData.institution}
                          onChange={(e) => handleChange('institution', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Nama Program / Kursus Pengajian *</label>
                        <input
                          type="text"
                          required
                          value={formData.programme}
                          onChange={(e) => handleChange('programme', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Kod Rujukan Akreditasi MQA *</label>
                        <input
                          type="text"
                          required
                          value={formData.mqaCode}
                          onChange={(e) => handleChange('mqaCode', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>Nama Bank Pembayaran Pinjaman *</label>
                        <input
                          type="text"
                          required
                          value={formData.disbursementBank}
                          onChange={(e) => handleChange('disbursementBank', e.target.value)}
                        />
                      </div>

                      <div className="gov-field-row">
                        <label>No. Akaun Bank Pemohon *</label>
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
                      <div className="gov-field-row full-width">
                        <label>Keterangan & Tujuan Permohonan *</label>
                        <input
                          type="text"
                          required
                          defaultValue={service.description || 'Permohonan perkhidmatan awam kerajaan'}
                        />
                      </div>
                      <div className="gov-field-row">
                        <label>Cawangan / Kaunter Pilihan</label>
                        <select defaultValue="Putrajaya / UTC KL">
                          <option value="Putrajaya / UTC KL">Putrajaya / UTC KL</option>
                          <option value="UTC Selangor">UTC Selangor</option>
                          <option value="UTC Penang">UTC Penang</option>
                        </select>
                      </div>
                      <div className="gov-field-row">
                        <label>No. Rujukan Dokumen</label>
                        <input type="text" defaultValue="MYG-DOC-2026-88124" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION 3: SENARAI DOKUMEN & LAMPIRAN */}
              <div className="gov-form-section">
                <div className="gov-section-header">
                  <Paperclip size={15} className="section-icon" />
                  <span>3. Dokumen Sokongan / Supporting Documents</span>
                </div>

                <div className="gov-attachments-grid">
                  <div className="gov-doc-row">
                    <span className="doc-name">Salinan Kad Pengenalan MyKad (Depan & Belakang)</span>
                    <span className="doc-pill verified">Disahkan JPN</span>
                  </div>

                  {service.id.includes('ssm') && (
                    <div className="gov-doc-row">
                      <span className="doc-name">Perjanjian Sewa Premis / Geran Hakmilik</span>
                      <span className="doc-pill attached">Dilampirkan</span>
                    </div>
                  )}

                  {service.id.includes('pbt') && (
                    <>
                      <div className="gov-doc-row">
                        <span className="doc-name">Sijil Pendaftaran SSM (Borang D / Borang E)</span>
                        <span className="doc-pill verified">Disahkan SSM</span>
                      </div>
                      <div className="gov-doc-row">
                        <span className="doc-name">Sijil Latihan SLPM KKM & Kad Suntikan Typhoid TY2</span>
                        <span className="doc-pill verified">Disahkan KKM</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION 4: PERAKUAN BERKANUN */}
              <div className="gov-declaration-box">
                <label className="gov-checkbox-row">
                  <input
                    type="checkbox"
                    required
                    checked={statutoryAgreed}
                    onChange={(e) => setStatutoryAgreed(e.target.checked)}
                    disabled={isLocked}
                  />
                  <span>
                    Saya dengan ini mengesahkan dan memperakui bahawa segala maklumat dan dokumen yang dikemukakan adalah benar dan tepat di bawah <strong>Akta Akuan Berkanun 1960</strong>. / I hereby declare under the Statutory Declarations Act 1960 that all information provided is authentic and correct.
                  </span>
                </label>
              </div>

              {/* Sticky Form Actions Bar */}
              <div className="gov-modal-actions">
                <button
                  type="button"
                  className="gov-btn-secondary"
                  onClick={onClose}
                >
                  Tutup / Close
                </button>

                {!isLocked ? (
                  <button
                    type="submit"
                    className="gov-btn-primary"
                    disabled={isSubmitting || !statutoryAgreed}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" />
                        <span>Menghantar ke Agensi...</span>
                      </>
                    ) : service.status === 'completed' ? (
                      <>
                        <RefreshCw size={14} />
                        <span>Kemas Kini & Hantar Semula</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Hantar Permohonan / Submit Application</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="gov-locked-label">
                    <Lock size={13} />
                    <span>Lengkapkan prasyarat untuk menghantar.</span>
                  </div>
                )}
              </div>

            </form>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 2: LIFECYCLE TIMELINE & SIMULATION
             ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'status_timeline' && (
            <div className="gov-timeline-view">

              {/* Simulation Switcher */}
              <div className="gov-sim-toolbar">
                <span className="sim-title">Uji Fasa Proses / Test Lifecycle Phase:</span>
                <div className="sim-btn-group">
                  <button
                    type="button"
                    className={`gov-sim-btn ${service.status === 'ready_to_apply' || service.status === 'pending' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('ready_to_apply')}
                  >
                    Sedia / Ready
                  </button>
                  <button
                    type="button"
                    className={`gov-sim-btn ${service.status === 'processing' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('processing')}
                  >
                    Diproses / Processing
                  </button>
                  <button
                    type="button"
                    className={`gov-sim-btn ${service.status === 'review_required' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('review_required')}
                  >
                    Semakan / Review
                  </button>
                  <button
                    type="button"
                    className={`gov-sim-btn ${service.status === 'rejected' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('rejected')}
                  >
                    Ditolak / Rejected
                  </button>
                  <button
                    type="button"
                    className={`gov-sim-btn ${service.status === 'completed' ? 'active' : ''}`}
                    onClick={() => handleSetPhase('completed')}
                  >
                    Lulus / Completed
                  </button>
                </div>
              </div>

              {/* Lifecycle Track */}
              <div className="gov-lifecycle-track">
                <div className={`gov-track-node ${service.status !== 'ready_to_apply' && service.status !== 'locked' ? 'node-passed' : 'node-current'}`}>
                  <div className="track-bullet">1</div>
                  <div className="track-content">
                    <h4>Penerimaan Permohonan / Digital Filing</h4>
                    <p>Permohonan diterima secara digital dengan rekod masa rasmi gerbang MyGateway.</p>
                  </div>
                </div>

                <div className={`gov-track-node ${service.status === 'processing' || service.status === 'review_required' || service.status === 'completed' ? (service.status === 'completed' ? 'node-passed' : 'node-current') : ''}`}>
                  <div className="track-bullet">2</div>
                  <div className="track-content">
                    <h4>Semakan Dokumen & Pengesahan Pangkalan Data</h4>
                    <p>Pengesahan silang data automatik dengan pangkalan data JPN, SSM, LHDN dan PBT.</p>
                  </div>
                </div>

                <div className={`gov-track-node ${service.status === 'review_required' ? 'node-current' : service.status === 'completed' ? 'node-passed' : ''}`}>
                  <div className="track-bullet">3</div>
                  <div className="track-content">
                    <h4>Penilaian Teknikal & Pegawai Agensi</h4>
                    <p>Penilaian oleh pegawai pelesenan dan kelulusan teknikal jawatankuasa agensi.</p>
                  </div>
                </div>

                <div className={`gov-track-node ${service.status === 'completed' ? 'node-passed node-current' : ''}`}>
                  <div className="track-bullet">4</div>
                  <div className="track-content">
                    <h4>Kelulusan Berkanun & Pengeluaran Sijil Digital</h4>
                    <p>Pendaftaran diluluskan secara rasmi dan sijil digital sah boleh dimuat turun.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 3: OFFICIAL DIGITAL CERTIFICATE
             ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'documents' && (
            <div className="gov-cert-view">
              <div className="gov-cert-sheet">
                <div className="cert-crest-center">
                  <Building2 size={26} />
                </div>
                <h2 className="cert-gov-title">KERAJAAN MALAYSIA</h2>
                <h3 className="cert-agency-title">{service.agency.toUpperCase()}</h3>
                <h4 className="cert-doc-type">SIJIL PENDAFTARAN DIGITAL RASMI</h4>

                <div className="cert-details-table">
                  <div className="cert-table-row">
                    <span className="c-key">No. Siri Sijil / Serial No:</span>
                    <span className="c-val c-code">{service.submissionRecord?.referenceNumber || 'MYG-SSM-2026-891024'}</span>
                  </div>

                  <div className="cert-table-row">
                    <span className="c-key">Nama Perniagaan / Entiti:</span>
                    <span className="c-val">{formData.businessName || formData.fullName}</span>
                  </div>

                  <div className="cert-table-row">
                    <span className="c-key">No. Kad Pengenalan Pemilik:</span>
                    <span className="c-val c-code">{formData.icNumber}</span>
                  </div>

                  <div className="cert-table-row">
                    <span className="c-key">Alamat Premis Beroperasi:</span>
                    <span className="c-val">{formData.premiseAddress || formData.residentialAddress}</span>
                  </div>

                  <div className="cert-table-row">
                    <span className="c-key">Tarikh Pengeluaran / Issued Date:</span>
                    <span className="c-val">{new Date(service.submissionRecord?.submittedAt || Date.now()).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <div className="cert-table-row">
                    <span className="c-key">Status Berkanun:</span>
                    <span className="c-val c-status">AKTIF & SAH DI BAWAH AKTA BERKANUN</span>
                  </div>
                </div>

                <div className="cert-auth-strip">
                  <div className="qr-box">
                    <QrCode size={44} />
                    <span>Imbas untuk Semakan Rasmi MyGateway</span>
                  </div>
                  <div className="seal-box">
                    <div className="seal-round">
                      <FileCheck size={20} />
                      <span>MOHOR RASMI</span>
                    </div>
                  </div>
                </div>

                <div className="cert-button-row">
                  <button
                    type="button"
                    className="gov-btn-secondary"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} />
                    <span>Cetak / Print</span>
                  </button>

                  <button
                    type="button"
                    className="gov-btn-primary"
                    onClick={() => alert('Sijil PDF rasmi berjaya dimuat turun.')}
                  >
                    <Download size={14} />
                    <span>Muat Turun PDF Rasmi</span>
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

export default ServiceWorkspaceModal;

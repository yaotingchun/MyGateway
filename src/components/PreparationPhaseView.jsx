import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  ArrowRight,
  RefreshCw,
  Lock,
  Paperclip,
  User,
  Briefcase,
  Upload,
  Sparkles,
  ShieldCheck,
  Eye,
  X,
  FileCheck,
  HelpCircle,
  Save,
  CheckCircle,
  Clock,
  Zap,
  RotateCcw,
  ShieldAlert,
  Database,
  CheckCheck,
  CornerDownRight
} from 'lucide-react';
import { getProfile, saveProfile } from '../utils/profileStore';
import './PreparationPhaseView.css';

const DEFAULT_DOC_GUIDELINES = {
  ssm_tenancy: {
    title: 'Commercial Tenancy Agreement Guidelines',
    authority: 'Companies Commission of Malaysia (SSM) & Stamp Act 1949',
    description: 'Official tenancy agreement between property owner and tenant validating the statutory right to occupy business premises.',
    requirements: [
      'Owner and tenant full names and MyKad / Passport numbers must match official records.',
      'Complete premise address including unit/lot number, floor, road name, and postcode.',
      'Valid official LHDN Stamp Duty Certificate attached with active endorsement.',
      'Active tenancy period with clear commencement and expiry dates (minimum 12 months).',
      'Signed by both parties and witnessing party.'
    ],
    commonRejections: [
      'Expired LHDN stamp duty certificate or missing official stamping receipt.',
      'Tenant name does not match the applicant official name.',
      'Premise address on agreement differs from SSM registration address.'
    ]
  },
  pbt_signboard: {
    title: 'Business Signboard Visual & DBP Approval Guidelines',
    authority: 'Institute of Language and Literature (DBP) & Local Authority (PBT)',
    description: 'Visual artwork for commercial premise signboard adhering to national language prominence and municipal advertising bylaws.',
    requirements: [
      'Bahasa Melayu must be prioritized in visual font size (minimum 30% larger than other languages).',
      'Valid DBP Language Approval Certificate reference code (e.g. DBP/2026/FNB/08912).',
      'Exact dimensions (Length x Width x Height in metres) clearly specified.',
      'Illumination type declared (LED, Spotlight, or Non-Illuminated).',
      'Full-colour facade visual depicting signboard placement on premise.'
    ],
    commonRejections: [
      'Bahasa Melayu positioned below or smaller than other languages.',
      'Submitting visual without prior DBP language verification code.',
      'Dimensions exceed allowable building frontage limits.'
    ]
  },
  kkm_food: {
    title: 'Food Handler Training (SLPM) & Typhoid Vaccine Guidelines',
    authority: 'Ministry of Health Malaysia (KKM) - Food Hygiene Regulations 2009',
    description: 'Mandatory qualification for all food handlers to ensure food hygiene and consumer safety.',
    requirements: [
      'Food Handler Training Certificate (SLPM) from a KKM-accredited training institution.',
      'Valid Typhoid Vaccination Card (TY2) from a registered medical clinic (valid for 3 years).',
      'Food handler full name and MyKad on certificate must match records.',
      'Certificates must be within their statutory validity period.'
    ],
    commonRejections: [
      'Typhoid vaccination expired beyond the 3-year validity window.',
      'Training certificate issued by an unaccredited training provider.'
    ]
  },
  ptptn_offer: {
    title: 'Higher Education Admission Offer Guidelines',
    authority: 'National Higher Education Fund Corporation (PTPTN) & MQA',
    description: 'Official letter of admission to higher educational institutions for study loan financing.',
    requirements: [
      'Official admission offer on university / college letterhead.',
      'Study programme name with valid MQA accreditation reference number.',
      'Registration date, course duration, and semester fee breakdown.',
      'Student full name and MyKad matching the Simpan SSPN account.'
    ],
    commonRejections: [
      'Study programme has not received full/provisional MQA accreditation.',
      'Simpan SSPN account not opened prior to application date.'
    ]
  },
  generic: {
    title: 'Official Supporting Document Guidelines',
    authority: 'Government of Malaysia - MyGateway Public Portal',
    description: 'Standard statutory requirements for submitting official government supporting documents.',
    requirements: [
      'Document copy must be sharp, clear, and fully legible with all 4 corners visible.',
      'Physical copies must be certified as Certified True Copy (CTC) where applicable.',
      'Accepted file formats: PDF, JPG, or PNG (Maximum 10MB per file).',
      'Documents in foreign languages must be accompanied by certified court/ITBM translation.'
    ],
    commonRejections: [
      'Blurry, low-resolution images or OCR-unreadable text.',
      'Missing official CTC stamp if mandated by agency regulations.'
    ]
  }
};

const DOC_REQUIREMENTS_SPECS = {
  title: 'Document Quality & Official Certification (CTC) Guidelines',
  specs: [
    { label: 'Accepted Formats', value: 'PDF (.pdf), JPEG (.jpg, .jpeg), PNG (.png)' },
    { label: 'Maximum File Size', value: '10 MB per document' },
    { label: 'Minimum Resolution', value: '300 DPI (High-resolution, sharp text)' },
    { label: 'Image Integrity', value: 'All 4 corners visible, no glare or shadows' },
    { label: 'Document Language', value: 'Bahasa Melayu or English only' }
  ],
  ctcGuide: {
    title: 'How to Certify Documents (Certified True Copy / Salinan Diakui Sah - CTC)',
    description: 'When submitting photocopies of official physical documents, Malaysian government agencies require certification by an authorized person.',
    authorizedOfficers: [
      'Government Officers in Management & Professional Group (Gred 41 and above e.g. PTD, Medical Officer, Engineers).',
      'Commissioner for Oaths (Pesuruhjaya Sumpah) registered with the Chief Registrar of the Federal Court.',
      'Advocates & Solicitors of the High Court of Malaya / Sabah & Sarawak with active practicing certificates.',
      'Justice of the Peace (Jaksa Pendamai - JP).',
      'School Principals / Headmasters (Guru Besar / Pengetua) of Government Schools.',
      'Gazetted Village Heads (Penghulu / Ketua Kampung) with official authority seal.'
    ],
    stampRequirements: [
      'Official Rubber Stamp must contain: Full Name, Official Designation / Title, Grade (Gred 41+), and Department / Ministry.',
      'Original blue or black ink signature across the stamp with the endorsement date.',
      'Endorsement wording: "Disahkan Salinan Diakui Sah daripada Dokumen Asal" or "Certified True Copy of the Original".',
      'Every individual page of a multi-page document must be stamped and initialed.'
    ]
  },
  stampingGuide: {
    title: 'Statutory Duty Stamping (LHDN STAMPS)',
    rules: [
      'Tenancy agreements and official contracts must be stamped online via LHDN STAMPS (stamps.hasil.gov.my) or UTC LHDN counters.',
      'Attach the official Certificate of Stamping (Sijil Setem) containing the valid Adjudication No. & QR Code verification.'
    ]
  },
  translationGuide: {
    title: 'Official Translation Requirements',
    rules: [
      'Documents in foreign languages (other than Bahasa Melayu or English) must be accompanied by a certified translation from the Malaysian Institute of Translation & Books (ITBM) or Certified Court Interpreter.'
    ]
  }
};

export default function PreparationPhaseView({
  activeApp,
  username = 'Jason',
  onCompletePreparation,
  lang = 'en'
}) {
  const steps = activeApp?.journey?.steps || [];

  const [selectedServiceId, setSelectedServiceId] = useState(steps[0]?.id || '');
  const [profileData, setProfileData] = useState({});
  
  // Specific fields start EMPTY so the citizen sees general profile data is retrieved from JPN/PADU,
  // but agency-specific parameters are to be entered or demo-autofilled via Ctrl+Enter.
  const [servicePreparationState, setServicePreparationState] = useState(() => {
    const initialPrep = {};
    steps.forEach((st) => {
      if (!st || !st.id) return;
      initialPrep[st.id] = {
        customFields: {
          businessName: '',
          premiseAddress: '',
          signboardWording: '',
          dbpCode: '',
          floorArea: '',
          turnoverBracket: '',
          muslimStaffCount: '',
          bankAccountNo: '',
          sspnAccount: '',
          specificNotes: ''
        },
        uploadedDocs: {
          identityDoc: { name: 'Applicant_MyKad_Front_Back.pdf', size: '1.2 MB', uploaded: true, aiChecked: true, aiScore: 99, status: 'passed' },
          tenancyDoc: { name: '', size: '', uploaded: false, aiChecked: false, aiScore: 0, status: 'idle', attempt: 0 },
          signboardDoc: { name: '', size: '', uploaded: false, aiChecked: false, aiScore: 0, status: 'idle', attempt: 0 },
          slpmDoc: { name: 'SLPM_Food_Handler_Cert_Typhoid_TY2.pdf', size: '1.9 MB', uploaded: true, aiChecked: true, aiScore: 96, status: 'passed' },
          ptptnDoc: { name: '', size: '', uploaded: false, aiChecked: false, aiScore: 0, status: 'idle', attempt: 0 }
        },
        aiCheckingInProgress: false,
        isCompleted: false
      };
    });
    return initialPrep;
  });

  // Track document submission attempts for demo (1st fail, 2nd pass)
  const [docAttempts, setDocAttempts] = useState({
    tenancyDoc: 0,
    signboardDoc: 0,
    identityDoc: 1,
    slpmDoc: 1,
    ptptnDoc: 0
  });

  const [activeGuidelineModal, setActiveGuidelineModal] = useState(null);
  const [showDocReqModal, setShowDocReqModal] = useState(false);
  const [permissionToSave, setPermissionToSave] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isAutofillFlashing, setIsAutofillFlashing] = useState(false);
  const [showSavePromptModal, setShowSavePromptModal] = useState(false);

  // Synchronize active service selection if activeApp changes
  useEffect(() => {
    if (steps.length > 0 && (!selectedServiceId || !steps.some((s) => s.id === selectedServiceId))) {
      setSelectedServiceId(steps[0].id);
    }
  }, [steps, selectedServiceId]);

  // Load user profile on mount (General verified citizen data)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const prof = await getProfile(username);
        if (!isMounted) return;
        setProfileData(prof || {});
      } catch (err) {
        console.warn('[PreparationPhaseView] profile load notice:', err);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [username]);

  const activeService = steps.find((s) => s.id === selectedServiceId) || steps[0] || {
    id: 'step-ssm',
    agency: 'Suruhanjaya Syarikat Malaysia (SSM)',
    title: 'SSM Business Registration (EzBiz)',
    description: 'Official enterprise entity registration.'
  };

  const serviceId = (activeService?.id || '').toLowerCase();
  const isSsm = serviceId.includes('ssm');
  const isPbt = serviceId.includes('pbt');
  const isLhdn = serviceId.includes('lhdn');
  const isJakim = serviceId.includes('jakim');
  const isPtptn = serviceId.includes('ptptn');

  const currentServicePrep = (activeService?.id && servicePreparationState[activeService.id]) ||
    servicePreparationState[selectedServiceId] || {
      customFields: {},
      uploadedDocs: {},
      aiCheckingInProgress: false,
      isCompleted: false
    };

  // Handle missing field change
  const handleFieldChange = (key, val) => {
    const sId = activeService.id || selectedServiceId;
    setServicePreparationState((prev) => ({
      ...prev,
      [sId]: {
        ...prev[sId],
        customFields: {
          ...prev[sId]?.customFields,
          [key]: val
        }
      }
    }));
  };

  // Quick autofill demo function triggered by Ctrl+Enter (with 0.5s delay before prompt)
  const handleQuickDemoAutofill = () => {
    const demoDataByService = {
      ssm: {
        businessName: 'Kopi & Roti Heritage Enterprise',
        premiseAddress: 'No. 18, Ground Floor, Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur'
      },
      pbt: {
        signboardWording: 'RESTORAN KOPI & ROTI HERITAGE',
        dbpCode: 'DBP/2026/FNB/08912',
        floorArea: '145.5 sq metres'
      },
      lhdn: {
        turnoverBracket: 'RM150,000 - RM500,000 / year'
      },
      jakim: {
        muslimStaffCount: '3 Trained Muslim Handlers'
      },
      ptptn: {
        sspnAccount: 'SSPN-10894218'
      }
    };

    setServicePreparationState((prev) => {
      const next = { ...prev };
      steps.forEach((st) => {
        const id = (st.id || '').toLowerCase();
        let demoFields = { specificNotes: 'All information verified compliant with statutory rules' };
        if (id.includes('ssm')) demoFields = { ...demoFields, ...demoDataByService.ssm };
        else if (id.includes('pbt')) demoFields = { ...demoFields, ...demoDataByService.pbt };
        else if (id.includes('lhdn')) demoFields = { ...demoFields, ...demoDataByService.lhdn };
        else if (id.includes('jakim')) demoFields = { ...demoFields, ...demoDataByService.jakim };
        else if (id.includes('ptptn')) demoFields = { ...demoFields, ...demoDataByService.ptptn };

        next[st.id] = {
          ...next[st.id],
          customFields: {
            ...next[st.id]?.customFields,
            ...demoFields
          }
        };
      });
      return next;
    });

    // Trigger visual highlight flash
    setIsAutofillFlashing(true);
    setTimeout(() => setIsAutofillFlashing(false), 1200);

    // 0.5s delay after everything is filled before prompting user
    setTimeout(() => {
      setShowSavePromptModal(true);
    }, 500);
  };

  // Keyboard shortcut listener for Ctrl + Enter / Cmd + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleQuickDemoAutofill();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeService, selectedServiceId, steps]);

  // Handle Save New Information to Central Profile
  const handleSaveToProfile = async () => {
    if (!permissionToSave) return;
    setIsSavingProfile(true);
    setSaveSuccessMsg(false);

    try {
      const currentFields = currentServicePrep.customFields || {};
      await saveProfile(username, {
        ...profileData,
        ...currentFields,
      });

      // Update local profile data
      setProfileData((prev) => ({
        ...prev,
        ...currentFields
      }));

      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
    } catch (err) {
      console.error('Failed to save to profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Upload or attach sample document
  const handleAttachDocument = (docKey, docName, fileSize) => {
    const sId = activeService.id || selectedServiceId;
    setServicePreparationState((prev) => ({
      ...prev,
      [sId]: {
        ...prev[sId],
        uploadedDocs: {
          ...prev[sId]?.uploadedDocs,
          [docKey]: {
            name: docName,
            size: fileSize,
            uploaded: true,
            aiChecked: false,
            aiScore: 0,
            status: 'idle'
          }
        }
      }
    }));
  };

  // Trigger AI Document Checking simulation with 2-stage Demo (1st fail: blurry, 2nd pass: clear)
  const handleRunAiCheck = (docKey) => {
    const sId = activeService.id || selectedServiceId;
    setServicePreparationState((prev) => ({
      ...prev,
      [sId]: {
        ...prev[sId],
        aiCheckingInProgress: true
      }
    }));

    const currentAttempt = docAttempts[docKey] || 0;

    setTimeout(() => {
      if (currentAttempt === 0) {
        // 1st Attempt: Verification Fails (Simple rejection reason: document too blurry)
        setDocAttempts((prev) => ({ ...prev, [docKey]: 1 }));
        setServicePreparationState((prev) => ({
          ...prev,
          [sId]: {
            ...prev[sId],
            aiCheckingInProgress: false,
            uploadedDocs: {
              ...prev[sId]?.uploadedDocs,
              [docKey]: {
                name: docKey === 'tenancyDoc' ? 'Tenancy_Agreement_Bangsar_Draft.pdf' : (docKey === 'signboardDoc' ? 'Signboard_Visual_Draft.pdf' : 'Uploaded_Document_Draft.pdf'),
                size: '2.1 MB',
                uploaded: true,
                aiChecked: true,
                aiScore: 40,
                status: 'failed',
                attempt: 1,
                rejectionReason: 'Document is too blurry and illegible (< 150 DPI). Please upload a clear, high-resolution copy.',
                aiPassedDesc: null
              }
            }
          }
        }));
      } else {
        // 2nd Attempt: Verification Passes (Clear copy)
        setDocAttempts((prev) => ({ ...prev, [docKey]: 2 }));
        setServicePreparationState((prev) => ({
          ...prev,
          [sId]: {
            ...prev[sId],
            aiCheckingInProgress: false,
            uploadedDocs: {
              ...prev[sId]?.uploadedDocs,
              [docKey]: {
                name: docKey === 'tenancyDoc' ? 'Tenancy_Agreement_Bangsar_Stamped_Clear.pdf' : (docKey === 'signboardDoc' ? 'Signboard_Visual_DBP_Approved_Final_v2.pdf' : 'Uploaded_Document_Clear.pdf'),
                size: '3.8 MB',
                uploaded: true,
                aiChecked: true,
                aiScore: 98,
                status: 'passed',
                attempt: 2,
                rejectionReason: null,
                aiPassedDesc: 'Document verified successfully: 300 DPI high-resolution scan verified and compliant.'
              }
            }
          }
        }));
      }
    }, 900);
  };

  // Reset Document Demo Attempt for testing again
  const handleResetDocDemo = (docKey) => {
    const sId = activeService.id || selectedServiceId;
    setDocAttempts((prev) => ({ ...prev, [docKey]: 0 }));
    setServicePreparationState((prev) => ({
      ...prev,
      [sId]: {
        ...prev[sId],
        uploadedDocs: {
          ...prev[sId]?.uploadedDocs,
          [docKey]: {
            name: '',
            size: '',
            uploaded: false,
            aiChecked: false,
            aiScore: 0,
            status: 'idle',
            attempt: 0,
            rejectionReason: null,
            aiPassedDesc: null
          }
        }
      }
    }));
  };

  // Check if all services are prepared (all required docs uploaded and not failed)
  const preparedServicesCount = Object.keys(servicePreparationState).filter((k) => {
    const p = servicePreparationState[k];
    const docs = p?.uploadedDocs || {};
    const docList = Object.values(docs);
    const hasPassedDocs = docList.some((d) => d.uploaded && d.aiChecked && d.status !== 'failed');
    return hasPassedDocs;
  }).length;

  return (
    <section className="phase-section prep-module-section">

      {/* ── Module Header (100% Aligned with Step 1 & Step 3) ── */}
      <div className="services-module-header">
        <div className="services-header-info">
          <div className="services-icon-pill">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="services-module-title">Step 2: Pre-Application Preparation</h3>
            <p className="services-module-subtitle">
              Prepare and retrieve verified details from your profile, and verify required documents with AI before submitting official applications.
            </p>
          </div>
        </div>

        {/* Progress Summary Pill */}
        <div className="services-overall-progress">
          <span className="progress-pill-label">
            {preparedServicesCount} of {steps.length} Services Prepared
          </span>
          <div className="services-progress-track">
            <div
              className="services-progress-fill"
              style={{ width: `${(preparedServicesCount / (steps.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Service Tabs Switcher ── */}
      <div className="prep-service-tabs-grid">
        {steps.map((st, idx) => {
          const isSelected = st.id === selectedServiceId;
          const prep = servicePreparationState[st.id];
          const hasCheckedDoc = Object.values(prep?.uploadedDocs || {}).some((d) => d.uploaded && d.aiChecked);

          // Generate concise agency badge label
          const fullAgency = st?.agency || '';
          let agencyBadge = 'AGENCY';
          if (fullAgency.includes('SSM') || st.id.includes('ssm')) agencyBadge = 'SSM';
          else if (fullAgency.includes('PBT') || fullAgency.includes('Local Council') || st.id.includes('pbt')) agencyBadge = 'PBT / DBKL';
          else if (fullAgency.includes('LHDN') || st.id.includes('lhdn')) agencyBadge = 'LHDN';
          else if (fullAgency.includes('JAKIM') || st.id.includes('jakim')) agencyBadge = 'JAKIM';
          else if (fullAgency.includes('PTPTN') || st.id.includes('ptptn')) agencyBadge = 'PTPTN';
          else if (st.agency) agencyBadge = st.agency.split('(')[0].trim();

          return (
            <button
              key={st.id || idx}
              type="button"
              className={`prep-service-tab-card ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedServiceId(st.id)}
            >
              <div className="tab-card-header">
                <div className="tab-step-badge">
                  <span className="tab-step-number">{idx + 1}</span>
                  <span className="tab-agency-pill">{agencyBadge}</span>
                </div>
                {hasCheckedDoc ? (
                  <span className="tab-status-pill status-ready">
                    <CheckCircle2 size={12} />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="tab-status-pill status-pending">
                    <Clock size={12} />
                    <span>Pending</span>
                  </span>
                )}
              </div>

              <div className="tab-card-body">
                <h4 className="tab-card-title" title={st.title}>{st.title}</h4>
              </div>

              {isSelected && <div className="tab-active-indicator" />}
            </button>
          );
        })}
      </div>

      {/* ── Active Service Preparation Container ── */}
      {activeService && (
        <div className="prep-active-service-card">

          {/* Service Banner */}
          <div className="prep-service-banner">
            <div className="service-banner-left">
              <div className="service-banner-icon-wrap">
                <Building2 size={24} />
              </div>
              <div className="service-banner-text">
                <div className="service-banner-agency-row">
                  <span className="banner-agency-tag">{activeService.agency || 'Government Agency'}</span>
                  <span className="banner-step-tag">
                    Step {steps.findIndex((s) => s.id === activeService.id) + 1} of {steps.length}
                  </span>
                </div>
                <h3 className="banner-title">{activeService.title}</h3>
              </div>
            </div>

            <button
              type="button"
              className="doc-req-guidelines-btn"
              onClick={() => setShowDocReqModal(true)}
              title="View official document formats & specifications"
            >
              <Info size={15} />
              <span>Document Quality Specs</span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              PART 1: INFORMATION CHECKING & PROFILE SYNC
             ════════════════════════════════════════════════════════════════════ */}
          <div className="prep-module-card">
            <div className="module-title-bar">
              <div className="title-left">
                <div className="module-icon-circle blue">
                  <User size={18} />
                </div>
                <div>
                  <h4 className="module-heading">1. Information Checking & Profile Synchronization</h4>
                  <p className="module-subtext">Auto-matched from National Centralized Databases (JPN, PADU, LHDN)</p>
                </div>
              </div>
              <span className="gov-verified-pill">
                <CheckCircle2 size={13} />
                <span>JPN & PADU Integrated Database</span>
              </span>
            </div>

            {/* Retrieved from Central Profile Grid */}
            <div className="profile-retrieved-grid">
              <div className="retrieved-cell">
                <div className="cell-header">
                  <span className="cell-label">Full Name (MyKad)</span>
                  <span className="cell-badge">✔ Verified</span>
                </div>
                <span className="cell-val" title={profileData.fullName || 'Jason Tan Wei Lun'}>
                  {profileData.fullName || 'Jason Tan Wei Lun'}
                </span>
              </div>

              <div className="retrieved-cell">
                <div className="cell-header">
                  <span className="cell-label">Identity Card No.</span>
                  <span className="cell-badge">✔ Verified</span>
                </div>
                <span className="cell-val font-mono">{profileData.icNumber || '980315-14-5219'}</span>
              </div>

              <div className="retrieved-cell">
                <div className="cell-header">
                  <span className="cell-label">Mobile Phone Number</span>
                  <span className="cell-badge">✔ Verified</span>
                </div>
                <span className="cell-val">{profileData.phoneNumber || '+60 12-345 6789'}</span>
              </div>

              <div className="retrieved-cell">
                <div className="cell-header">
                  <span className="cell-label">Official Email Address</span>
                  <span className="cell-badge">✔ Verified</span>
                </div>
                <span className="cell-val" title={profileData.emailAddress || 'jason.tan@gmail.com'}>
                  {profileData.emailAddress || 'jason.tan@gmail.com'}
                </span>
              </div>
            </div>

            {/* Request Missing Information Box */}
            <div className="missing-info-box">
              <div className="missing-box-header">
                <div className="missing-header-left">
                  <div className="missing-header-icon">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h5 className="missing-header-title">Additional Parameters Required For This Agency</h5>
                    <p className="missing-header-sub">
                      Please provide the agency-specific parameters below for official {activeService.agency || 'agency'} filing.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`missing-inputs-grid ${isAutofillFlashing ? 'autofill-active' : ''}`}>
                {isSsm && (
                  <>
                    <div className="missing-input-field span-2">
                      <label>Proposed Trade Name *</label>
                      <input
                        type="text"
                        value={currentServicePrep.customFields?.businessName || ''}
                        onChange={(e) => handleFieldChange('businessName', e.target.value)}
                        placeholder="e.g. Kopi & Roti Heritage Enterprise"
                      />
                    </div>

                    <div className="missing-input-field span-2">
                      <label>Operating Premise Address *</label>
                      <input
                        type="text"
                        value={currentServicePrep.customFields?.premiseAddress || ''}
                        onChange={(e) => handleFieldChange('premiseAddress', e.target.value)}
                        placeholder="e.g. No. 18, Ground Floor, Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur"
                      />
                    </div>
                  </>
                )}

                {isPbt && (
                  <>
                    <div className="missing-input-field span-2">
                      <label>Malay Signboard Wording (Prominent Bahasa Melayu) *</label>
                      <input
                        type="text"
                        value={currentServicePrep.customFields?.signboardWording || ''}
                        onChange={(e) => handleFieldChange('signboardWording', e.target.value)}
                        placeholder="e.g. RESTORAN KOPI & ROTI HERITAGE"
                      />
                    </div>
                    <div className="missing-input-field">
                      <label>DBP Language Verification Code</label>
                      <input
                        type="text"
                        value={currentServicePrep.customFields?.dbpCode || ''}
                        onChange={(e) => handleFieldChange('dbpCode', e.target.value)}
                        placeholder="e.g. DBP/2026/FNB/08912"
                      />
                    </div>
                    <div className="missing-input-field">
                      <label>Premise Floor Area (m²)</label>
                      <input
                        type="text"
                        value={currentServicePrep.customFields?.floorArea || ''}
                        onChange={(e) => handleFieldChange('floorArea', e.target.value)}
                        placeholder="e.g. 145.5 sq metres"
                      />
                    </div>
                  </>
                )}

                {isLhdn && (
                  <div className="missing-input-field span-2">
                    <label>Estimated Annual Turnover *</label>
                    <select
                      value={currentServicePrep.customFields?.turnoverBracket || ''}
                      onChange={(e) => handleFieldChange('turnoverBracket', e.target.value)}
                    >
                      <option value="">-- Select Annual Turnover Bracket --</option>
                      <option value="Under RM150,000 / year">Under RM150,000 / year</option>
                      <option value="RM150,000 - RM500,000 / year">RM150,000 - RM500,000 / year</option>
                      <option value="RM500,000 - RM1,000,000 / year">RM500,000 - RM1,000,000 / year</option>
                    </select>
                  </div>
                )}

                {isJakim && (
                  <div className="missing-input-field span-2">
                    <label>Trained Muslim Food Handlers Count *</label>
                    <input
                      type="text"
                      value={currentServicePrep.customFields?.muslimStaffCount || ''}
                      onChange={(e) => handleFieldChange('muslimStaffCount', e.target.value)}
                      placeholder="e.g. 3 Trained Muslim Handlers"
                    />
                  </div>
                )}

                {isPtptn && (
                  <div className="missing-input-field span-2">
                    <label>Simpan SSPN Account Number *</label>
                    <input
                      type="text"
                      value={currentServicePrep.customFields?.sspnAccount || ''}
                      onChange={(e) => handleFieldChange('sspnAccount', e.target.value)}
                      placeholder="e.g. SSPN-10894218"
                    />
                  </div>
                )}

                {!isSsm &&
                 !isPbt &&
                 !isLhdn &&
                 !isJakim &&
                 !isPtptn && (
                  <div className="missing-input-field span-2">
                    <label>Application Specific Notes</label>
                    <input
                      type="text"
                      value={currentServicePrep.customFields?.specificNotes || ''}
                      onChange={(e) => handleFieldChange('specificNotes', e.target.value)}
                      placeholder="e.g. All information confirmed compliant with agency rules"
                    />
                  </div>
                )}
              </div>

              {/* Ask Permission to Save New Info to Profile */}
              <div className="permission-save-row">
                <label className="permission-checkbox-label">
                  <input
                    type="checkbox"
                    checked={permissionToSave}
                    onChange={(e) => setPermissionToSave(e.target.checked)}
                  />
                  <span>
                    <strong>Save Information Permission:</strong> Allow MyGateway to save newly entered parameters above to my Centralized Citizen Profile for automated pre-filling on future government applications.
                  </span>
                </label>

                <button
                  type="button"
                  className="save-to-profile-btn"
                  onClick={handleSaveToProfile}
                  disabled={!permissionToSave || isSavingProfile}
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw size={14} className="spin-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save to Profile</span>
                    </>
                  )}
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="save-success-banner">
                  <CheckCircle2 size={15} />
                  <span>Information successfully saved and synchronized to your MyGateway Central Profile!</span>
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              PART 2 & 3: REQUIRED DOCUMENTS, GUIDELINES & AI DOCUMENT CHECKING
             ════════════════════════════════════════════════════════════════════ */}
          <div className="prep-module-card">
            <div className="module-title-bar">
              <div className="title-left">
                <div className="module-icon-circle purple">
                  <Paperclip size={18} />
                </div>
                <div>
                  <h4 className="module-heading">2. Supporting Documents & AI Verification</h4>
                  <p className="module-subtext">Automatic verification of certificate authenticity, image resolution, and agency compliance</p>
                </div>
              </div>
              <span className="gov-guidelines-hint">
                Click the <strong>(i)</strong> icon on any document to view detailed preparation guidelines
              </span>
            </div>

            <div className="prep-docs-list">

              {/* Document 1: MyKad */}
              <div className="prep-doc-card">
                <div className="doc-card-top">
                  <div className="doc-name-wrap">
                    <FileText size={18} className="doc-icon" />
                    <div>
                      <div className="doc-title-row">
                        <h5>Applicant MyKad Copy (Front & Back)</h5>
                        <button
                          type="button"
                          className="info-guideline-trigger"
                          onClick={() => setActiveGuidelineModal(DEFAULT_DOC_GUIDELINES.generic)}
                          title="View MyKad preparation guidelines"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                      <span className="doc-agency-sub">National Identity Verification (JPN)</span>
                    </div>
                  </div>

                  {currentServicePrep.uploadedDocs?.identityDoc?.uploaded ? (
                    <span className="doc-attached-pill">
                      <CheckCircle2 size={13} /> {currentServicePrep.uploadedDocs.identityDoc.name} ({currentServicePrep.uploadedDocs.identityDoc.size})
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="attach-sample-btn"
                      onClick={() => handleAttachDocument('identityDoc', 'Applicant_MyKad_Front_Back.pdf', '1.2 MB')}
                    >
                      <Upload size={13} /> Attach MyKad Copy
                    </button>
                  )}
                </div>

                {/* AI Verification Section */}
                <div className="doc-ai-verification-bar">
                  <div className="ai-status-wrap">
                    <Sparkles size={16} className="ai-sparkle-icon" />
                    <div>
                      <span className="ai-status-title">AI Document Verification Engine</span>
                      <p className="ai-status-desc">
                        {currentServicePrep.uploadedDocs?.identityDoc?.aiChecked
                          ? 'OCR analysis verified MyKad 980315-14-5219 authenticity, high-resolution text at 300 DPI, and valid JPN security marks.'
                          : 'Ready for automated AI statutory compliance check against agency rules.'}
                      </p>
                    </div>
                  </div>

                  {currentServicePrep.uploadedDocs?.identityDoc?.aiChecked ? (
                    <div className="ai-score-badge score-pass">
                      <ShieldCheck size={16} />
                      <span>{currentServicePrep.uploadedDocs.identityDoc.aiScore}% Compliance (Passed)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="run-ai-check-btn"
                      onClick={() => handleRunAiCheck('identityDoc')}
                      disabled={currentServicePrep.aiCheckingInProgress}
                    >
                      {currentServicePrep.aiCheckingInProgress ? (
                        <>
                          <RefreshCw size={13} className="spin-icon" />
                          <span>AI Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Run AI Check</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Document 2: Tenancy Agreement (SSM & PBT) */}
              {(isSsm || isPbt) && (
                <div className="prep-doc-card">
                  <div className="doc-card-top">
                    <div className="doc-name-wrap">
                      <FileText size={18} className="doc-icon" />
                      <div>
                        <div className="doc-title-row">
                          <h5>Stamped Tenancy Agreement</h5>
                          <button
                            type="button"
                            className="info-guideline-trigger"
                            onClick={() => setActiveGuidelineModal(DEFAULT_DOC_GUIDELINES.ssm_tenancy)}
                            title="View tenancy agreement guidelines"
                          >
                            <Info size={14} />
                          </button>
                        </div>
                        <span className="doc-agency-sub">Must have a valid LHDN Stamp Duty Certificate</span>
                      </div>
                    </div>

                    {currentServicePrep.uploadedDocs?.tenancyDoc?.uploaded ? (
                      <div className="doc-top-actions">
                        <span className={`doc-attached-pill ${currentServicePrep.uploadedDocs.tenancyDoc.status === 'failed' ? 'pill-failed' : ''}`}>
                          {currentServicePrep.uploadedDocs.tenancyDoc.status === 'failed' ? (
                            <AlertCircle size={13} style={{ color: '#dc2626' }} />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          {currentServicePrep.uploadedDocs.tenancyDoc.name} ({currentServicePrep.uploadedDocs.tenancyDoc.size})
                        </span>
                        <button
                          type="button"
                          className="doc-reset-test-btn"
                          onClick={() => handleResetDocDemo('tenancyDoc')}
                          title="Reset this document to test failure -> success demo again"
                        >
                          <RotateCcw size={12} />
                          <span>Reset Test</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="attach-sample-btn"
                        onClick={() => handleRunAiCheck('tenancyDoc')}
                      >
                        <Upload size={13} /> Upload & Submit Tenancy Agreement
                      </button>
                    )}
                  </div>

                  {/* AI Verification Section */}
                  <div className="doc-ai-verification-bar">
                    <div className="ai-status-wrap">
                      <Sparkles size={16} className="ai-sparkle-icon" />
                      <div>
                        <span className="ai-status-title">AI Document Verification Engine</span>
                        <p className="ai-status-desc">
                          {currentServicePrep.uploadedDocs?.tenancyDoc?.status === 'passed'
                            ? (currentServicePrep.uploadedDocs.tenancyDoc.aiPassedDesc || 'Document verified successfully: 300 DPI high-resolution scan verified and compliant.')
                            : currentServicePrep.uploadedDocs?.tenancyDoc?.status === 'failed'
                            ? 'Document rejected: Image is too blurry and illegible (< 150 DPI). Please upload a clear, high-resolution copy.'
                            : 'AI will verify document readability, scan resolution, and LHDN stamp duty certificate.'}
                        </p>
                      </div>
                    </div>

                    {currentServicePrep.uploadedDocs?.tenancyDoc?.status === 'passed' ? (
                      <div className="ai-score-badge score-pass">
                        <ShieldCheck size={16} />
                        <span>{currentServicePrep.uploadedDocs.tenancyDoc.aiScore}% Compliance (Passed)</span>
                      </div>
                    ) : currentServicePrep.uploadedDocs?.tenancyDoc?.status === 'failed' ? (
                      <div className="ai-score-badge score-fail">
                        <ShieldAlert size={16} />
                        <span>{currentServicePrep.uploadedDocs.tenancyDoc.aiScore}% Compliance (Failed)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="run-ai-check-btn"
                        onClick={() => handleRunAiCheck('tenancyDoc')}
                        disabled={currentServicePrep.aiCheckingInProgress}
                      >
                        {currentServicePrep.aiCheckingInProgress ? (
                          <>
                            <RefreshCw size={13} className="spin-icon" />
                            <span>AI Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>Submit & Verify</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Rejection Alert Box when 1st attempt fails */}
                  {currentServicePrep.uploadedDocs?.tenancyDoc?.status === 'failed' && (
                    <div className="doc-rejection-alert">
                      <div className="rejection-alert-top">
                        <div className="rejection-alert-icon-wrap">
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <h6 className="rejection-alert-title">Submission Failed: Document Too Blurry</h6>
                          <p className="rejection-alert-summary">{currentServicePrep.uploadedDocs.tenancyDoc.rejectionReason}</p>
                        </div>
                      </div>

                      <div className="rejection-action-bar">
                        <button
                          type="button"
                          className="upload-corrected-doc-btn"
                          onClick={() => handleRunAiCheck('tenancyDoc')}
                          disabled={currentServicePrep.aiCheckingInProgress}
                        >
                          {currentServicePrep.aiCheckingInProgress ? (
                            <>
                              <RefreshCw size={14} className="spin-icon" />
                              <span>AI Scanning High-Res Copy...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>Re-upload Clear Document (300 DPI High-Res)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="reset-demo-link-btn"
                          onClick={() => handleResetDocDemo('tenancyDoc')}
                        >
                          <RotateCcw size={12} />
                          <span>Reset Demo Flow</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document 3: Signboard DBP Visual (PBT) */}
              {isPbt && (
                <div className="prep-doc-card">
                  <div className="doc-card-top">
                    <div className="doc-name-wrap">
                      <FileText size={18} className="doc-icon" />
                      <div>
                        <div className="doc-title-row">
                          <h5>Signboard Graphic Visual & DBP Approval</h5>
                          <button
                            type="button"
                            className="info-guideline-trigger"
                            onClick={() => setActiveGuidelineModal(DEFAULT_DOC_GUIDELINES.pbt_signboard)}
                            title="View signboard visual guidelines"
                          >
                            <Info size={14} />
                          </button>
                        </div>
                        <span className="doc-agency-sub">Language prominence verified by Dewan Bahasa dan Pustaka</span>
                      </div>
                    </div>

                    {currentServicePrep.uploadedDocs?.signboardDoc?.uploaded ? (
                      <div className="doc-top-actions">
                        <span className={`doc-attached-pill ${currentServicePrep.uploadedDocs.signboardDoc.status === 'failed' ? 'pill-failed' : ''}`}>
                          {currentServicePrep.uploadedDocs.signboardDoc.status === 'failed' ? (
                            <AlertCircle size={13} style={{ color: '#dc2626' }} />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          {currentServicePrep.uploadedDocs.signboardDoc.name} ({currentServicePrep.uploadedDocs.signboardDoc.size})
                        </span>
                        <button
                          type="button"
                          className="doc-reset-test-btn"
                          onClick={() => handleResetDocDemo('signboardDoc')}
                          title="Reset this document to test failure -> success demo again"
                        >
                          <RotateCcw size={12} />
                          <span>Reset Test</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="attach-sample-btn"
                        onClick={() => handleRunAiCheck('signboardDoc')}
                      >
                        <Upload size={13} /> Upload & Submit Signboard Visual
                      </button>
                    )}
                  </div>

                  {/* AI Verification Section */}
                  <div className="doc-ai-verification-bar">
                    <div className="ai-status-wrap">
                      <Sparkles size={16} className="ai-sparkle-icon" />
                      <div>
                        <span className="ai-status-title">AI Document Verification Engine</span>
                        <p className="ai-status-desc">
                          {currentServicePrep.uploadedDocs?.signboardDoc?.status === 'passed'
                            ? (currentServicePrep.uploadedDocs.signboardDoc.aiPassedDesc || 'Document verified successfully: 300 DPI high-resolution scan verified and compliant.')
                            : currentServicePrep.uploadedDocs?.signboardDoc?.status === 'failed'
                            ? 'Document rejected: Image is too blurry and illegible (< 150 DPI). Please upload a clear, high-resolution copy.'
                            : 'AI will verify national language prominence and image resolution.'}
                        </p>
                      </div>
                    </div>

                    {currentServicePrep.uploadedDocs?.signboardDoc?.status === 'passed' ? (
                      <div className="ai-score-badge score-pass">
                        <ShieldCheck size={16} />
                        <span>{currentServicePrep.uploadedDocs.signboardDoc.aiScore}% Compliance (Passed)</span>
                      </div>
                    ) : currentServicePrep.uploadedDocs?.signboardDoc?.status === 'failed' ? (
                      <div className="ai-score-badge score-fail">
                        <ShieldAlert size={16} />
                        <span>{currentServicePrep.uploadedDocs.signboardDoc.aiScore}% Compliance (Failed)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="run-ai-check-btn"
                        onClick={() => handleRunAiCheck('signboardDoc')}
                        disabled={currentServicePrep.aiCheckingInProgress}
                      >
                        {currentServicePrep.aiCheckingInProgress ? (
                          <>
                            <RefreshCw size={13} className="spin-icon" />
                            <span>AI Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>Submit & Verify</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Rejection Alert Box when 1st attempt fails */}
                  {currentServicePrep.uploadedDocs?.signboardDoc?.status === 'failed' && (
                    <div className="doc-rejection-alert">
                      <div className="rejection-alert-top">
                        <div className="rejection-alert-icon-wrap">
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <h6 className="rejection-alert-title">Submission Failed: Document Too Blurry</h6>
                          <p className="rejection-alert-summary">{currentServicePrep.uploadedDocs.signboardDoc.rejectionReason}</p>
                        </div>
                      </div>

                      <div className="rejection-action-bar">
                        <button
                          type="button"
                          className="upload-corrected-doc-btn"
                          onClick={() => handleRunAiCheck('signboardDoc')}
                          disabled={currentServicePrep.aiCheckingInProgress}
                        >
                          {currentServicePrep.aiCheckingInProgress ? (
                            <>
                              <RefreshCw size={14} className="spin-icon" />
                              <span>AI Scanning High-Res Copy...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>Re-upload Clear Document (300 DPI High-Res)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="reset-demo-link-btn"
                          onClick={() => handleResetDocDemo('signboardDoc')}
                        >
                          <RotateCcw size={12} />
                          <span>Reset Demo Flow</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document 4: Food Handler SLPM & Typhoid (KKM / JAKIM) */}
              {(isPbt || isJakim) && (
                <div className="prep-doc-card">
                  <div className="doc-card-top">
                    <div className="doc-name-wrap">
                      <FileText size={18} className="doc-icon" />
                      <div>
                        <div className="doc-title-row">
                          <h5>Food Handler SLPM Training & Typhoid TY2 Card</h5>
                          <button
                            type="button"
                            className="info-guideline-trigger"
                            onClick={() => setActiveGuidelineModal(DEFAULT_DOC_GUIDELINES.kkm_food)}
                            title="View food handler & typhoid guidelines"
                          >
                            <Info size={14} />
                          </button>
                        </div>
                        <span className="doc-agency-sub">Accredited by Ministry of Health Malaysia (KKM)</span>
                      </div>
                    </div>

                    {currentServicePrep.uploadedDocs?.slpmDoc?.uploaded ? (
                      <span className="doc-attached-pill">
                        <CheckCircle2 size={13} /> {currentServicePrep.uploadedDocs.slpmDoc.name} ({currentServicePrep.uploadedDocs.slpmDoc.size})
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="attach-sample-btn"
                        onClick={() => handleAttachDocument('slpmDoc', 'SLPM_Food_Handler_Cert_Typhoid_TY2.pdf', '1.9 MB')}
                      >
                        <Upload size={13} /> Attach SLPM Certificate
                      </button>
                    )}
                  </div>

                  {/* AI Verification Section */}
                  <div className="doc-ai-verification-bar">
                    <div className="ai-status-wrap">
                      <Sparkles size={16} className="ai-sparkle-icon" />
                      <div>
                        <span className="ai-status-title">AI Document Verification Engine</span>
                        <p className="ai-status-desc">
                          {currentServicePrep.uploadedDocs?.slpmDoc?.aiChecked
                            ? 'AI verified training institute KKM accreditation and valid Typhoid vaccination within 3-year statutory term.'
                            : 'AI checks training institute accreditation and vaccination validity.'}
                        </p>
                      </div>
                    </div>

                    {currentServicePrep.uploadedDocs?.slpmDoc?.aiChecked ? (
                      <div className="ai-score-badge score-pass">
                        <ShieldCheck size={16} />
                        <span>{currentServicePrep.uploadedDocs.slpmDoc.aiScore}% Compliance (Passed)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="run-ai-check-btn"
                        onClick={() => handleRunAiCheck('slpmDoc')}
                        disabled={currentServicePrep.aiCheckingInProgress}
                      >
                        {currentServicePrep.aiCheckingInProgress ? (
                          <>
                            <RefreshCw size={13} className="spin-icon" />
                            <span>AI Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>Run AI Check</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Document 5: PTPTN University Admission Letter */}
              {isPtptn && (
                <div className="prep-doc-card">
                  <div className="doc-card-top">
                    <div className="doc-name-wrap">
                      <FileText size={18} className="doc-icon" />
                      <div>
                        <div className="doc-title-row">
                          <h5>University Admission Offer Letter & MQA Accreditation</h5>
                          <button
                            type="button"
                            className="info-guideline-trigger"
                            onClick={() => setActiveGuidelineModal(DEFAULT_DOC_GUIDELINES.ptptn_offer)}
                            title="View university admission guidelines"
                          >
                            <Info size={14} />
                          </button>
                        </div>
                        <span className="doc-agency-sub">Registered IPTA / IPTS offer with valid MQA accreditation status</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="attach-sample-btn"
                      onClick={() => handleAttachDocument('ptptnDoc', 'University_Admission_Offer_MQA_2026.pdf', '2.4 MB')}
                    >
                      <Upload size={13} /> Attach Admission Offer
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ── Bottom Advancement to Step 3 (Identical to Step 3) ── */}
      <div className="services-all-completed-footer">
        <div className="all-completed-text">
          <Sparkles size={20} className="sparkle-gold" />
          <div>
            <h4>Ready to Proceed to Services & Application Hub?</h4>
            <p>
              Once all details are verified and documents prepared, advance to Step 3 to start submitting official applications.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="proceed-next-step-btn"
          onClick={onCompletePreparation}
        >
          <span>Complete Preparation & Proceed to Step 3</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ── Save Information to Central Profile Popout Prompt Modal ── */}
      {showSavePromptModal && (
        <div className="prep-modal-overlay">
          <div className="save-prompt-dialog">
            <div className="dialog-header">
              <div className="dialog-header-left">
                <div className="save-prompt-icon-bubble">
                  <Database size={22} className="save-prompt-icon" />
                </div>
                <div>
                  <span className="dialog-auth-tag">National Citizen Database Sync</span>
                  <h3 className="dialog-title">Save Parameters to Profile?</h3>
                </div>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setShowSavePromptModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dialog-body">
              <p className="dialog-desc">
                We detected newly entered parameters for <strong>{activeService.title}</strong>. Would you like MyGateway to securely synchronize and save this data into your <strong>Centralized Citizen Profile (PADU & JPN Database)</strong> for automatic pre-filling across future government applications?
              </p>

              {/* Preview of parameters to be saved */}
              <div className="save-prompt-preview-card">
                <div className="preview-card-header">
                  <Sparkles size={14} className="sparkle-icon" />
                  <span>Parameters to be synchronized:</span>
                </div>
                <div className="save-prompt-chips-grid">
                  {Object.entries(currentServicePrep.customFields || {}).map(([k, v]) => {
                    if (!v) return null;
                    let label = k;
                    if (k === 'businessName') label = 'Proposed Trade Name';
                    else if (k === 'premiseAddress') label = 'Premise Address';
                    else if (k === 'signboardWording') label = 'Malay Signboard Wording';
                    else if (k === 'dbpCode') label = 'DBP Verification Code';
                    else if (k === 'floorArea') label = 'Premise Floor Area';
                    else if (k === 'turnoverBracket') label = 'Annual Turnover';
                    else if (k === 'muslimStaffCount') label = 'Muslim Staff Handlers';
                    else if (k === 'sspnAccount') label = 'Simpan SSPN Account';
                    else if (k === 'specificNotes') label = 'Application Notes';
                    return (
                      <div key={k} className="save-field-chip">
                        <span className="chip-key-label">{label}:</span>
                        <span className="chip-val-text">{v}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="save-security-guarantee">
                <ShieldCheck size={16} className="security-icon" />
                <span>Protected under the Digital Government Personal Data Protection & Encryption Framework.</span>
              </div>
            </div>

            <div className="dialog-footer save-prompt-footer-btns">
              <button
                type="button"
                className="save-prompt-dismiss-btn"
                onClick={() => setShowSavePromptModal(false)}
              >
                Don't Save / Skip
              </button>

              <button
                type="button"
                className="save-prompt-confirm-btn"
                onClick={async () => {
                  await handleSaveToProfile();
                  setShowSavePromptModal(false);
                }}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw size={15} className="spin-icon" />
                    <span>Saving to Profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Yes, Save to Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detailed Document Guidelines Modal (when (i) is clicked) ── */}
      {activeGuidelineModal && (
        <div className="prep-modal-overlay">
          <div className="prep-guidelines-dialog">
            <div className="dialog-header">
              <div className="dialog-header-left">
                <FileCheck size={22} className="dialog-icon" />
                <div>
                  <span className="dialog-auth-tag">{activeGuidelineModal.authority}</span>
                  <h3 className="dialog-title">{activeGuidelineModal.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setActiveGuidelineModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dialog-body">
              <p className="dialog-desc">{activeGuidelineModal.description}</p>

              <div className="dialog-section">
                <h4>Mandatory Document Checklist</h4>
                <ul className="guidelines-check-list">
                  {activeGuidelineModal.requirements.map((req, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} className="item-check-icon" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dialog-section rejection-section">
                <h4>Common Agency Rejection Reasons</h4>
                <ul className="guidelines-rejection-list">
                  {activeGuidelineModal.commonRejections.map((rej, i) => (
                    <li key={i}>
                      <AlertTriangle size={15} className="item-rej-icon" />
                      <span>{rej}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                type="button"
                className="dialog-ok-btn"
                onClick={() => setActiveGuidelineModal(null)}
              >
                Understood / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Specifications Quality Modal ── */}
      {showDocReqModal && (
        <div className="prep-modal-overlay">
          <div className="prep-guidelines-dialog">
            <div className="dialog-header">
              <div className="dialog-header-left">
                <ShieldCheck size={22} className="dialog-icon" />
                <div>
                  <span className="dialog-auth-tag">Digital Government Standards</span>
                  <h3 className="dialog-title">{DOC_REQUIREMENTS_SPECS.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setShowDocReqModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dialog-body">
              <p className="dialog-desc">
                All uploaded documents must meet the following technical specifications to ensure automated processing and verification through agency e-Review systems.
              </p>

              {/* Technical Specifications */}
              <div className="specs-table-box" style={{ marginBottom: '18px' }}>
                {DOC_REQUIREMENTS_SPECS.specs.map((sp, i) => (
                  <div key={i} className="spec-row">
                    <span className="spec-key">{sp.label}</span>
                    <span className="spec-val">{sp.value}</span>
                  </div>
                ))}
              </div>

              {/* Certified True Copy (CTC) Guide */}
              <div className="dialog-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
                <h4 style={{ color: '#0f2c59', marginBottom: '6px' }}>{DOC_REQUIREMENTS_SPECS.ctcGuide.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px' }}>
                  {DOC_REQUIREMENTS_SPECS.ctcGuide.description}
                </p>

                <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e40af', margin: '0 0 6px', textTransform: 'uppercase' }}>
                  Authorized Persons (Who Can Certify):
                </h5>
                <ul className="guidelines-check-list" style={{ marginBottom: '14px' }}>
                  {DOC_REQUIREMENTS_SPECS.ctcGuide.authorizedOfficers.map((officer, i) => (
                    <li key={i} style={{ fontSize: '0.8rem' }}>
                      <CheckCircle2 size={15} className="item-check-icon" />
                      <span>{officer}</span>
                    </li>
                  ))}
                </ul>

                <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e40af', margin: '0 0 6px', textTransform: 'uppercase' }}>
                  Official Stamp & Signature Rules:
                </h5>
                <ul className="guidelines-check-list">
                  {DOC_REQUIREMENTS_SPECS.ctcGuide.stampRequirements.map((req, i) => (
                    <li key={i} style={{ fontSize: '0.8rem' }}>
                      <ShieldCheck size={15} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stamping & Translation Rules */}
              <div className="dialog-section" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                <h4 style={{ color: '#1e40af', fontSize: '0.86rem', marginBottom: '6px' }}>{DOC_REQUIREMENTS_SPECS.stampingGuide.title}</h4>
                <ul className="guidelines-check-list">
                  {DOC_REQUIREMENTS_SPECS.stampingGuide.rules.map((rule, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>
                      <FileCheck size={15} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: '2px' }} />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dialog-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <h4 style={{ color: '#334155', fontSize: '0.86rem', marginBottom: '6px' }}>{DOC_REQUIREMENTS_SPECS.translationGuide.title}</h4>
                <ul className="guidelines-check-list">
                  {DOC_REQUIREMENTS_SPECS.translationGuide.rules.map((rule, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: '#475569' }}>
                      <Info size={15} style={{ color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                type="button"
                className="dialog-ok-btn"
                onClick={() => setShowDocReqModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

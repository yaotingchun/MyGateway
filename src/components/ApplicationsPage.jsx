import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FolderOpen,
  Clock,
  Building2,
  Layers,
  Filter,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Lock,
  Unlock,
  Briefcase,
  Rocket,
  Award,
  GraduationCap,
  Wallet,
  Check,
  Tag,
  Calendar,
  DollarSign,
  HelpCircle,
  Info
} from 'lucide-react';
import Navbar from './Navbar';
import ApplicationSubmissionModal from './ApplicationSubmissionModal';
import {
  getLocalActiveApplications,
  saveLocalActiveApplications,
  getSelectedApplicationId,
  setSelectedApplicationId,
  updateApplicationEligibility,
  updateApplicationJourney,
  getAccumulatedArtifacts,
} from '../services/journeyService';
import { getProfile, evaluateEligibilityCriteria } from '../utils/profileStore';
import './ApplicationsPage.css';

const DEFAULT_SAMPLE_APPS = [
  {
    id: 'APP-2026-FNB-8921',
    userId: 'Jason',
    title: 'Food & Beverage Business Setup Applications',
    summary: 'Official agency applications required to legally operate an F&B dining premise in Malaysia.',
    category: 'Business & Licensing',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    agencies: ['SSM', 'Local Council (PBT)', 'LHDN', 'JAKIM Halal'],
    eligibility: {
      title: 'Eligibility Requirements',
      summary: 'Please verify that you meet the statutory requirements before submitting applications.',
      criteria: [
        { id: 'c1', label: 'Citizenship', requirement: 'Malaysian Citizen or Permanent Resident (MyKad / MyPR)', isMandatory: true },
        { id: 'c2', label: 'Age Requirement', requirement: 'Aged 18 years old and above', isMandatory: true },
        { id: 'c3', label: 'Premise Right', requirement: 'Valid commercial tenancy agreement or registered premise title deed', isMandatory: true },
        { id: 'c4', label: 'Food Handler Compliance', requirement: 'Prepared to complete KKM-accredited SLPM course & receive Typhoid TY2 vaccine', isMandatory: true }
      ],
      checkedCriteria: {},
      isEligible: false,
    },
    journey: {
      id: 'journey-fnb-standard',
      title: 'F&B Agency Applications Process',
      summary: 'Sequential and parallel submissions across SSM, Local Council, and Tax Authorities.',
      steps: [
        {
          id: 'step-ssm',
          title: 'SSM Business Registration (EzBiz)',
          agency: 'Suruhanjaya Syarikat Malaysia (SSM)',
          isDigital: true,
          canParallel: false,
          dependencies: [],
          produces: ['SSM Registration Certificate (Borang D/E)', 'SSM Number'],
          requires: ['MyKad', 'Proposed Business Name'],
          description: 'Official registration of your enterprise entity name and business type.',
          timeframe: 'Instant (Online via EzBiz)',
          fee: 'RM60 - RM100/year',
          status: 'pending',
        },
        {
          id: 'step-pbt',
          title: 'Local Council (PBT) Premise & Signboard License',
          agency: 'Local Council (DBKL / MBPJ / MBSA / MPKJ)',
          isDigital: true,
          canParallel: false,
          dependencies: ['step-ssm'],
          produces: ['PBT Premise License Number', 'Premise Operating Certificate'],
          requires: ['SSM Registration Certificate', 'Food Handler SLPM Certificate', 'Typhoid TY2 Vaccine Card', 'Tenancy Agreement'],
          description: 'Premise and advertisement signboard operational license issued by the local authority.',
          timeframe: '7 - 14 Working Days',
          fee: 'RM150 - RM800 depending on location/size',
          status: 'pending',
        },
        {
          id: 'step-lhdn',
          title: 'LHDN Tax File & e-Invoicing Registration',
          agency: 'Lembaga Hasil Dalam Negeri (LHDN)',
          isDigital: true,
          canParallel: true,
          dependencies: ['step-ssm'],
          produces: ['LHDN Tax Identification Number (TIN)'],
          requires: ['SSM Registration Certificate'],
          description: 'Register enterprise income tax file and e-invoicing compliance portal.',
          timeframe: '1 - 3 Working Days',
          fee: 'Free',
          status: 'pending',
        },
        {
          id: 'step-jakim',
          title: 'JAKIM Halal Certification (MYeHALAL)',
          agency: 'Department of Islamic Development Malaysia (JAKIM)',
          isDigital: true,
          canParallel: false,
          dependencies: ['step-ssm', 'step-pbt'],
          produces: ['JAKIM Halal Certificate & Logo License'],
          requires: ['SSM Registration Certificate', 'PBT Premise License', 'Halal Assurance System & Ingredient Lists'],
          description: 'Official national halal compliance verification for food preparation and dining premises.',
          timeframe: '30 Working Days',
          fee: 'RM200 - RM400',
          status: 'pending',
        }
      ]
    }
  },
  {
    id: 'APP-2026-EDU-3104',
    userId: 'Jason',
    title: 'PTPTN Higher Education Financing Loan Application',
    summary: 'Government tertiary education loan application for public and private higher learning institutions.',
    category: 'Education & Grants',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    agencies: ['PTPTN', 'Simpan SSPN', 'MOHE'],
    eligibility: {
      title: 'Eligibility Requirements',
      summary: 'Please verify that you meet the qualification criteria before filing your loan application.',
      criteria: [
        { id: 'c1', label: 'Citizenship', requirement: 'Malaysian Citizen with valid MyKad', isMandatory: true },
        { id: 'c2', label: 'Age Limit', requirement: 'Not exceeding 45 years of age on date of application', isMandatory: true },
        { id: 'c3', label: 'Simpan SSPN Account', requirement: 'Active Simpan SSPN account opened in applicant’s name', isMandatory: true },
        { id: 'c4', label: 'Institutional Offer', requirement: 'Received official offer letter from MQA/MOHE accredited IPTA/IPTS', isMandatory: true }
      ],
      checkedCriteria: {},
      isEligible: false,
    },
    journey: {
      id: 'journey-ptptn-standard',
      title: 'PTPTN Higher Education Loan Procedures',
      summary: 'Required agency steps from opening Simpan SSPN savings to PTPTN loan agreement signing.',
      steps: [
        {
          id: 'step-sspn',
          title: 'Open / Verify Simpan SSPN Savings Account',
          agency: 'Perbadanan Tabung Pendidikan Tinggi Nasional (PTPTN)',
          isDigital: true,
          canParallel: false,
          dependencies: [],
          produces: ['Simpan SSPN Account Number'],
          requires: ['MyKad Number', 'Minimum Deposit (RM20)'],
          description: 'Prerequisite mandatory education savings account required for all PTPTN financing applicants.',
          timeframe: 'Instant (myPTPTN Portal)',
          fee: 'RM20 deposit',
          status: 'completed',
          submissionOutput: { sspnAccountNumber: 'SSPN-10894218' }
        },
        {
          id: 'step-ptptn-app',
          title: 'PTPTN Loan Online Filing (myPTPTN)',
          agency: 'PTPTN Financing Division',
          isDigital: true,
          canParallel: false,
          dependencies: ['step-sspn'],
          produces: ['PTPTN Reference ID', 'Loan Offer Letter'],
          requires: ['Simpan SSPN Account', 'University Offer Letter', 'SPM/STPM Results', 'Parent Income Slip / STR status'],
          description: 'Submit formal financing application matching institutional intake schedule.',
          timeframe: '5 - 7 Working Days',
          fee: 'RM5 Pin / Free online',
          status: 'pending',
        },
        {
          id: 'step-agreement',
          title: 'Duty Stamp & Digital Loan Agreement Signing',
          agency: 'LHDN (Duty Stamping) & PTPTN',
          isDigital: true,
          canParallel: false,
          dependencies: ['step-ptptn-app'],
          produces: ['Stamped Loan Agreement', 'Disbursement Schedule'],
          requires: ['PTPTN Loan Approval Letter', 'LHDN Stamping (RM20)'],
          description: 'Official digital stamping and contract signing to initiate semester tuition disbursements.',
          timeframe: '3 Working Days',
          fee: 'RM20 Stamping',
          status: 'pending',
        }
      ]
    }
  }
];

const ApplicationsPage = ({
  username = 'Jason',
  onLogout,
  onNavigate,
  lang = 'EN',
  onLangChange,
}) => {
  const isMalay = lang === 'MY';

  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [activeApp, setActiveApp] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'details'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'in_progress' | 'eligible' | 'completed'
  const [citizenProfile, setCitizenProfile] = useState(null);

  // Stepper Timeline Active Step Index (0: Eligibility, 1: Step 1, 2: Step 2, ...)
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Modal submission state
  const [submittingStep, setSubmittingStep] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load citizen profile and applications
  useEffect(() => {
    const init = async () => {
      const prof = await getProfile(username);
      setCitizenProfile(prof);
      loadApps(prof);
    };
    init();
  }, [username]);

  const loadApps = (prof) => {
    let apps = getLocalActiveApplications();
    if (!apps || apps.length === 0) {
      apps = DEFAULT_SAMPLE_APPS;
      saveLocalActiveApplications(apps);
    }
    setApplications(apps);

    const savedSelectedId = getSelectedApplicationId();
    if (savedSelectedId) {
      const found = apps.find((a) => a.id === savedSelectedId);
      if (found) {
        setSelectedAppId(found.id);
        setActiveApp(found);
        setViewMode('details');
        initActiveStep(found);
        return;
      }
    }

    if (apps.length > 0) {
      setSelectedAppId(apps[0].id);
      setActiveApp(apps[0]);
      initActiveStep(apps[0]);
    }
  };

  // Determine initial active step index based on progress
  const initActiveStep = (app) => {
    if (!app) return;
    if (!app.eligibility?.isEligible) {
      setActiveStepIndex(0);
      return;
    }

    const steps = app.journey?.steps || [];
    const firstPendingIdx = steps.findIndex((s) => s.status !== 'completed');
    if (firstPendingIdx !== -1) {
      setActiveStepIndex(firstPendingIdx + 1);
    } else {
      // All completed
      setActiveStepIndex(steps.length);
    }
  };

  // Evaluated eligibility criteria with Auto-Check engine
  const evaluatedCriteria = useMemo(() => {
    if (!activeApp?.eligibility?.criteria) return [];
    return evaluateEligibilityCriteria(activeApp.eligibility.criteria, citizenProfile || {});
  }, [activeApp, citizenProfile]);

  // Merge auto-checked criteria into checked criteria state
  const checkedMap = useMemo(() => {
    const manualMap = activeApp?.eligibility?.checkedCriteria || {};
    const merged = { ...manualMap };

    evaluatedCriteria.forEach((c) => {
      if (c.isAutoChecked && c.autoCheckedValue) {
        merged[c.id] = true;
      }
    });

    return merged;
  }, [activeApp, evaluatedCriteria]);

  // Open an application's details
  const handleOpenDetails = (app) => {
    setSelectedAppId(app.id);
    setActiveApp(app);
    setSelectedApplicationId(app.id);
    setViewMode('details');
    initActiveStep(app);
  };

  // Back to list of applications
  const handleBackToList = () => {
    setViewMode('list');
  };

  // Toggle manual criterion check
  const handleToggleCriterion = async (criterionId) => {
    if (!activeApp) return;

    const updatedChecked = {
      ...checkedMap,
      [criterionId]: !checkedMap[criterionId],
    };

    const allMandatoryChecked = evaluatedCriteria
      .filter((c) => c.isMandatory)
      .every((c) => updatedChecked[c.id]);

    const updatedApp = await updateApplicationEligibility(
      username,
      activeApp.id,
      updatedChecked,
      allMandatoryChecked
    );

    if (updatedApp) {
      setActiveApp(updatedApp);
      setApplications((prev) =>
        prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
      );
    }
  };

  // Confirm eligibility and automatically unlock Step 1
  const handleConfirmEligibility = async () => {
    if (!activeApp) return;

    const allChecked = {};
    evaluatedCriteria.forEach((c) => {
      allChecked[c.id] = true;
    });

    const updatedApp = await updateApplicationEligibility(
      username,
      activeApp.id,
      allChecked,
      true
    );

    if (updatedApp) {
      setActiveApp(updatedApp);
      setApplications((prev) =>
        prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
      );
      // Automatically advance to Step 1 (First Agency application)
      setActiveStepIndex(1);
    }
  };

  // Open in-app submission modal for a step
  const handleOpenSubmission = (step) => {
    setSubmittingStep(step);
    setIsModalOpen(true);
  };

  // Handle submission success
  const handleSubmitSuccess = async (result) => {
    if (result.updatedJourney && activeApp) {
      const updated = await updateApplicationJourney(
        username,
        activeApp.id,
        result.updatedJourney
      );
      if (updated) {
        setActiveApp(updated);
        setApplications((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );

        // Advance to next step in timeline if available
        const currentSteps = updated.journey?.steps || [];
        const nextPendingIdx = currentSteps.findIndex((s) => s.status !== 'completed');
        if (nextPendingIdx !== -1) {
          setActiveStepIndex(nextPendingIdx + 1);
        } else {
          setActiveStepIndex(currentSteps.length);
        }
      }
    }
    setIsModalOpen(false);
  };

  // Helper stats calculation
  const totalAppsCount = applications.length;
  const eligibleAppsCount = applications.filter((a) => a.eligibility?.isEligible).length;
  const completedStepsCount = applications.reduce((acc, app) => {
    const steps = app.journey?.steps || [];
    return acc + steps.filter((s) => s.status === 'completed').length;
  }, 0);

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.agencies && app.agencies.some((ag) => ag.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (statusFilter === 'eligible') {
      return app.eligibility?.isEligible;
    }
    if (statusFilter === 'in_progress') {
      return !app.eligibility?.isEligible;
    }
    if (statusFilter === 'completed') {
      const steps = app.journey?.steps || [];
      return steps.length > 0 && steps.every((s) => s.status === 'completed');
    }
    return true;
  });

  // Active App details calculations
  const criteriaList = evaluatedCriteria;
  const checkedCount = criteriaList.filter((c) => checkedMap[c.id]).length;
  const isFullyEligible =
    activeApp?.eligibility?.isEligible ||
    (checkedCount === criteriaList.length && criteriaList.length > 0);

  const activeSteps = activeApp?.journey?.steps || [];

  // Build the complete array of timeline nodes
  const timelineNodes = useMemo(() => {
    if (!activeApp) return [];

    const nodes = [
      {
        index: 0,
        type: 'eligibility',
        title: 'Eligibility Check',
        shortTitle: 'Eligibility',
        icon: <Search size={18} />,
        isCompleted: isFullyEligible,
        isUnlocked: true,
      }
    ];

    activeSteps.forEach((step, idx) => {
      // Step is unlocked if eligibility is done AND all previous steps are completed
      let unlocked = isFullyEligible;
      for (let i = 0; i < idx; i++) {
        if (activeSteps[i].status !== 'completed') {
          unlocked = false;
          break;
        }
      }

      let stepIcon = <Briefcase size={18} />;
      const agencyName = (step.agency || '').toLowerCase();
      const titleLower = (step.title || '').toLowerCase();

      if (agencyName.includes('ssm') || titleLower.includes('ssm')) {
        stepIcon = <Briefcase size={18} />;
      } else if (agencyName.includes('council') || agencyName.includes('pbt') || titleLower.includes('premise')) {
        stepIcon = <Building2 size={18} />;
      } else if (agencyName.includes('lhdn') || titleLower.includes('tax') || agencyName.includes('sspn')) {
        stepIcon = <Rocket size={18} />;
      } else if (agencyName.includes('jakim') || titleLower.includes('halal')) {
        stepIcon = <Award size={18} />;
      } else if (agencyName.includes('ptptn')) {
        stepIcon = <GraduationCap size={18} />;
      }

      nodes.push({
        index: idx + 1,
        type: 'agency_step',
        stepData: step,
        title: step.title,
        shortTitle: step.agency.split('(')[0].trim().replace('Suruhanjaya Syarikat Malaysia', 'SSM').replace('Lembaga Hasil Dalam Negeri', 'LHDN').replace('Department of Islamic Development Malaysia', 'JAKIM'),
        icon: stepIcon,
        isCompleted: step.status === 'completed',
        isUnlocked: unlocked,
      });
    });

    return nodes;
  }, [activeApp, isFullyEligible, activeSteps]);

  // Current active node data
  const currentNode = timelineNodes[activeStepIndex] || timelineNodes[0];

  return (
    <div className="apps-page-root">
      <Navbar
        username={username}
        onLogout={onLogout}
        onNavigate={onNavigate}
        activePage="applications"
        lang={lang}
        onLangChange={onLangChange}
      />

      <main className="apps-page-main">
        <div className="apps-page-container">

          {/* ════════════════════════════════════════════════════════════════════
              VIEW 1: APPLICATION HISTORY / DASHBOARD (LIST VIEW)
             ════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'list' && (
            <div className="apps-list-view">

              {/* Header Title & CTA */}
              <div className="apps-top-bar">
                <div>
                  <div className="apps-category-badge">
                    <Sparkles size={14} />
                    <span>{isMalay ? 'Pusat Permohonan Kerajaan' : 'Application History & Orchestrator'}</span>
                  </div>
                  <h1 className="apps-page-title">
                    {isMalay ? 'Sejarah Permohonan Saya' : 'My Application History'}
                  </h1>
                  <p className="apps-page-subtitle">
                    {isMalay
                      ? 'Semak status permohonan dan teruskan langkah seterusnya dalam garis masa permohonan.'
                      : 'Track all your government submissions and complete sequential step-by-step procedures.'}
                  </p>
                </div>

                <button
                  type="button"
                  className="start-ai-app-btn"
                  onClick={() => onNavigate && onNavigate('ai')}
                  title="Start a new application journey with AI Assistant"
                >
                  <Plus size={16} />
                  <span>{isMalay ? 'Bina Permohonan dengan AI' : '+ Start New Application with AI'}</span>
                </button>
              </div>

              {/* Stats Row */}
              <div className="apps-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrap stat-icon-blue">
                    <FolderOpen size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{totalAppsCount}</span>
                    <span className="stat-label">Total Applications</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap stat-icon-green">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{eligibleAppsCount}</span>
                    <span className="stat-label">Verified Eligible</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap stat-icon-purple">
                    <CheckCircle size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{completedStepsCount}</span>
                    <span className="stat-label">Agency Submissions Done</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="apps-toolbar-card">
                <div className="apps-search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search applications by name, reference ID, or agency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="apps-filter-tabs">
                  <button
                    className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({applications.length})
                  </button>
                  <button
                    className={`filter-tab ${statusFilter === 'eligible' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('eligible')}
                  >
                    Eligible ({eligibleAppsCount})
                  </button>
                  <button
                    className={`filter-tab ${statusFilter === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('in_progress')}
                  >
                    Pending ({applications.length - eligibleAppsCount})
                  </button>
                </div>
              </div>

              {/* Application History Cards List */}
              <div className="apps-history-list">
                {filteredApps.length === 0 ? (
                  <div className="apps-empty-state">
                    <FolderOpen size={48} className="empty-icon" />
                    <h3>No applications found</h3>
                    <p>Try clearing your search filters or start a new application journey with the AI Assistant.</p>
                    <button
                      type="button"
                      className="start-ai-app-btn"
                      onClick={() => onNavigate && onNavigate('ai')}
                    >
                      <Sparkles size={16} />
                      <span>Start Application with AI</span>
                    </button>
                  </div>
                ) : (
                  filteredApps.map((app) => {
                    const appSteps = app.journey?.steps || [];
                    const doneCount = appSteps.filter((s) => s.status === 'completed').length;
                    const totalSteps = appSteps.length;
                    const isAppEligible = app.eligibility?.isEligible;

                    return (
                      <div
                        key={app.id}
                        className="app-history-card"
                        onClick={() => handleOpenDetails(app)}
                      >
                        <div className="app-card-left">
                          <div className="app-card-top-meta">
                            <span className="app-card-id">{app.id}</span>
                            <span className="app-card-date">
                              <Clock size={13} />
                              <span>{new Date(app.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </span>
                            {app.category && (
                              <span className="app-category-pill">{app.category}</span>
                            )}
                          </div>

                          <h3 className="app-card-title">{app.title}</h3>
                          <p className="app-card-desc">{app.summary}</p>

                          {/* Agency Tags */}
                          {app.journey?.steps && (
                            <div className="app-agency-tags">
                              {app.journey.steps.map((st) => (
                                <span key={st.id} className="agency-pill">
                                  <Building2 size={12} />
                                  <span>{st.agency.split('(')[0].trim()}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="app-card-right">
                          {/* Status Badges */}
                          <div className="app-card-status-badges">
                            {isAppEligible ? (
                              <span className="badge-pill pill-eligible">
                                <CheckCircle2 size={14} />
                                <span>Eligible</span>
                              </span>
                            ) : (
                              <span className="badge-pill pill-pending">
                                <AlertCircle size={14} />
                                <span>Eligibility Required</span>
                              </span>
                            )}
                          </div>

                          {/* Step Progress Mini Bar */}
                          <div className="app-step-progress-box">
                            <div className="step-progress-labels">
                              <span className="step-count-text">
                                {doneCount} of {totalSteps} Steps Done
                              </span>
                              <span className="step-percent-text">
                                {Math.round((doneCount / (totalSteps || 1)) * 100)}%
                              </span>
                            </div>
                            <div className="step-progress-track">
                              <div
                                className="step-progress-fill"
                                style={{ width: `${(doneCount / (totalSteps || 1)) * 100}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            className="view-details-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(app);
                            }}
                          >
                            <span>Open Journey</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              VIEW 2: APPLICATION DETAILS (HORIZONTAL TIMELINE + FOCUSED STEP)
             ════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'details' && activeApp && (
            <div className="apps-details-view">

              {/* Breadcrumb / Back button */}
              <div className="details-nav-bar">
                <button
                  type="button"
                  className="back-to-list-btn"
                  onClick={handleBackToList}
                >
                  <ArrowLeft size={16} />
                  <span>{isMalay ? 'Kembali ke Senarai Permohonan' : 'Back to Applications'}</span>
                </button>

                <div className="details-nav-right">
                  <span className="details-app-id">{activeApp.id}</span>
                </div>
              </div>

              {/* Active Application Card Header */}
              <div className="app-details-header-card">
                <div className="app-header-left">
                  <div className="active-app-meta-row">
                    <span className="app-ref-id">{activeApp.id}</span>
                    <span className="app-created-date">
                      <Clock size={13} />
                      <span>Started {new Date(activeApp.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h2 className="active-app-heading">{activeApp.title}</h2>
                  <p className="active-app-summary">{activeApp.summary}</p>
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════
                  HORIZONTAL CONNECTED STEPPER TIMELINE (MATCHING REFERENCE IMAGE)
                 ════════════════════════════════════════════════════════════════ */}
              <div className="horizontal-timeline-container">
                <div className="timeline-stepper-track">
                  {timelineNodes.map((node, i) => {
                    const isSelected = activeStepIndex === node.index;
                    const isUnlocked = node.isUnlocked;
                    const isCompleted = node.isCompleted;
                    const hasNext = i < timelineNodes.length - 1;

                    return (
                      <React.Fragment key={node.index}>
                        {/* Stepper Node Item */}
                        <div
                          className={`timeline-step-node ${isSelected ? 'node-selected' : ''} ${isCompleted ? 'node-completed' : ''} ${!isUnlocked ? 'node-locked' : 'node-unlocked'}`}
                          onClick={() => {
                            if (isUnlocked) {
                              setActiveStepIndex(node.index);
                            }
                          }}
                        >
                          <div className="node-circle-btn">
                            {isCompleted ? (
                              <Check size={18} className="node-icon-completed" />
                            ) : !isUnlocked ? (
                              <Lock size={16} className="node-icon-locked" />
                            ) : (
                              node.icon
                            )}
                          </div>

                          <div className="node-label-wrap">
                            <span className="node-step-num">Step {node.index + 1}</span>
                            <span className="node-step-title">{node.shortTitle || node.title}</span>
                          </div>
                        </div>

                        {/* Connecting Line Segment with Milestone Dots */}
                        {hasNext && (
                          <div className={`timeline-connector-segment ${timelineNodes[i + 1]?.isUnlocked ? 'segment-active' : 'segment-locked'}`}>
                            <span className="segment-micro-dot"></span>
                            <div className="segment-line-fill"></div>
                            <span className="segment-micro-dot"></span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════
                  FOCUSED STEP CONTENT (ONLY RENDERING THE ACTIVE / UNLOCKED STEP)
                 ════════════════════════════════════════════════════════════════ */}

              {/* STEP 0: ELIGIBILITY CHECK */}
              {activeStepIndex === 0 && (
                <section className="phase-section phase-focused-step">
                  <div className="phase-header">
                    <div className="phase-title-wrap">
                      <div className={`phase-icon-badge ${isFullyEligible ? 'icon-badge-success' : 'icon-badge-pending'}`}>
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <h3 className="phase-title">
                          Step 1: Statutory Eligibility Check
                        </h3>
                        <p className="phase-subtitle">
                          {activeApp.eligibility?.summary || 'Please verify that you meet the statutory conditions before proceeding with official applications.'}
                        </p>
                      </div>
                    </div>

                    {isFullyEligible && (
                      <span className="eligible-confirmed-badge">
                        <CheckCircle2 size={15} />
                        <span>Eligible & Confirmed</span>
                      </span>
                    )}
                  </div>

                  {/* Criteria Checklist Grid */}
                  <div className="eligibility-checklist-grid">
                    {criteriaList.map((c, idx) => {
                      const isChecked = !!checkedMap[c.id];

                      return (
                        <div
                          key={c.id || idx}
                          className={`eligibility-criterion-box ${isChecked ? 'box-checked' : ''}`}
                          onClick={() => handleToggleCriterion(c.id)}
                        >
                          <div className="criterion-box-checkbox">
                            {isChecked ? (
                              <CheckCircle2 size={20} className="check-icon-active" />
                            ) : (
                              <div className="check-box-empty" />
                            )}
                          </div>

                          <div className="criterion-box-content">
                            <div className="criterion-box-title-row">
                              <span className="criterion-box-label">{c.label}</span>
                              {c.isMandatory && (
                                <span className="criterion-mandatory-pill">Required</span>
                              )}
                            </div>
                            <p className="criterion-box-req">{c.requirement}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Eligibility Action Footer */}
                  <div className="eligibility-action-footer">
                    <div className="eligibility-progress-wrap">
                      <div className="eligibility-progress-meta">
                        <span className="progress-meta-text">
                          {isFullyEligible
                            ? '✨ All statutory eligibility criteria confirmed!'
                            : `${checkedCount} of ${criteriaList.length} requirements checked.`}
                        </span>
                        <span className="progress-percent-text">
                          {Math.round((checkedCount / (criteriaList.length || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="eligibility-progress-track">
                        <div
                          className={`eligibility-progress-bar ${isFullyEligible ? 'bar-success' : ''}`}
                          style={{ width: `${(checkedCount / (criteriaList.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {!isFullyEligible ? (
                      <button
                        type="button"
                        className="confirm-eligibility-btn"
                        onClick={handleConfirmEligibility}
                      >
                        <span>Confirm Eligibility & Unlock Step 2</span>
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="proceed-next-step-btn"
                        onClick={() => setActiveStepIndex(1)}
                      >
                        <span>Proceed to Next Step</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* AGENCY STEPS (STEP 1, 2, 3, ...) */}
              {activeStepIndex > 0 && currentNode.stepData && (
                <section className="phase-section phase-focused-step">
                  <div className="phase-header">
                    <div className="phase-title-wrap">
                      <div className={`phase-icon-badge ${currentNode.isCompleted ? 'icon-badge-success' : 'icon-badge-pending'}`}>
                        {currentNode.icon}
                      </div>
                      <div>
                        <span className="step-agency-tag">{currentNode.stepData.agency}</span>
                        <h3 className="phase-title">
                          Step {activeStepIndex + 1}: {currentNode.stepData.title}
                        </h3>
                        <p className="phase-subtitle">
                          {currentNode.stepData.description}
                        </p>
                      </div>
                    </div>

                    {currentNode.isCompleted && (
                      <span className="eligible-confirmed-badge">
                        <CheckCircle2 size={15} />
                        <span>Submitted & Completed</span>
                      </span>
                    )}
                  </div>

                  {/* Agency Card Details */}
                  <div className="agency-step-details-grid">
                    {/* Requirements / Documents Needed */}
                    <div className="step-info-card">
                      <div className="info-card-header">
                        <FileText size={16} />
                        <h4>Prerequisites & Required Documents</h4>
                      </div>
                      <ul className="info-items-list">
                        {currentNode.stepData.requires?.map((req, rIdx) => (
                          <li key={rIdx}>
                            <Check size={14} className="list-check-icon" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables / What this Step Produces */}
                    <div className="step-info-card info-card-produces">
                      <div className="info-card-header">
                        <Award size={16} />
                        <h4>Official Documents Produced</h4>
                      </div>
                      <ul className="info-items-list">
                        {currentNode.stepData.produces?.map((prod, pIdx) => (
                          <li key={pIdx}>
                            <Sparkles size={14} className="list-sparkle-icon" />
                            <span>{prod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Processing Time & Government Fee Bar */}
                  <div className="step-meta-strip">
                    <div className="meta-strip-item">
                      <Clock size={16} />
                      <span className="meta-label">Processing Time:</span>
                      <span className="meta-val">{currentNode.stepData.timeframe || 'Instant / 1-3 Days'}</span>
                    </div>

                    <div className="meta-strip-item">
                      <Wallet size={16} />
                      <span className="meta-label">Fee:</span>
                      <span className="meta-val">{currentNode.stepData.fee || 'Free'}</span>
                    </div>

                    <div className="meta-strip-item">
                      <Building2 size={16} />
                      <span className="meta-label">Channel:</span>
                      <span className="meta-val">{currentNode.stepData.isDigital ? '100% Online via MyGateway' : 'Counter Submission'}</span>
                    </div>
                  </div>

                  {/* Submission Status or Action Button */}
                  {currentNode.isCompleted ? (
                    <div className="step-completed-banner">
                      <div className="completed-banner-left">
                        <CheckCircle2 size={24} className="banner-success-icon" />
                        <div>
                          <h4>Application Successfully Registered!</h4>
                          {currentNode.stepData.submissionRecord?.referenceNumber && (
                            <p>Official Reference ID: <strong><code>{currentNode.stepData.submissionRecord.referenceNumber}</code></strong></p>
                          )}
                          {currentNode.stepData.submissionOutput && (
                            <div className="output-tags-row">
                              {Object.entries(currentNode.stepData.submissionOutput).map(([k, v]) => (
                                <span key={k} className="output-pill">
                                  <strong>{k.replace(/([A-Z])/g, ' $1')}:</strong> {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {activeStepIndex < timelineNodes.length - 1 && (
                        <button
                          type="button"
                          className="proceed-next-step-btn"
                          onClick={() => setActiveStepIndex(activeStepIndex + 1)}
                        >
                          <span>Proceed to Next Step</span>
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="step-action-footer">
                      <div className="action-footer-text">
                        <Info size={16} />
                        <span>Ready to submit? Fill in the details to generate official registration documents.</span>
                      </div>

                      <button
                        type="button"
                        className="start-submission-action-btn"
                        onClick={() => handleOpenSubmission(currentNode.stepData)}
                      >
                        <Rocket size={16} />
                        <span>Submit Application Online</span>
                      </button>
                    </div>
                  )}
                </section>
              )}

            </div>
          )}

        </div>
      </main>

      {/* In-App Submission Modal */}
      <ApplicationSubmissionModal
        isOpen={isModalOpen}
        step={submittingStep}
        journey={activeApp?.journey}
        username={username}
        accumulatedArtifacts={getAccumulatedArtifacts(activeApp?.journey)}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </div>
  );
};

export default ApplicationsPage;

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
  Info,
  AlertTriangle,
  Download,
  Trash2
} from 'lucide-react';
import Navbar from './Navbar';
import ServiceWorkspaceView from './ServiceWorkspaceView';
import {
  getLocalActiveApplications,
  saveLocalActiveApplications,
  getSelectedApplicationId,
  setSelectedApplicationId,
  updateApplicationEligibility,
  updateApplicationJourney,
  deleteApplication,
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
          status: 'ready_to_apply',
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
          status: 'locked',
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
          status: 'locked',
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
          status: 'locked',
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
          status: 'ready_to_apply',
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
          status: 'locked',
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

  // Main 3-stage timeline stepper (0: Eligibility Check, 1: Services & Application, 2: Completed)
  const [currentStage, setCurrentStage] = useState(0);

  // Selected Service for Workspace Modal
  const [selectedService, setSelectedService] = useState(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // Services filter inside Step 2
  const [servicesFilter, setServicesFilter] = useState('all'); // 'all' | 'processable' | 'completed' | 'locked'

  // Application Delete Confirmation State
  const [appToDelete, setAppToDelete] = useState(null);

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
        determineInitialStage(found);
        return;
      }
    }

    if (apps.length > 0) {
      setSelectedAppId(apps[0].id);
      setActiveApp(apps[0]);
      determineInitialStage(apps[0]);
    }
  };

  // Prompt delete application confirmation
  const handlePromptDelete = (app) => {
    setAppToDelete(app);
  };

  // Confirm and execute application deletion
  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    const updated = await deleteApplication(username, appToDelete.id);
    setApplications(updated);

    if (activeApp?.id === appToDelete.id) {
      if (updated.length > 0) {
        setActiveApp(updated[0]);
        setSelectedAppId(updated[0].id);
        determineInitialStage(updated[0]);
      } else {
        setActiveApp(null);
        setSelectedAppId(null);
      }
      setViewMode('list');
    }
    setAppToDelete(null);
  };

  // Determine stage based on application state
  const determineInitialStage = (app) => {
    if (!app) return;
    if (!app.eligibility?.isEligible) {
      setCurrentStage(0); // Stage 1: Eligibility Check
      return;
    }

    const steps = app.journey?.steps || [];
    const allDone = steps.length > 0 && steps.every((s) => s.status === 'completed');
    if (allDone) {
      setCurrentStage(2); // Stage 3: Completed
    } else {
      setCurrentStage(1); // Stage 2: Services & Application
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
    determineInitialStage(app);
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

  // Confirm eligibility and automatically unlock Stage 1 (Services & Application)
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
      // Advance to Services & Application stage
      setCurrentStage(1);
    }
  };

  // Open Service Workspace (Full page transition, no popout modal)
  const handleOpenWorkspace = (service) => {
    setSelectedService(service);
    setViewMode('service');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return from Service Workspace to Details view
  const handleBackFromService = () => {
    setViewMode('details');
    setSelectedService(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update Service Status from Workspace (e.g. Completed, Processing, Review Required, Rejected)
  const handleUpdateServiceStatus = async (serviceId, newStatus, submissionData) => {
    if (!activeApp?.journey?.steps) return;

    const steps = [...activeApp.journey.steps];
    const targetIdx = steps.findIndex((s) => s.id === serviceId);
    if (targetIdx === -1) return;

    const completedIds = steps
      .filter((s, idx) => idx !== targetIdx && s.status === 'completed')
      .map((s) => s.id);

    if (newStatus === 'completed') {
      completedIds.push(serviceId);
    }

    // Update target step
    steps[targetIdx] = {
      ...steps[targetIdx],
      status: newStatus,
      submissionRecord: submissionData || steps[targetIdx].submissionRecord,
      submissionOutput: submissionData?.output || steps[targetIdx].submissionOutput,
    };

    // Update dependency lock status for all other steps
    const refreshedSteps = steps.map((st) => {
      if (st.status === 'completed') return st;

      const deps = st.dependencies || [];
      const depsMet = deps.every((d) => completedIds.includes(d));

      if (!depsMet) {
        return { ...st, status: 'locked' };
      } else if (st.status === 'locked') {
        return { ...st, status: 'ready_to_apply' };
      }
      return st;
    });

    const updatedJourney = {
      ...activeApp.journey,
      steps: refreshedSteps
    };

    const updatedApp = await updateApplicationJourney(
      username,
      activeApp.id,
      updatedJourney
    );

    if (updatedApp) {
      setActiveApp(updatedApp);
      setApplications((prev) =>
        prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
      );

      // Check if all steps are now completed
      const allCompleted = refreshedSteps.every((s) => s.status === 'completed');
      if (allCompleted) {
        setCurrentStage(2); // Advance to Completed
      }

      // Update selectedService reference if modal is open
      const updatedTarget = refreshedSteps.find((s) => s.id === serviceId);
      if (updatedTarget) setSelectedService(updatedTarget);
    }
  };

  // Helper stats calculation
  const totalAppsCount = applications.length;
  const eligibleAppsCount = applications.filter((a) => a.eligibility?.isEligible).length;
  const completedStepsCount = applications.reduce((acc, app) => {
    const steps = app.journey?.steps || [];
    return acc + steps.filter((s) => s.status === 'completed').length;
  }, 0);

  // Filtered applications list (for viewMode === 'list')
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

  const rawSteps = activeApp?.journey?.steps || [];
  const completedServicesCount = rawSteps.filter((s) => s.status === 'completed').length;
  const allServicesCompleted = rawSteps.length > 0 && completedServicesCount === rawSteps.length;

  // Smart Sorting for Services in Stage 1:
  // 1. Processable / In Progress (Review Required, Ready, Processing, Rejected) on TOP
  // 2. Completed in Middle
  // 3. Locked (dependencies not met) on BOTTOM
  const sortedServices = useMemo(() => {
    if (!rawSteps || rawSteps.length === 0) return [];

    const getPriority = (status) => {
      switch (status) {
        case 'review_required': return 1;
        case 'ready_to_apply':
        case 'pending': return 2;
        case 'processing': return 3;
        case 'rejected': return 4;
        case 'completed': return 5;
        case 'locked': return 6;
        default: return 3;
      }
    };

    return [...rawSteps].sort((a, b) => getPriority(a.status) - getPriority(b.status));
  }, [rawSteps]);

  // Filtered services inside Stage 1
  const displayedServices = sortedServices.filter((s) => {
    if (servicesFilter === 'processable') {
      return s.status === 'ready_to_apply' || s.status === 'pending' || s.status === 'processing' || s.status === 'review_required' || s.status === 'rejected';
    }
    if (servicesFilter === 'completed') {
      return s.status === 'completed';
    }
    if (servicesFilter === 'locked') {
      return s.status === 'locked';
    }
    return true;
  });

  // 3 Main Stepper Timeline Stages Configuration
  const mainTimelineStages = [
    {
      index: 0,
      title: 'Eligibility Check',
      shortTitle: 'Eligibility Check',
      icon: <Search size={18} />,
      isCompleted: isFullyEligible,
      isUnlocked: true,
    },
    {
      index: 1,
      title: 'Services & Application',
      shortTitle: 'Services & Application',
      icon: <Building2 size={18} />,
      isCompleted: allServicesCompleted,
      isUnlocked: isFullyEligible,
    },
    {
      index: 2,
      title: 'Completed',
      shortTitle: 'Completed',
      icon: <Award size={18} />,
      isCompleted: allServicesCompleted,
      isUnlocked: allServicesCompleted,
    }
  ];

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
                    <span>{isMalay ? 'Pusat Permohonan Kerajaan' : 'Applications Hub'}</span>
                  </div>
                  <h1 className="apps-page-title">
                    {isMalay ? 'Sejarah Permohonan Saya' : 'My Application History'}
                  </h1>
                  <p className="apps-page-subtitle">
                    {isMalay
                      ? 'Semak status permohonan, semakan kelayakan, dan teruskan modul permohonan agensi.'
                      : 'Track all your government submissions and complete required agency services.'}
                  </p>
                </div>

                <button
                  type="button"
                  className="start-ai-app-btn"
                  onClick={() => onNavigate && onNavigate('ai')}
                  title="Start a new application journey with AI Assistant"
                >
                  <Plus size={16} />
                  <span>{isMalay ? 'Bina Permohonan dengan AI' : 'Start New Application with AI'}</span>
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
                    <span className="stat-label">Agency Services Done</span>
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
                    <div className="empty-icon-circle">
                      <FolderOpen size={36} />
                    </div>
                    <h3>No applications found</h3>
                    <p>
                      {searchQuery || statusFilter !== 'all'
                        ? 'No applications match your current search filters. Try clearing your filters.'
                        : 'You currently have no active applications. Start a new application journey with the AI Assistant to get guided step-by-step assistance.'}
                    </p>
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
                                {doneCount} of {totalSteps} Services Done
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

                          <div className="app-card-actions-row">
                            <button
                              type="button"
                              className="delete-app-card-btn"
                              title="Delete Application"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePromptDelete(app);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>

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
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              VIEW 2: APPLICATION DETAILS (3-STAGE TIMELINE + SERVICES MODULE)
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
                  <button
                    type="button"
                    className="delete-app-header-btn"
                    title="Delete this application"
                    onClick={() => handlePromptDelete(activeApp)}
                  >
                    <Trash2 size={14} />
                    <span>Delete Application</span>
                  </button>
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
                      <span>Created {new Date(activeApp.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h2 className="active-app-heading">{activeApp.title}</h2>
                  <p className="active-app-summary">{activeApp.summary}</p>
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════
                  MAIN 3-STAGE HORIZONTAL TIMELINE STEPPER
                  [1. Eligibility Check] ──── [2. Services & Application] ──── [3. Completed]
                 ════════════════════════════════════════════════════════════════ */}
              <div className="horizontal-timeline-container">
                <div className="timeline-stepper-track">
                  {mainTimelineStages.map((stage, i) => {
                    const isSelected = currentStage === stage.index;
                    const isUnlocked = stage.isUnlocked;
                    const isCompleted = stage.isCompleted;
                    const hasNext = i < mainTimelineStages.length - 1;

                    return (
                      <React.Fragment key={stage.index}>
                        {/* Stepper Node */}
                        <div
                          className={`timeline-step-node ${isSelected ? 'node-selected' : ''} ${isCompleted ? 'node-completed' : ''} ${!isUnlocked ? 'node-locked' : 'node-unlocked'}`}
                          onClick={() => {
                            if (isUnlocked) {
                              setCurrentStage(stage.index);
                            }
                          }}
                        >
                          <div className="node-circle-btn">
                            {isCompleted ? (
                              <Check size={18} className="node-icon-completed" />
                            ) : !isUnlocked ? (
                              <Lock size={16} className="node-icon-locked" />
                            ) : (
                              stage.icon
                            )}
                          </div>

                          <div className="node-label-wrap">
                            <span className="node-step-num">Step {stage.index + 1}</span>
                            <span className="node-step-title">{stage.shortTitle}</span>
                          </div>
                        </div>

                        {/* Connecting Line Segment with Milestone Dots */}
                        {hasNext && (
                          <div className={`timeline-connector-segment ${mainTimelineStages[i + 1]?.isUnlocked ? 'segment-active' : 'segment-locked'}`}>
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
                  STAGE 0: ELIGIBILITY CHECK
                 ════════════════════════════════════════════════════════════════ */}
              {currentStage === 0 && (
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
                        <span>Confirm Eligibility & Unlock Services Module</span>
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="proceed-next-step-btn"
                        onClick={() => setCurrentStage(1)}
                      >
                        <span>Proceed to Services & Application</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════════
                  STAGE 1: SERVICES & APPLICATION MODULE
                  (Processable on top, Locked on bottom, Process phases)
                 ════════════════════════════════════════════════════════════════ */}
              {currentStage === 1 && (
                <section className="phase-section services-module-section">
                  {/* Module Header */}
                  <div className="services-module-header">
                    <div className="services-header-info">
                      <div className="services-icon-pill">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="services-module-title">Step 2: Services & Application Hub</h3>
                        <p className="services-module-subtitle">
                          Complete all required agency services below. Ready and in-progress applications are sorted on top. Click any service to open its workspace.
                        </p>
                      </div>
                    </div>

                    {/* Progress Summary Pill */}
                    <div className="services-overall-progress">
                      <span className="progress-pill-label">
                        {completedServicesCount} of {rawSteps.length} Services Completed
                      </span>
                      <div className="services-progress-track">
                        <div
                          className="services-progress-fill"
                          style={{ width: `${(completedServicesCount / (rawSteps.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="services-filter-toolbar">
                    <div className="services-filter-buttons">
                      <button
                        type="button"
                        className={`s-filter-btn ${servicesFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setServicesFilter('all')}
                      >
                        All Services ({rawSteps.length})
                      </button>
                      <button
                        type="button"
                        className={`s-filter-btn ${servicesFilter === 'processable' ? 'active' : ''}`}
                        onClick={() => setServicesFilter('processable')}
                      >
                        ⚡ Processable / Active ({rawSteps.filter((s) => s.status !== 'locked' && s.status !== 'completed').length})
                      </button>
                      <button
                        type="button"
                        className={`s-filter-btn ${servicesFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setServicesFilter('completed')}
                      >
                        ✔ Completed ({completedServicesCount})
                      </button>
                      <button
                        type="button"
                        className={`s-filter-btn ${servicesFilter === 'locked' ? 'active' : ''}`}
                        onClick={() => setServicesFilter('locked')}
                      >
                        🔒 Locked ({rawSteps.filter((s) => s.status === 'locked').length})
                      </button>
                    </div>
                  </div>

                  {/* Services List (Smart Sorted: Processable on Top, Locked on Bottom) */}
                  <div className="services-cards-grid">
                    {displayedServices.map((service, sIdx) => {
                      const isLocked = service.status === 'locked';
                      const isCompleted = service.status === 'completed';
                      const isProcessing = service.status === 'processing';
                      const isReview = service.status === 'review_required';
                      const isRejected = service.status === 'rejected';

                      // Find missing dependency titles for locked services
                      const missingDepTitles = (service.dependencies || [])
                        .map((depId) => rawSteps.find((st) => st.id === depId)?.title || depId)
                        .join(', ');

                      return (
                        <div
                          key={service.id || sIdx}
                          className={`service-item-card ${isLocked ? 'card-locked' : 'card-unlocked'} ${isCompleted ? 'card-completed' : ''} ${isReview ? 'card-review' : ''}`}
                          onClick={() => {
                            if (!isLocked) {
                              handleOpenWorkspace(service);
                            }
                          }}
                        >
                          <div className="service-card-main">
                            {/* Top Meta Bar */}
                            <div className="service-card-top">
                              <div className="service-agency-wrap">
                                <span className="service-agency-name">{service.agency}</span>
                              </div>
                            </div>

                            {/* Service Title & Description */}
                            <h4 className="service-item-title">{service.title}</h4>
                            <p className="service-item-desc">{service.description}</p>

                            {/* Prerequisite Requirement Notice */}
                            {isLocked && missingDepTitles && (
                              <div className="service-locked-notice">
                                <Lock size={13} />
                                <span>Locked: Requires <strong>{missingDepTitles}</strong> to be completed first.</span>
                              </div>
                            )}

                            {/* Review Note */}
                            {isReview && (
                              <div className="service-review-notice">
                                <AlertTriangle size={13} />
                                <span>Action needed: Agency officer requested additional information. Click to open workspace.</span>
                              </div>
                            )}

                            {/* Reference Number if Completed */}
                            {isCompleted && service.submissionRecord?.referenceNumber && (
                              <div className="service-completed-ref">
                                <Check size={13} />
                                <span>Official Ref ID: <strong><code>{service.submissionRecord.referenceNumber}</code></strong></span>
                              </div>
                            )}

                            {/* Bottom Meta Tags (Timeframe & Fee) */}
                            <div className="service-bottom-tags">
                              <span className="service-tag-item">
                                <Clock size={12} />
                                <span>{service.timeframe || '1-3 Days'}</span>
                              </span>
                              <span className="service-tag-item">
                                <Wallet size={12} />
                                <span>{service.fee || 'Free'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Right Action Button */}
                          <div className="service-card-action">
                            {isLocked ? (
                              <button
                                type="button"
                                className="open-workspace-btn btn-locked-disabled"
                                disabled
                                title="This service is locked until prerequisites are completed."
                              >
                                <Lock size={15} />
                                <span>Locked</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className={`open-workspace-btn ${isCompleted ? 'btn-view-doc' : isReview ? 'btn-open-review' : isProcessing ? 'btn-processing' : 'btn-open-active'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenWorkspace(service);
                                }}
                              >
                                {isProcessing && <RefreshCw size={14} className="spin-icon" />}
                                {isCompleted && <CheckCircle2 size={15} />}
                                <span>
                                  {isCompleted
                                    ? 'View Workspace'
                                    : isReview
                                    ? 'Resolve Review'
                                    : isProcessing
                                    ? 'Processing'
                                    : isRejected
                                    ? 'Resubmit Application'
                                    : 'Open Workspace'}
                                </span>
                                {!isProcessing && <ChevronRight size={16} />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Advancement to Step 3 */}
                  {allServicesCompleted && (
                    <div className="services-all-completed-footer">
                      <div className="all-completed-text">
                        <Sparkles size={20} className="sparkle-gold" />
                        <div>
                          <h4>All Required Agency Applications Completed!</h4>
                          <p>All licenses, certificates, and tax registrations are verified and approved.</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="proceed-next-step-btn"
                        onClick={() => setCurrentStage(2)}
                      >
                        <span>View Final Summary & Records</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════════
                  STAGE 2: COMPLETED DOSSIER & RECORDS
                 ════════════════════════════════════════════════════════════════ */}
              {currentStage === 2 && (
                <section className="phase-section phase-completed-section">
                  <div className="completed-summary-hero">
                    <div className="completed-trophy-circle">
                      <Award size={36} />
                    </div>
                    <h2>Application Journey Successfully Completed!</h2>
                    <p>
                      All statutory verifications and agency procedures for <strong>{activeApp.title}</strong> are approved and registered with the Government of Malaysia.
                    </p>
                  </div>

                  {/* Registered Records Summary Table */}
                  <div className="completed-records-card">
                    <h3 className="records-card-title">Approved Agency Records & Certificates</h3>
                    <div className="records-list">
                      {rawSteps.map((st, i) => (
                        <div key={st.id || i} className="record-item-row">
                          <div className="record-left">
                            <CheckCircle2 size={18} className="record-check-icon" />
                            <div>
                              <h4>{st.title}</h4>
                              <span className="record-agency-tag">{st.agency}</span>
                            </div>
                          </div>

                          <div className="record-right">
                            <span className="record-ref-id">
                              {st.submissionRecord?.referenceNumber || ('MYG-' + st.id.toUpperCase().replace('STEP-', '') + '-99120')}
                            </span>
                            <button
                              type="button"
                              className="view-record-btn"
                              onClick={() => handleOpenWorkspace(st)}
                            >
                              <ExternalLink size={14} />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Completed Actions */}
                  <div className="completed-footer-actions">
                    <button
                      type="button"
                      className="download-dossier-btn"
                      onClick={() => alert('Official Application Dossier PDF generated and downloaded.')}
                    >
                      <Download size={16} />
                      <span>Download Official Application Dossier</span>
                    </button>

                    <button
                      type="button"
                      className="return-history-btn"
                      onClick={handleBackToList}
                    >
                      <span>Return to Applications List</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </section>
              )}

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              VIEW 3: DEDICATED FULL-PAGE SERVICE WORKSPACE (NO POPUP MODAL)
             ════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'service' && selectedService && activeApp && (
            <ServiceWorkspaceView
              service={selectedService}
              journey={activeApp?.journey}
              activeApp={activeApp}
              username={username}
              onBack={handleBackFromService}
              onUpdateServiceStatus={handleUpdateServiceStatus}
            />
          )}

        </div>
      </main>

      {/* Delete Application Confirmation Modal */}
      {appToDelete && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-modal-icon-wrap">
              <Trash2 size={26} />
            </div>
            <h3 className="delete-modal-title">Delete Application?</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete <strong>{appToDelete.title}</strong> (<code>{appToDelete.id}</code>)?
              This will remove this application and all associated service progress.
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={() => setAppToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleConfirmDelete}
              >
                Yes, Delete Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;

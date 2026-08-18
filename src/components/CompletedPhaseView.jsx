import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  Download,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  MapPin,
  FileCheck2,
  Printer,
  X,
  FileText,
  DollarSign,
  Tag,
  Bell,
  Check,
  Zap,
  Info,
  QrCode
} from 'lucide-react';
import './CompletedPhaseView.css';

export default function CompletedPhaseView({
  activeApp,
  username = 'Jason Tan',
  lang = 'en',
  onOpenWorkspace,
  onBackToList,
  onNavigate
}) {
  const isMalay = lang === 'ms';
  const rawSteps = activeApp?.journey?.steps || [];

  // Modals state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedDocCollection, setSelectedDocCollection] = useState(null);
  const [selectedCertDoc, setSelectedCertDoc] = useState(null);
  const [isAlertsConfigured, setIsAlertsConfigured] = useState(false);
  const [showDossierSuccess, setShowDossierSuccess] = useState(false);
  const [appliedGrants, setAppliedGrants] = useState({});

  // 1. AI Recommendations (Exactly 2 clean opportunities matching user's requirement)
  const aiOpportunities = [
    {
      id: 'grant-sme-digital',
      title: isMalay ? 'Geran Digital PMKS (SME Digital Grant)' : 'SME Digital Grant',
      agency: 'MDEC & BSN (SME Corporation Malaysia)',
      statusBadge: isMalay ? 'Berpotensi layak' : 'Potentially eligible',
      fundingAmount: 'Up to RM5,000 (50% Matching Grant)',
      summary: isMalay
        ? 'Geran padanan 50% sehingga RM5,000 bagi mendigitalkan POS, e-invoicing automatik, dan pesanan QR.'
        : 'Up to RM5,000 50% matching grant for Cloud POS, automated e-invoicing integration, and contactless ordering.',
      matchRationale: isMalay
        ? 'Dipadankan berdasarkan profil perniagaan F&B baharu anda yang telah melengkapkan pendaftaran SSM dan memiliki Nombor Cukai LHDN (TIN).'
        : 'Matched based on your new business profile with verified SSM enterprise registration and active LHDN TIN.',
      keyBenefits: [
        isMalay ? '50% subsidi perkakasan POS & perisian perakaunan cloud' : '50% subsidy for Cloud POS hardware, kitchen display & accounting software',
        isMalay ? 'Penyepaduan segera dengan MyInvois LHDN e-Invoicing' : 'Direct plug-and-play compliance with LHDN MyInvois e-Invoicing standard',
        isMalay ? 'Kelulusan pantas melalui profil MyGateway yang telah disahkan' : 'Fast-tracked 5-day approval using your pre-verified MyGateway credentials'
      ],
      matchedPrerequisites: [
        { label: isMalay ? 'Pendaftaran Entiti SSM' : 'Active SSM Entity Registration', source: 'SSM Borang D' },
        { label: isMalay ? 'Nombor Cukai LHDN (TIN)' : 'LHDN Tax Identification (TIN)', source: 'LHDN e-Daftar' },
        { label: isMalay ? 'Warganegara Malaysia (MyKad)' : 'Malaysian Citizen (MyKad)', source: 'MyDigital ID' },
        { label: isMalay ? 'Premis Berdaftar PBT' : 'Premise Registered with Local Council', source: 'PBT License' }
      ],
      fundableItems: [
        'Cloud POS System & Thermal Receipt Printers',
        'Digital Menu & Table QR Ordering Software',
        'Cloud Inventory & Multi-outlet Kitchen Management',
        'Automated e-Invoicing Accounting Integration'
      ]
    },
    {
      id: 'grant-halal-export',
      title: isMalay ? 'Geran Pembangunan Pasaran Halal' : 'Halal SME Market Expansion Grant',
      agency: 'Halal Development Corporation (HDC) & MATRADE',
      statusBadge: isMalay ? 'Berpotensi layak' : 'Potentially eligible',
      fundingAmount: 'Up to RM300,000 (Market Development Fund)',
      summary: isMalay
        ? 'Bantuan promosi dan pensijilan eksport untuk perniagaan makanan Halal ke pasar raya tempatan dan ASEAN.'
        : 'Financial grant and marketing facilitation for Halal-certified F&B brands to expand into retail supermarkets and ASEAN exports.',
      matchRationale: isMalay
        ? 'Dipadankan kerana perniagaan anda telah memulakan pendaftaran Pensijilan Halal JAKIM.'
        : 'Matched because your entity is registered with active Halal compliance.',
      keyBenefits: [
        isMalay ? 'Subsidi reka bentuk pembungkusan Halal & pensijilan makmal' : 'Subsidized export-grade packaging design and nutritional lab testing',
        isMalay ? 'Penyertaan dalam Ekspo Halal Antarabangsa Malaysia (MIHAS)' : 'Subsidized booth showcase at Malaysia International Halal Showcase (MIHAS)'
      ],
      matchedPrerequisites: [
        { label: isMalay ? 'Sijil Halal JAKIM' : 'JAKIM Halal Verification', source: 'JAKIM MYeHALAL' },
        { label: isMalay ? 'Pendaftaran SSM & Lesen PBT' : 'SSM & Local Council Premise License', source: 'PBT / SSM' }
      ],
      fundableItems: [
        'Halal Packaging & Barcode Compliance',
        'International Food Showcase Booth Rental',
        'Digital Marketing & Commercial E-Commerce Onboarding'
      ]
    }
  ];

  // 2. Upcoming Responsibilities & Expiry Dates
  const upcomingResponsibilities = [
    {
      id: 'resp-premise',
      title: isMalay ? 'Pembaharuan Lesen Premis & Papan Tanda' : 'Premise & Signboard License Renewal',
      agency: 'Local Council (DBKL / PBT)',
      alertText: isMalay
        ? 'Lesen premis anda mungkin memerlukan pembaharuan dalam 12 bulan.'
        : 'Your premise license may require renewal in 12 months.',
      expiryText: isMalay ? 'Luput: 18 Ogos 2027 (12 Bulan)' : 'Expires: 18 Aug 2027 (in 12 months)',
      refCode: 'PBT/KL/2026/099120',
    },
    {
      id: 'resp-halal',
      title: isMalay ? 'Audit Pengesahan & Luput Sijil Halal' : 'Compliance Certificate & Halal Audit Window',
      agency: 'JAKIM / KKM',
      alertText: isMalay
        ? 'Sijil anda tamat tempoh dalam 10 bulan.'
        : 'Your certificate expires in 10 months.',
      expiryText: isMalay ? 'Luput: 18 Jun 2027 (10 Bulan)' : 'Expires: 18 Jun 2027 (in 10 months)',
      refCode: 'JAKIM/HALAL/2026-44102',
    },
    {
      id: 'resp-tax',
      title: isMalay ? 'Pemfailan Cukai Pendapatan Perniagaan (Borang B)' : 'Annual Business Income Tax Filing (Form B)',
      agency: 'Lembaga Hasil Dalam Negeri (LHDN)',
      alertText: isMalay
        ? 'Tarikh akhir pemfailan e-Filing Borang B perniagaan adalah 30 Jun 2027.'
        : 'Annual business income tax filing (Form B) is due on 30 June 2027.',
      expiryText: isMalay ? 'Tarikh Akhir: 30 Jun 2027' : 'Due Date: 30 Jun 2027',
      refCode: 'TIN-IG-910482180',
    }
  ];

  // 3. Obtained Documents, Certificates & Collection Directory
  const documentRecords = [
    {
      id: 'doc-ssm-borang-d',
      title: isMalay ? 'Sijil Perakuan Pendaftaran Perniagaan (Borang D)' : 'SSM Business Registration Certificate (Borang D)',
      agency: 'Suruhanjaya Syarikat Malaysia (SSM)',
      refNumber: 'MYG-SSM-2026-891024',
      expiryDate: isMalay ? '18 Ogos 2027 (Sah 1 Tahun)' : '18 Aug 2027 (Valid for 1 Year)',
      collectionChannel: isMalay ? '100% Muat Turun Digital (PDF & Kod QR)' : '100% Instant Digital Download (PDF & QR)',
      isPhysical: false,
      physicalLocation: {
        buildingName: 'Menara SSM@Sentral',
        address: 'No 7, Jalan Stesen Sentral 5, Kuala Lumpur Sentral, 50470 Kuala Lumpur',
        floorCounter: 'Tingkat 17, Kaunter Salinan Sah Diperakui (CTC)',
        operatingHours: 'Isnin - Jumaat: 8:15 AM - 4:30 PM',
        whatToBring: ['Original MyKad', 'MyGateway Digital Confirmation Slip']
      }
    },
    {
      id: 'doc-pbt-license',
      title: isMalay ? 'Lesen Premis Perniagaan & Permit Iklan PBT' : 'Local Council (PBT) Premise & Signboard License',
      agency: 'Dewan Bandaraya Kuala Lumpur (DBKL) / PBT',
      refNumber: 'PBT/KL/2026/099120',
      expiryDate: isMalay ? '18 Ogos 2027 (Sah 1 Tahun)' : '18 Aug 2027 (Valid for 1 Year)',
      collectionChannel: isMalay ? 'Ambil pelekat hologram di Menara DBKL 2, Tingkat 5 (Kaunter 4 & 5)' : 'Collect physical premise sticker at Menara DBKL 2, Level 5 (Counter 4 & 5)',
      isPhysical: true,
      physicalLocation: {
        buildingName: 'Menara DBKL 2 (Jabatan Pelesenan & Pembangunan Perniagaan)',
        address: 'Jalan Raja Laut, 50350 Kuala Lumpur',
        floorCounter: 'Tingkat 5, Kaunter Pelesenan Komersial (Kaunter 4 & 5)',
        operatingHours: 'Isnin - Jumaat: 8:30 AM - 4:30 PM (Rehat Jumaat: 12:15 PM - 2:45 PM)',
        whatToBring: ['MyKad Pemohon Asal', 'Nombor Rujukan: PBT/KL/2026/099120', 'Salinan SSM Borang D']
      }
    },
    {
      id: 'doc-lhdn-tin',
      title: isMalay ? 'Penyata Pendaftaran Nombor Cukai Pendapatan (TIN)' : 'LHDN Tax Identification Number (TIN) Registration',
      agency: 'Lembaga Hasil Dalam Negeri Malaysia (LHDN)',
      refNumber: 'TIN-IG-910482180',
      expiryDate: isMalay ? 'Kekal / Pemfailan Tahunan Borang B' : 'Perpetual / Annual Form B Filing',
      collectionChannel: isMalay ? '100% Digital e-Daftar Slip di Portal MyTax' : '100% Digital e-Daftar Slip on MyTax Portal',
      isPhysical: false,
      physicalLocation: {
        buildingName: 'LHDN Cawangan Wangsa Maju',
        address: 'Kompleks Pejabat Kerajaan, Jalan Tuanku Abdul Halim, 50480 Kuala Lumpur',
        floorCounter: 'Kaunter MyTax Tingkat 1',
        operatingHours: 'Isnin - Jumaat: 8:00 AM - 5:00 PM',
        whatToBring: ['Original MyKad', 'Tax Reference TIN']
      }
    },
    {
      id: 'doc-jakim-halal',
      title: isMalay ? 'Sijil Pengesahan Halal Malaysia (MYeHALAL)' : 'Official Malaysia Halal Certification (JAKIM)',
      agency: 'Jabatan Kemajuan Islam Malaysia (JAKIM)',
      refNumber: 'JAKIM/HALAL/2026-44102',
      expiryDate: isMalay ? '18 Ogos 2028 (Sah 2 Tahun)' : '18 Aug 2028 (Valid for 2 Years)',
      collectionChannel: isMalay ? 'Penghantaran pos laju atau ambil plak di Kompleks Islam Putrajaya (Aras 6)' : 'Courier delivery to premise or collect plaque at Kompleks Islam Putrajaya (Level 6)',
      isPhysical: true,
      physicalLocation: {
        buildingName: 'Kompleks Islam Putrajaya (Bahagian Pengurusan Halal JAKIM)',
        address: 'Blok D, Aras 6, No 45 Persiaran Perdana, Presint 3, 62100 Putrajaya',
        floorCounter: 'Aras 6, Kaunter Serahan Sijil & Plak Halal',
        operatingHours: 'Isnin - Jumaat: 8:30 AM - 4:00 PM',
        whatToBring: ['Surat Kelulusan MYeHALAL Digital', 'Kad Pengenalan Eksekutif Halal / Pemilik']
      }
    }
  ];

  // Calendar Export
  const handleExportCalendar = () => {
    const calendarEvents = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MyGateway Government Portal//Statutory Reminders//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'SUMMARY:DBKL / PBT Premise License Renewal (MyGateway Reminder)',
      'DESCRIPTION:Statutory renewal reminder for commercial premise operating license.',
      'DTSTART:20270818T010000Z',
      'DTEND:20270818T020000Z',
      'LOCATION:Dewan Bandaraya Kuala Lumpur / MyGateway e-Service',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:JAKIM Halal Surveillance & Audit Window (MyGateway Reminder)',
      'DESCRIPTION:Halal compliance audit and certificate surveillance inspection window.',
      'DTSTART:20270618T010000Z',
      'DTEND:20270618T020000Z',
      'LOCATION:Registered Business Premise / JAKIM MYeHALAL',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:LHDN Business Income Tax Form B Filing Deadline',
      'DESCRIPTION:Mandatory statutory deadline for business income tax filing via LHDN e-Filing.',
      'DTSTART:20270630T010000Z',
      'DTEND:20270630T020000Z',
      'LOCATION:LHDN MyTax Portal',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([calendarEvents], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MyGateway_Statutory_Responsibilities.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDossier = () => {
    setShowDossierSuccess(true);
    setTimeout(() => setShowDossierSuccess(false), 4000);
  };

  return (
    <section className="phase-section phase-completed-section">

      {/* ── 1. Hero Completion Summary ── */}
      <div className="completed-summary-hero">
        <div className="completed-trophy-circle">
          <Award size={34} />
        </div>
        <h2>{isMalay ? 'Perjalanan Permohonan Berjaya Diselesaikan!' : 'Application Journey Successfully Completed!'}</h2>
        <p>
          {isMalay ? (
            <>Semua pengesahan statutori dan permohonan agensi untuk <strong>{activeApp?.title || 'Perniagaan Anda'}</strong> telah diluluskan dan didaftarkan dengan Kerajaan Malaysia.</>
          ) : (
            <>All statutory verifications and agency procedures for <strong>{activeApp?.title || 'Your Application'}</strong> are approved and registered with the Government of Malaysia.</>
          )}
        </p>
      </div>

      {/* ── 2. AI Recommendations Card (As explicitly requested) ── */}
      <div className="completed-sub-card ai-rec-card">
        <div className="sub-card-header">
          <div className="sub-card-title-wrap">
            <Sparkles size={18} className="text-emerald" />
            <div>
              <h3 className="sub-card-title">{isMalay ? 'Cadangan AI (AI Recommendations)' : 'AI Recommendations'}</h3>
              <p className="sub-card-desc">
                {isMalay
                  ? 'Berdasarkan profil perniagaan baharu anda, MyGateway menemui 2 peluang yang berpotensi relevan.'
                  : 'Based on your new business profile, MyGateway found 2 potentially relevant opportunities.'}
              </p>
            </div>
          </div>
        </div>

        <div className="clean-list-group">
          {aiOpportunities.map((opp) => (
            <div key={opp.id} className="clean-list-row opp-list-row">
              <div className="row-main-col">
                <div className="row-title-line">
                  <h4 className="row-item-heading">{opp.title}</h4>
                  <span className="clean-pill-green">{opp.statusBadge}</span>
                </div>
                <div className="row-sub-line">
                  <span className="row-agency-name">{opp.agency}</span>
                  <span className="row-bullet">•</span>
                  <span className="row-highlight-val">{opp.fundingAmount}</span>
                  <span className="row-bullet">•</span>
                  <span className="row-summary-text">{opp.summary}</span>
                </div>
              </div>

              <div className="row-action-col">
                <button
                  type="button"
                  className="clean-btn-explore"
                  onClick={() => setSelectedOpportunity(opp)}
                >
                  <span>{isMalay ? 'Terokai' : 'Explore'}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Upcoming Responsibilities Card (As explicitly requested) ── */}
      <div className="completed-sub-card responsibilities-card">
        <div className="sub-card-header">
          <div className="sub-card-title-wrap">
            <Clock size={18} className="text-amber" />
            <div>
              <h3 className="sub-card-title">{isMalay ? 'Tanggungjawab Akan Datang' : 'Upcoming Responsibilities'}</h3>
              <p className="sub-card-desc">
                {isMalay
                  ? 'Peringatan statutori untuk pembaharuan lesen dan tarikh akhir kepatuhan.'
                  : 'Statutory compliance tracking and proactive license renewal reminders.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="clean-btn-cal"
            onClick={handleExportCalendar}
          >
            <Calendar size={14} />
            <span>{isMalay ? 'Eksport ke Kalendar (.ics)' : 'Add to Calendar (.ics)'}</span>
          </button>
        </div>

        <div className="clean-list-group">
          {upcomingResponsibilities.map((resp) => (
            <div key={resp.id} className="clean-list-row resp-list-row">
              <div className="row-main-col">
                <div className="row-title-line">
                  <h4 className="row-item-heading">{resp.title}</h4>
                  <span className="row-agency-tag">{resp.agency}</span>
                </div>
                <div className="row-alert-text">
                  <span>{resp.alertText}</span>
                </div>
              </div>

              <div className="row-action-col">
                <span className="resp-date-tag">{resp.expiryText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Obtained Documents/Results & Collection Directory (As explicitly requested) ── */}
      <div className="completed-sub-card documents-card">
        <div className="sub-card-header">
          <div className="sub-card-title-wrap">
            <FileCheck2 size={18} className="text-blue" />
            <div>
              <h3 className="sub-card-title">{isMalay ? 'Dokumen / Sijil Diperolehi' : 'Obtained Documents/Results'}</h3>
              <p className="sub-card-desc">
                {isMalay
                  ? 'Maklumat sijil rasmi, tarikh luput penting, dan lokasi pengambilan dokumen di bangunan kerajaan.'
                  : 'Approved statutory records, important expiry dates, and collection locations at government buildings.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="clean-btn-dossier-download"
            onClick={handleDownloadDossier}
          >
            <Download size={14} />
            <span>{isMalay ? 'Muat Turun Dossier Lengkap' : 'Download Complete Dossier'}</span>
          </button>
        </div>

        {showDossierSuccess && (
          <div className="dossier-success-banner">
            <CheckCircle2 size={16} />
            <span>{isMalay ? 'Pakej Dossier Rasmi Permohonan (PDF Lengkap & Sijil Berperakuan) berjaya dimuat turun.' : 'Official Application Dossier Pack (Consolidated PDF & Certified Records) generated and downloaded.'}</span>
          </div>
        )}

        <div className="clean-list-group">
          {documentRecords.map((docItem) => (
            <div key={docItem.id} className="clean-list-row doc-list-row">
              <div className="row-main-col">
                <div className="row-title-line">
                  <CheckCircle2 size={16} className="doc-check-ico" />
                  <h4 className="row-item-heading">{docItem.title}</h4>
                  <span className="row-agency-tag">{docItem.agency}</span>
                  <span className="doc-ref-id">{docItem.refNumber}</span>
                </div>

                <div className="doc-meta-info-line">
                  <span className="meta-segment">
                    <strong>{isMalay ? 'Tarikh Luput:' : 'Expiry Date:'}</strong> {docItem.expiryDate}
                  </span>
                  <span className="row-bullet">•</span>
                  <span className="meta-segment">
                    <strong>{isMalay ? 'Lokasi Pengambilan:' : 'Where to obtain:'}</strong> {docItem.collectionChannel}
                  </span>
                </div>
              </div>

              <div className="doc-buttons-col">
                <button
                  type="button"
                  className="btn-action-view-cert"
                  onClick={() => setSelectedCertDoc(docItem)}
                >
                  <Award size={13} />
                  <span>{isMalay ? 'Papar Sijil' : 'View Certificate'}</span>
                </button>

                <button
                  type="button"
                  className="btn-action-dl-cert"
                  title="Download PDF"
                  onClick={() => alert(`Official PDF Certificate downloaded for ${docItem.title}`)}
                >
                  <Download size={13} />
                  <span>PDF</span>
                </button>

                {docItem.isPhysical && docItem.physicalLocation && (
                  <button
                    type="button"
                    className="btn-action-counter-info"
                    title="View physical collection counter information"
                    onClick={() => setSelectedDocCollection(docItem)}
                  >
                    <MapPin size={13} />
                    <span>{isMalay ? 'Info Kaunter' : 'Counter Info'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Completed Actions Footer ── */}
      <div className="completed-footer-actions">
        <button
          type="button"
          className="return-history-btn"
          onClick={onBackToList}
        >
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
          <span>{isMalay ? 'Kembali ke Senarai Permohonan' : 'Return to Applications List'}</span>
        </button>

        <button
          type="button"
          className="start-next-journey-btn"
          onClick={() => onNavigate && onNavigate('ai')}
        >
          <Sparkles size={15} />
          <span>{isMalay ? 'Mulakan Permohonan Baharu dengan AI' : 'Start Next Journey with AI'}</span>
        </button>
      </div>

      {/* ── MODAL 1: AI Opportunity Modal ── */}
      {selectedOpportunity && (
        <div className="completed-modal-overlay" onClick={() => setSelectedOpportunity(null)}>
          <div className="completed-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <div className="modal-eyebrow">
                  <Sparkles size={13} />
                  <span>{isMalay ? 'Cadangan Peluang AI MyGateway' : 'MyGateway AI Opportunity'}</span>
                </div>
                <h3 className="modal-title">{selectedOpportunity.title}</h3>
                <span className="modal-agency">{selectedOpportunity.agency}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOpportunity(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="grant-val-box">
                <DollarSign size={20} className="text-emerald" />
                <div>
                  <span className="val-lbl">{isMalay ? 'Jumlah Geran / Pembiayaan:' : 'Grant / Financing Amount:'}</span>
                  <h4 className="val-amt">{selectedOpportunity.fundingAmount}</h4>
                </div>
              </div>

              <div className="modal-sec">
                <h4 className="sec-lbl">{isMalay ? 'Gambaran Keseluruhan' : 'Overview & Benefits'}</h4>
                <p className="sec-txt">{selectedOpportunity.summary}</p>
                <div className="benefits-list">
                  {selectedOpportunity.keyBenefits.map((bnf, bIdx) => (
                    <div key={bIdx} className="benefit-row">
                      <CheckCircle2 size={14} className="text-emerald" />
                      <span>{bnf}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-sec">
                <h4 className="sec-lbl">{isMalay ? 'Kriteria Kelayakan Dipenuhi' : 'Pre-Verified Eligibility from Journey'}</h4>
                <div className="pr-list">
                  {selectedOpportunity.matchedPrerequisites.map((pr, pIdx) => (
                    <div key={pIdx} className="pr-row">
                      <div className="pr-left">
                        <Check size={14} className="text-emerald" />
                        <span>{pr.label}</span>
                      </div>
                      <span className="pr-source-tag">{pr.source}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-sec">
                <h4 className="sec-lbl">{isMalay ? 'Perbelanjaan Layak Dituntut' : 'Fundable Expenditures'}</h4>
                <div className="chips-wrap">
                  {selectedOpportunity.fundableItems.map((fi, fIdx) => (
                    <span key={fIdx} className="fundable-tag">
                      <Tag size={11} />
                      <span>{fi}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setSelectedOpportunity(null)}
              >
                {isMalay ? 'Tutup' : 'Close'}
              </button>

              <button
                type="button"
                className="btn-modal-apply"
                onClick={() => {
                  alert(isMalay ? `Permohonan untuk ${selectedOpportunity.title} telah dijana dengan profil MyGateway anda!` : `Grant application for ${selectedOpportunity.title} initiated with your verified credentials!`);
                  setSelectedOpportunity(null);
                }}
              >
                <Zap size={14} />
                <span>{isMalay ? 'Mohon Segera dengan Profil MyGateway' : 'Fast-Track Apply with Completed Dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Physical Counter Collection Modal ── */}
      {selectedDocCollection && (
        <div className="completed-modal-overlay" onClick={() => setSelectedDocCollection(null)}>
          <div className="completed-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <div className="modal-eyebrow">
                  <Building2 size={13} />
                  <span>{isMalay ? 'Pusat Pengambilan Kaunter Kerajaan' : 'Government Counter Collection Point'}</span>
                </div>
                <h3 className="modal-title">{selectedDocCollection.title}</h3>
                <span className="modal-agency">{selectedDocCollection.agency}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedDocCollection(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="counter-details-box">
                <div className="counter-bldg-row">
                  <MapPin size={18} className="text-blue" />
                  <div>
                    <h4 className="bldg-name">{selectedDocCollection.physicalLocation.buildingName}</h4>
                    <p className="bldg-addr">{selectedDocCollection.physicalLocation.address}</p>
                  </div>
                </div>

                <div className="counter-meta-grid">
                  <div className="cm-item">
                    <span className="cm-lbl">{isMalay ? 'Kaunter:' : 'Floor & Counter:'}</span>
                    <span className="cm-val">{selectedDocCollection.physicalLocation.floorCounter}</span>
                  </div>
                  <div className="cm-item">
                    <span className="cm-lbl">{isMalay ? 'Waktu Urusan:' : 'Operating Hours:'}</span>
                    <span className="cm-val">{selectedDocCollection.physicalLocation.operatingHours}</span>
                  </div>
                </div>
              </div>

              <div className="modal-sec">
                <h4 className="sec-lbl">{isMalay ? 'Dokumen Diperlukan Semasa Pengambilan' : 'Required Items to Bring'}</h4>
                <div className="benefits-list">
                  {selectedDocCollection.physicalLocation.whatToBring.map((item, wIdx) => (
                    <div key={wIdx} className="benefit-row">
                      <CheckCircle2 size={14} className="text-emerald" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setSelectedDocCollection(null)}
              >
                {isMalay ? 'Tutup' : 'Close'}
              </button>

              <button
                type="button"
                className="btn-modal-apply"
                onClick={() => {
                  window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedDocCollection.physicalLocation.buildingName + ' ' + selectedDocCollection.physicalLocation.address)}`, '_blank');
                }}
              >
                <MapPin size={14} />
                <span>{isMalay ? 'Buka Google Maps' : 'Open Google Maps'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Certificate Preview Modal ── */}
      {selectedCertDoc && (
        <div className="completed-modal-overlay" onClick={() => setSelectedCertDoc(null)}>
          <div className="completed-modal-card cert-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title">{selectedCertDoc.title}</h3>
                <span className="modal-agency">{selectedCertDoc.agency}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCertDoc(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="cert-preview-paper">
                <div className="cert-crest-ico">
                  <Building2 size={32} />
                </div>
                <h3 className="cert-gov-txt">GOVERNMENT OF MALAYSIA</h3>
                <h4 className="cert-agency-txt">{selectedCertDoc.agency.toUpperCase()}</h4>
                <h5 className="cert-doc-type">OFFICIAL STATUTORY REGISTRATION CERTIFICATE</h5>

                <div className="cert-specs-table">
                  <div className="cs-row">
                    <span className="cs-k">Certificate Ref:</span>
                    <span className="cs-v mono">{selectedCertDoc.refNumber}</span>
                  </div>
                  <div className="cs-row">
                    <span className="cs-k">Business / Entity:</span>
                    <span className="cs-v">Tan Deli & Cafe Enterprise</span>
                  </div>
                  <div className="cs-row">
                    <span className="cs-k">Applicant Name:</span>
                    <span className="cs-v">{username} (980315-14-5219)</span>
                  </div>
                  <div className="cs-row">
                    <span className="cs-k">Expiry & Validity:</span>
                    <span className="cs-v text-emerald">{selectedCertDoc.expiryDate}</span>
                  </div>
                  <div className="cs-row">
                    <span className="cs-k">Ledger Status:</span>
                    <span className="cs-v text-emerald">ACTIVE & REGISTERED</span>
                  </div>
                </div>

                <div className="cert-bottom-stamps">
                  <div className="qr-col">
                    <QrCode size={46} />
                    <span>MyGateway Ledger Seal</span>
                  </div>
                  <div className="seal-col">
                    <div className="seal-round">
                      <FileCheck2 size={20} />
                      <span>OFFICIAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setSelectedCertDoc(null)}
              >
                {isMalay ? 'Tutup' : 'Close'}
              </button>

              <button
                type="button"
                className="btn-modal-print"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>{isMalay ? 'Cetak' : 'Print'}</span>
              </button>

              <button
                type="button"
                className="btn-modal-apply"
                onClick={() => alert(`Official PDF Certificate downloaded for ${selectedCertDoc.title}`)}
              >
                <Download size={14} />
                <span>{isMalay ? 'Muat Turun PDF' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

import React, { useState, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  CheckCircle2,
  Download,
  Bell,
  ShieldCheck,
  FileText,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  MapPin,
  Info
} from 'lucide-react';
import Navbar from './Navbar';
import './CalendarPage.css';

// Helper function to format local date YYYY-MM-DD safely without timezone shifts
const formatLocalDateKey = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const RAW_DEADLINES = [
  {
    id: 'evt-kwsp-perkeso-monthly',
    title: 'Monthly EPF (KWSP) & SOCSO (PERKESO) Staff Contribution',
    titleMY: 'Caruman Bulanan KWSP & PERKESO Pekerja',
    agency: 'KWSP & PERKESO Malaysia',
    category: 'statutory',
    date: '2026-09-15',
    day: '15',
    monthShort: 'SEP',
    year: '2026',
    time: '11:59 PM',
    urgency: 'normal',
    horizon: 'In 4 Weeks',
    horizonMY: '4 Minggu Lagi',
    refNumber: 'EPF-194820194',
    description: 'Monthly statutory social security and retirement savings submission for registered employees.',
    descriptionMY: 'Caruman keselamatan sosial dan persaraan bulanan untuk kakitangan berdaftar.',
    location: 'i-Akaun Majikan / ASSIST Portal',
    actionType: 'view_details'
  },
  {
    id: 'evt-sme-grant-window',
    title: 'SME Digital Grant (Geran Digital PMKS) Intake Cycle',
    titleMY: 'Kitaran Permohonan Geran Digital PMKS',
    agency: 'MDEC & BSN (SME Corp)',
    category: 'grants',
    date: '2026-09-30',
    day: '30',
    monthShort: 'SEP',
    year: '2026',
    time: '5:00 PM',
    urgency: 'normal',
    horizon: 'In 6 Weeks',
    horizonMY: '6 Minggu Lagi',
    refNumber: 'MDEC-PMKS-2026-Q3',
    description: 'Intake window closing for RM5,000 50% matching grant on Cloud POS and digital tools.',
    descriptionMY: 'Penutupan kitaran permohonan geran padanan RM5,000 bagi perkakasan POS digital.',
    location: 'BSN SME Digital Portal',
    actionType: 'explore_grant'
  },
  {
    id: 'evt-einvoice-oct-2026',
    title: 'LHDN Mandatory e-Invoicing Phase 3 Integration Check',
    titleMY: 'Semakan Integrasi e-Invois LHDN Fasa 3',
    agency: 'LHDN MyInvois Central Ledger',
    category: 'tax',
    date: '2026-10-01',
    day: '01',
    monthShort: 'OCT',
    year: '2026',
    time: '9:00 AM',
    urgency: 'medium',
    horizon: 'In 2 Months',
    horizonMY: '2 Bulan Lagi',
    refNumber: 'MYINVOIS-MYG-9982',
    description: 'Statutory compliance validation for commercial e-invoicing transmission to LHDN servers.',
    descriptionMY: 'Semakan pematuhan statutori bagi penghantaran e-invois komersial ke pelayan LHDN.',
    location: 'MyInvois Developer Portal',
    actionType: 'view_details'
  },
  {
    id: 'evt-str-payout-2026',
    title: 'STR Phase 4 Cash Aid Disbursement Window',
    titleMY: 'Kredit Bantuan Sumbangan Tunai Rahmah (STR) Fasa 4',
    agency: 'Kementerian Kewangan (MOF) / PADU',
    category: 'grants',
    date: '2026-11-20',
    day: '20',
    monthShort: 'NOV',
    year: '2026',
    time: '8:00 AM',
    urgency: 'normal',
    horizon: 'In 3 Months',
    horizonMY: '3 Bulan Lagi',
    refNumber: 'PADU-STR-2026-B40',
    description: 'Direct bank account credit of national household cash assistance.',
    descriptionMY: 'Kredit terus ke akaun bank bagi bantuan tunai isi rumah/bujang B40 berdaftar PADU.',
    location: 'Maybank Account •••• 8471',
    actionType: 'view_details'
  },
  {
    id: 'evt-halal-audit-2027',
    title: 'JAKIM Halal Surveillance Audit & Certificate Expiry',
    titleMY: 'Audit Pengawasan Halal JAKIM & Luput Sijil',
    agency: 'Jabatan Kemajuan Islam Malaysia (JAKIM)',
    category: 'compliance',
    date: '2027-06-18',
    day: '18',
    monthShort: 'JUN',
    year: '2027',
    time: '5:00 PM',
    urgency: 'medium',
    horizon: 'In 10 Months',
    horizonMY: '10 Bulan Lagi',
    refNumber: 'JAKIM/HALAL/2026-44102',
    description: 'Annual surveillance audit of Halal Assurance System (HAS) and raw ingredients traceability.',
    descriptionMY: 'Pemeriksaan pengawasan tahunan Sistem Jaminan Halal (HAS) dan kebolehkesanan bahan mentah.',
    location: 'Registered Premise / MYeHALAL',
    actionType: 'view_details'
  },
  {
    id: 'evt-tax-form-b-2027',
    title: 'LHDN Business Income Tax e-Filing (Form B) Deadline',
    titleMY: 'Tarikh Akhir e-Filing Cukai Pendapatan Perniagaan (Borang B)',
    agency: 'Lembaga Hasil Dalam Negeri (LHDN)',
    category: 'tax',
    date: '2027-06-30',
    day: '30',
    monthShort: 'JUN',
    year: '2027',
    time: '11:59 PM',
    urgency: 'high',
    horizon: 'In 10 Months',
    horizonMY: '10 Bulan Lagi',
    refNumber: 'TIN-IG-910482180',
    description: 'Statutory deadline for individual sole-proprietor business income tax filing (YA 2026).',
    descriptionMY: 'Tarikh akhir statutori e-Filing cukai pendapatan perniagaan individu bagi Tahun Taksiran 2026.',
    location: 'LHDN MyTax Portal',
    actionType: 'view_details'
  },
  {
    id: 'evt-pbt-renewal-2027',
    title: 'DBKL / PBT Premise & Signboard License Renewal',
    titleMY: 'Pembaharuan Lesen Premis & Papan Tanda DBKL / PBT',
    agency: 'Dewan Bandaraya Kuala Lumpur (DBKL)',
    category: 'licenses',
    date: '2027-08-18',
    day: '18',
    monthShort: 'AUG',
    year: '2027',
    time: '11:59 PM',
    urgency: 'high',
    horizon: 'In 12 Months',
    horizonMY: '12 Bulan Lagi',
    refNumber: 'PBT/KL/2026/099120',
    description: 'Mandatory statutory renewal for commercial premise operating license and advertising signboard.',
    descriptionMY: 'Pembaharuan statutori wajib untuk lesen operasi premis restoran komersial dan papan tanda iklan.',
    location: 'Menara DBKL 2, Level 5 / MyGateway e-Service',
    actionType: 'renew_service'
  },
  {
    id: 'evt-ssm-renewal-2027',
    title: 'SSM Business Registration Annual Renewal (Borang D)',
    titleMY: 'Pembaharuan Pendaftaran Perniagaan SSM (Borang D)',
    agency: 'Suruhanjaya Syarikat Malaysia (SSM)',
    category: 'licenses',
    date: '2027-08-18',
    day: '18',
    monthShort: 'AUG',
    year: '2027',
    time: '11:59 PM',
    urgency: 'high',
    horizon: 'In 12 Months',
    horizonMY: '12 Bulan Lagi',
    refNumber: 'MYG-SSM-2026-891024',
    description: 'Annual enterprise registration renewal under Registration of Businesses Act 1956.',
    descriptionMY: 'Pembaharuan pendaftaran perniagaan tahunan milikan tunggal di bawah Akta Pendaftaran Perniagaan 1956.',
    location: 'SSM EzBiz / MyGateway Portal',
    actionType: 'renew_service'
  }
];

export default function CalendarPage({
  username = 'Jason',
  onLogout,
  onNavigate,
  lang = 'EN',
  onLangChange
}) {
  const isMalay = lang === 'MY' || lang === 'ms';

  const [selectedDate, setSelectedDate] = useState(new Date(2026, 7, 18));
  const [activeMonth, setActiveMonth] = useState(new Date(2026, 7, 1));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Chronologically sorted deadlines (earliest to latest)
  const sortedDeadlines = useMemo(() => {
    return [...RAW_DEADLINES].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  // Month navigation
  const handlePrevMonth = () => {
    setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 7, 18);
    setActiveMonth(new Date(2026, 7, 1));
    setSelectedDate(today);
  };

  // Calendar Day Matrix with timezone-safe formatting
  const calendarDays = useMemo(() => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateObj = new Date(year, month - 1, d);
      days.push({
        date: dateObj,
        dayNum: d,
        isCurrentMonth: false,
        dateKey: formatLocalDateKey(dateObj)
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      days.push({
        date: dateObj,
        dayNum: d,
        isCurrentMonth: true,
        dateKey: formatLocalDateKey(dateObj)
      });
    }

    // Next month padding to fill grid
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d);
      days.push({
        date: dateObj,
        dayNum: d,
        isCurrentMonth: false,
        dateKey: formatLocalDateKey(dateObj)
      });
    }

    return days;
  }, [activeMonth]);

  // Events map by dateKey for calendar dots
  const eventsByDate = useMemo(() => {
    const map = {};
    sortedDeadlines.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [sortedDeadlines]);

  const monthYearLabel = activeMonth.toLocaleDateString(isMalay ? 'ms-MY' : 'en-US', {
    month: 'long',
    year: 'numeric'
  });

  const selectedDateKey = formatLocalDateKey(selectedDate);

  // Calendar Export .ICS
  const handleExportAllCalendar = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MyGateway Government Portal//Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...sortedDeadlines.map(evt => `BEGIN:VEVENT\r\nSUMMARY:${evt.title}\r\nDESCRIPTION:${evt.description} (Ref: ${evt.refNumber})\r\nDTSTART:${evt.date.replace(/-/g, '')}T090000Z\r\nDTEND:${evt.date.replace(/-/g, '')}T100000Z\r\nLOCATION:${evt.location}\r\nSTATUS:CONFIRMED\r\nEND:VEVENT`)
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MyGateway_Government_Deadlines.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(isMalay ? 'Jadual kalendar (.ics) berjaya dimuat turun.' : 'Schedule (.ics) exported successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="gov-calendar-page-root">
      <Navbar
        username={username}
        onLogout={onLogout}
        onNavigate={onNavigate}
        activePage="calendar"
        lang={lang}
        onLangChange={onLangChange}
      />

      <main className="gov-calendar-main-content">
        <div className="gov-calendar-container">

          {/* ── Top Header ── */}
          <div className="gov-cal-top-header">
            <div>
              <h1 className="gov-cal-title">
                {isMalay ? 'Kalendar Tanggungjawab Kerajaan & Tarikh Luput' : 'Government Calendar & Expiry Schedule'}
              </h1>
              <p className="gov-cal-subtitle">
                {isMalay
                  ? 'Pantau tarikh luput lesen, pembaharuan permit statutori, dan tarikh akhir permohonan kerajaan.'
                  : 'Track official license renewals, document expiry dates, and statutory government deadlines.'}
              </p>
            </div>

            <button
              type="button"
              className="gov-cal-btn-export"
              onClick={handleExportAllCalendar}
            >
              <Download size={15} />
              <span>{isMalay ? 'Eksport ke Kalendar (.ics)' : 'Add to Calendar (.ics)'}</span>
            </button>
          </div>

          {toastMessage && (
            <div className="gov-cal-toast">
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ── Main Two-Column View: Identical Card Heights ── */}
          <div className="gov-cal-two-column-layout">

            {/* Left: Interactive Month Calendar */}
            <div className="gov-cal-month-card">
              <div>
                <div className="month-card-header">
                  <h3 className="month-label">{monthYearLabel}</h3>
                  
                  <div className="month-nav-controls">
                    <button type="button" className="btn-today-shortcut" onClick={handleToday}>
                      {isMalay ? 'Hari Ini' : 'Today'}
                    </button>
                    <button type="button" className="btn-arrow-nav" onClick={handlePrevMonth} title="Previous Month">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" className="btn-arrow-nav" onClick={handleNextMonth} title="Next Month">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="weekdays-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d} className="weekday-text">{d}</span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="days-number-grid">
                  {calendarDays.map((cell, idx) => {
                    const isSelected = selectedDateKey === cell.dateKey;
                    const dayEvents = eventsByDate[cell.dateKey] || [];
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <div
                        key={idx}
                        className={`day-box ${!cell.isCurrentMonth ? 'day-other-month' : ''} ${isSelected ? 'day-active-selected' : ''} ${hasEvents ? 'day-has-events' : ''}`}
                        onClick={() => {
                          setSelectedDate(cell.date);
                          if (!cell.isCurrentMonth) {
                            setActiveMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                          }
                          if (hasEvents) {
                            setSelectedEvent(dayEvents[0]);
                          }
                        }}
                      >
                        <span className="day-val">{cell.dayNum}</span>

                        {hasEvents && (
                          <div className="day-dots-wrap">
                            {dayEvents.map((e, eIdx) => (
                              <span
                                key={eIdx}
                                className={`dot-indicator dot-${e.category}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="cal-legend-bar">
                <div className="leg-item"><span className="dot-indicator dot-licenses" /><span>{isMalay ? 'Lesen & Luput' : 'Licenses & Expiries'}</span></div>
                <div className="leg-item"><span className="dot-indicator dot-tax" /><span>{isMalay ? 'Cukai LHDN' : 'Tax & LHDN'}</span></div>
                <div className="leg-item"><span className="dot-indicator dot-compliance" /><span>{isMalay ? 'Audit Halal' : 'Compliance & Audits'}</span></div>
                <div className="leg-item"><span className="dot-indicator dot-grants" /><span>{isMalay ? 'Geran & Bantuan' : 'Grants & Aid'}</span></div>
              </div>
            </div>

            {/* Right: Upcoming Deadlines Card matching exact height */}
            <div className="gov-cal-deadlines-card">
              <div className="deadlines-card-header">
                <div>
                  <h3 className="deadlines-heading">
                    {isMalay ? 'Senarai Tarikh Akhir & Tanggungjawab' : 'Upcoming Deadlines'}
                  </h3>
                  <p className="deadlines-sub">
                    {isMalay
                      ? 'Disusun mengikut turutan tarikh paling hampir.'
                      : 'Sorted chronologically from nearest date.'}
                  </p>
                </div>
                <span className="count-badge">
                  {sortedDeadlines.length} {isMalay ? 'Perkara' : 'Items'}
                </span>
              </div>

              {/* Scrollable Container with Smooth Scrollbar */}
              <div className="deadlines-items-scroll-list">
                {sortedDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className={`deadline-row-item ${selectedEvent?.id === item.id || selectedDateKey === item.date ? 'active-row' : ''}`}
                    onClick={() => {
                      setSelectedEvent(item);
                      const [y, m, d] = item.date.split('-').map(Number);
                      setSelectedDate(new Date(y, m - 1, d));
                      setActiveMonth(new Date(y, m - 1, 1));
                    }}
                  >
                    {/* Date Block */}
                    <div className="item-date-badge">
                      <span className="date-month">{item.monthShort}</span>
                      <span className="date-day">{item.day}</span>
                      <span className="date-year">{item.year}</span>
                    </div>

                    {/* Content Block */}
                    <div className="item-content-body">
                      <div className="item-top-meta">
                        <span className="agency-tag">{item.agency}</span>
                        <span className={`horizon-badge horizon-${item.urgency}`}>
                          <Clock size={11} />
                          <span>{isMalay ? item.horizonMY : item.horizon}</span>
                        </span>
                      </div>

                      <h4 className="item-title">{isMalay && item.titleMY ? item.titleMY : item.title}</h4>
                      <p className="item-desc">{isMalay && item.descriptionMY ? item.descriptionMY : item.description}</p>
                    </div>

                    {/* Action Button */}
                    <div className="item-action-end">
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(item);
                        }}
                      >
                        <span>{isMalay ? 'Perincian' : 'Details'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ── Event Details Modal ── */}
      {selectedEvent && (
        <div className="gov-cal-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="gov-cal-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div>
                <span className="modal-agency-lbl">{selectedEvent.agency}</span>
                <h3 className="modal-heading-title">{isMalay && selectedEvent.titleMY ? selectedEvent.titleMY : selectedEvent.title}</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setSelectedEvent(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-content-body">
              <div className="modal-deadline-strip">
                <div>
                  <span className="strip-lbl">{isMalay ? 'Tarikh Akhir Statutori:' : 'Statutory Deadline:'}</span>
                  <h4 className="strip-val mono">{selectedEvent.date} ({selectedEvent.time})</h4>
                </div>
                <span className={`horizon-badge horizon-${selectedEvent.urgency}`}>
                  <Clock size={12} />
                  <span>{isMalay ? selectedEvent.horizonMY : selectedEvent.horizon}</span>
                </span>
              </div>

              <div className="modal-desc-section">
                <h4 className="desc-heading">{isMalay ? 'Keterangan Statutori & Tindakan' : 'Statutory Details & Action'}</h4>
                <p className="desc-text">{isMalay && selectedEvent.descriptionMY ? selectedEvent.descriptionMY : selectedEvent.description}</p>
              </div>

              <div className="modal-ref-grid">
                <div className="ref-cell">
                  <span className="ref-k">{isMalay ? 'Nombor Rujukan / Lesen:' : 'Reference / License No:'}</span>
                  <span className="ref-v mono">{selectedEvent.refNumber}</span>
                </div>
                <div className="ref-cell">
                  <span className="ref-k">{isMalay ? 'Saluran / Lokasi Tindakan:' : 'Action Channel / Location:'}</span>
                  <span className="ref-v">{selectedEvent.location}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer-bar">
              <button type="button" className="btn-modal-close" onClick={() => setSelectedEvent(null)}>
                {isMalay ? 'Tutup' : 'Close'}
              </button>

              <button
                type="button"
                className="btn-modal-action-link"
                onClick={() => {
                  onNavigate && onNavigate('applications');
                  setSelectedEvent(null);
                }}
              >
                <span>{isMalay ? 'Buka di Ruang Kerja Permohonan' : 'Open in Application Workspace'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

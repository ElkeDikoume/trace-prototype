// Phase 4 — 3-tab case view (Overview / Notes / Documents).
// Opened when a caseworker taps a case card. Receives the case object; the
// Overview tab shows structured data + a follow-up task checklist, Notes lists
// sessions, Documents streams AI-generated documents.
import { useEffect, useState } from 'react';
import DocumentModal from '../components/DocumentModal.jsx';
import ServiceFinderModal from '../components/ServiceFinderModal.jsx';
import CasePrintScreen from './CasePrintScreen.jsx';
import { RISK_BANNER, RISK_PANEL, RISK_LABEL, RISK_TEXT, RISK_DOT } from '../theme.js';
import { DOC_TYPES } from '../lib/documents.js';
import { toggleTask, getSessions } from '../lib/caseStore.js';
import { streamCaseChat } from '../lib/claudeStream.js';
import { mockRiskIndicators } from '../mockData.js';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'notes', label: 'Notes' },
  { id: 'documents', label: 'Documents' }
];

function sexLabel(s) {
  if (s === 'F') return 'Female';
  if (s === 'M') return 'Male';
  return s || 'Not recorded';
}

// Canonical CTDC indicator categories (name + one-line description + the
// keywords used to detect them within a case's free-text indicators).
const CTDC_CATEGORIES = [
  { name: 'Recruitment by deception', description: 'Lured with false promises of work, marriage, or a better life.', keywords: ['deception', 'false promise', 'deceptive', 'fraudulent', 'lured'] },
  { name: 'Debt bondage', description: 'Forced to work off an inflated or fabricated debt.', keywords: ['debt', 'bondage'] },
  { name: 'Document confiscation', description: 'ID or travel documents withheld by a third party.', keywords: ['document', 'passport', 'confiscat', 'withheld by', 'id retention'] },
  { name: 'Restricted movement', description: 'Unable to leave the workplace or residence freely.', keywords: ['unable to leave', 'movement', 'confin', 'restricted', 'not allowed to leave'] },
  { name: 'Withheld / unpaid wages', description: 'Paid little or nothing for the work performed.', keywords: ['unpaid', 'underpaid', 'wages', 'not paid', 'no pay'] },
  { name: 'Isolation from support', description: 'Cut off from family, community, or outside contact.', keywords: ['isolation', 'isolated', 'family and community', 'no contact', 'cut off'] },
  { name: 'Threats or coercion', description: 'Controlled through threats, violence, or intimidation.', keywords: ['threat', 'coerc', 'violence', 'intimidat', 'abuse'] },
  { name: 'Minor / heightened vulnerability', description: 'A child or otherwise vulnerable at the time of recruitment.', keywords: ['minor', 'child', 'vulnerab'] }
];

// Mark each canonical category present/absent by matching the case's indicators
// (falling back to the mock indicators when none are recorded).
function ctdcBreakdown(caseData) {
  const source = caseData?.ctdcIndicators?.length ? caseData.ctdcIndicators : mockRiskIndicators;
  const lower = (source || []).map((i) => String(i).toLowerCase());
  return CTDC_CATEGORIES.map((cat) => ({
    name: cat.name,
    description: cat.description,
    present: lower.some((ind) => cat.keywords.some((kw) => ind.includes(kw)))
  }));
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-tracev2-border/50 py-2 last:border-b-0">
      <div className="w-36 flex-shrink-0 text-[11px] uppercase tracking-wide text-tracev2-subtle">{label}</div>
      <div className="flex-1 text-sm text-tracev2-text">{value || <span className="text-tracev2-subtle">Not recorded</span>}</div>
    </div>
  );
}

export default function CaseViewScreen({ caseData, supervisorMode = false, onBack, onAddSessionNote, onTasksChanged, onAskAi, demoDocOpen }) {
  const [tab, setTab] = useState('overview');
  const [tasks, setTasks] = useState(caseData?.follow_up_tasks || []);
  const [expandedSession, setExpandedSession] = useState(0);
  const [doc, setDoc] = useState({ open: false, type: null });
  const [demoDocContent, setDemoDocContent] = useState(null);
  const [riskOpen, setRiskOpen] = useState(false);
  const [riskFactorsOpen, setRiskFactorsOpen] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [serviceFinder, setServiceFinder] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState('');
  const [translationError, setTranslationError] = useState('');

  const s = caseData?.structuredData || {};
  const risk = caseData?.riskLevel || s.risk_level || 'medium';
  const indicators = (s.ctdc_indicators?.length ? s.ctdc_indicators : caseData?.ctdcIndicators) || [];
  // Specific risk factors behind the banner's risk level: the case's own
  // riskFactors list where recorded, else its CTDC indicators, else the control
  // methods captured at intake.
  const riskFactors = caseData?.riskFactors?.length
    ? caseData.riskFactors
    : indicators.length
      ? indicators
      : (s.control_method || '')
          .split(';')
          .map((f) => f.trim())
          .filter(Boolean);

  // Scripted demo: auto-open the document modal with pre-written content when the
  // guided walkthrough requests it for this case.
  useEffect(() => {
    if (demoDocOpen && demoDocOpen.caseId === caseData?.id) {
      setDemoDocContent(demoDocOpen.content || null);
      setDoc({ open: true, type: demoDocOpen.docType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoDocOpen]);

  function handleToggleTask(i) {
    const next = toggleTask(caseData.id, i, caseData.follow_up_tasks || []);
    setTasks(next);
    onTasksChanged?.(caseData.id, next);
  }

  async function handleTranslate() {
    const rawNotes = sessions[0]?.notes || caseData.notes || '';
    if (!rawNotes) return;
    setTranslating(true);
    setTranslation('');
    setTranslationError('');
    let buf = '';
    try {
      await streamCaseChat({
        system:
          'You are TRACE, translating multilingual case intake notes into clear, professional English for a caseworker review. Translate faithfully — do not summarise, add, or remove information. If a passage is already in English, include it unchanged. Output plain prose only.',
        history: [],
        question: `Translate the following intake notes to English:\n\n${rawNotes}`,
        max_tokens: 600,
        onToken: (chunk) => {
          buf += chunk;
          setTranslation(buf);
        }
      });
    } catch (err) {
      if (err?.name !== 'AbortError') setTranslationError('Translation unavailable — check connection.');
    } finally {
      setTranslating(false);
    }
  }

  // Timeline sessions: the initial case note seeded as session 0, plus any
  // stored follow-up sessions from the overlay.
  const [sessions] = useState(() => {
    const stored = getSessions(caseData.id);
    if (stored.length === 0 && caseData.notes) {
      return [
        { id: 'initial', when: caseData.lastUpdated || 'Initial session', notes: caseData.notes, risk: caseData.riskLevel || 'medium', createdAt: null }
      ];
    }
    return stored.length > 0
      ? [
          { id: 'initial', when: caseData.lastUpdated || 'Initial session', notes: caseData.notes, risk: caseData.riskLevel || 'medium', createdAt: null },
          ...stored
        ]
      : [{ id: 'initial', when: 'Initial session', notes: '(no notes recorded)', risk: 'medium', createdAt: null }];
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex items-center justify-between">
          <button onClick={onBack} aria-label="Back" className="text-tracev2-muted transition-colors duration-150 hover:text-tracev2-text">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="rtl:-scale-x-100">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="text-sm font-semibold tabular-nums text-tracev2-text">{caseData?.id}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrint(true)}
              aria-label="Export case summary"
              className="flex items-center gap-1 rounded-full border border-tracev2-border bg-tracev2-card px-2 py-0.5 text-[10px] font-semibold text-tracev2-muted transition-colors duration-150 hover:border-tracev2-accent/60 hover:text-tracev2-text"
            >
              <span aria-hidden="true">⎙</span>
              Export
            </button>
            <button onClick={() => setRiskOpen((o) => !o)} className="flex items-center gap-1" aria-label="Risk indicators">
              <span className={`flex items-center gap-1 rounded-full border border-tracev2-border bg-tracev2-card px-2 py-0.5 text-[10px] font-semibold ${RISK_TEXT[risk]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${RISK_DOT[risk]}`} />
                {RISK_LABEL[risk]}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={`text-tracev2-subtle transition-transform duration-150 ${riskOpen ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {riskOpen && (
          <div className="mt-2 animate-tracev2-fadeIn rounded-xl border border-tracev2-border bg-tracev2-card p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-tracev2-subtle">CTDC indicator breakdown</p>
            <div className="space-y-2">
              {ctdcBreakdown(caseData).map((cat) => (
                <div key={cat.name} className="flex items-start gap-2">
                  {cat.present ? (
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-tracev2-risk-low text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-tracev2-border" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className={`text-xs font-medium ${cat.present ? 'text-tracev2-text' : 'text-tracev2-subtle'}`}>{cat.name}</div>
                    <div className="text-[10px] leading-snug text-tracev2-subtle">{cat.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2.5 border-t border-tracev2-border pt-2 text-[10px] text-tracev2-subtle">
              Risk level assigned by TRACE based on the CTDC indicator framework. Requires caseworker verification.
            </p>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-tracev2-border px-2">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            data-tutorial={`tab-${tb.id}`}
            onClick={() => setTab(tb.id)}
            className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors duration-150 ${
              tab === tb.id ? 'border-tracev2-accent text-tracev2-accent' : 'border-transparent text-tracev2-subtle hover:text-tracev2-text'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div key={tab} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 animate-tracev2-fadeIn">
        {tab === 'overview' && (
          <div>
            {/* Risk banner — collapsed to the risk label, expands to the case's
                specific risk factors (its CTDC indicators). */}
            <div className={`overflow-hidden rounded-xl ${RISK_BANNER[risk]}`}>
              <button
                onClick={() => setRiskFactorsOpen((o) => !o)}
                aria-expanded={riskFactorsOpen}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-start text-sm font-semibold"
              >
                {RISK_LABEL[risk]}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${riskFactorsOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {riskFactorsOpen && (
                <div className={`animate-tracev2-fadeIn px-3.5 py-3 ${RISK_PANEL[risk]}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">Risk factors</p>
                  {riskFactors.length > 0 ? (
                    <ul className="mt-1.5 list-disc space-y-1 ps-4 text-sm leading-snug">
                      {riskFactors.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-sm">No specific risk factors recorded for this case yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Follow-up tasks checklist */}
            {tasks.length > 0 && (
              <div className="mt-3 rounded-xl border border-tracev2-border bg-tracev2-card p-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-tracev2-subtle">Follow-up tasks</h3>
                <ul className="mt-1.5 space-y-1.5">
                  {tasks.map((tk, i) => (
                    <li key={i}>
                      <button onClick={() => handleToggleTask(i)} className="flex w-full items-start gap-2 text-start">
                        <span
                          className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                            tk.done ? 'border-tracev2-risk-low bg-tracev2-risk-low text-white' : 'border-tracev2-border'
                          }`}
                        >
                          {tk.done && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                              <path d="M5 12l5 5L20 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1">
                          <span className={`text-sm ${tk.done ? 'text-tracev2-subtle line-through' : 'text-tracev2-text'}`}>{tk.task}</span>
                          <span className="ml-1 text-[11px] text-tracev2-subtle">· {tk.due}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Case-scoped entry to the AI consultation — the AI tab opens the
                generic chat instead. */}
            <button
              onClick={() => onAskAi?.(caseData)}
              data-tutorial="case-ask-ai"
              className="mt-3 w-full rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-center text-sm font-medium text-violet-700 transition-colors duration-150 hover:bg-violet-100"
            >
              Ask TRACE AI about this case →
            </button>

            {/* Structured data */}
            <div className="mt-3 rounded-xl border border-tracev2-border bg-tracev2-card p-3">
              <Row label="Case Type" value={s.case_type} />
              <Row label="Age" value={s.age_range || caseData?.ageRange} />
              <Row label="Sex" value={sexLabel(s.sex || caseData?.sex)} />
              <Row label="Recruitment Method" value={s.recruitment_method} />
              <Row label="Control Method" value={s.control_method} />
              <Row label="Exploitation Type" value={s.exploitation_type} />
              <Row label="Detected Language" value={s.detected_language} />
              <div className="flex gap-3 border-b border-tracev2-border/50 py-2">
                <div className="w-36 flex-shrink-0 text-[11px] uppercase tracking-wide text-tracev2-subtle">CTDC Indicators</div>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {indicators.length ? (
                    indicators.map((ind) => (
                      <span key={ind} className="rounded-full bg-tracev2-bg px-2 py-0.5 text-[11px] text-tracev2-text ring-1 ring-tracev2-border">
                        {ind}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-tracev2-subtle">Not recorded</span>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <div className="text-[11px] uppercase tracking-wide text-tracev2-subtle">Summary</div>
                <p className="mt-1 text-sm leading-relaxed text-tracev2-text">
                  {s.summary || <span className="text-tracev2-subtle">Not recorded</span>}
                </p>
              </div>
            </div>

            <button
              onClick={() => onAddSessionNote?.(caseData)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-tracev2-border bg-tracev2-card py-3 text-sm font-medium text-tracev2-text transition-colors duration-150 hover:border-tracev2-accent/60"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              Add session note
            </button>
          </div>
        )}

        {tab === 'notes' && (
          <div data-tutorial="case-notes">
          <div className="relative pl-5">
            {/* Vertical spine */}
            <div className="absolute left-2 top-1 bottom-1 w-px bg-tracev2-border" />

            {sessions.map((sess, i) => {
              const riskDot =
                sess.risk === 'high'
                  ? 'bg-tracev2-risk-high'
                  : sess.risk === 'medium'
                    ? 'bg-tracev2-risk-medium'
                    : 'bg-tracev2-risk-low';
              return (
                <div key={sess.id || i} className="relative mb-4 last:mb-0">
                  {/* Node dot */}
                  <div className={`absolute -left-3 top-2.5 h-3 w-3 rounded-full border-2 border-tracev2-bg ${riskDot}`} />

                  <button
                    onClick={() => setExpandedSession(expandedSession === i ? -1 : i)}
                    className="block w-full rounded-xl border border-tracev2-border bg-tracev2-card p-3 text-start"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-tracev2-text">{sess.when}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          sess.risk === 'high'
                            ? 'bg-tracev2-risk-high/15 text-tracev2-risk-high'
                            : sess.risk === 'medium'
                              ? 'bg-tracev2-risk-medium/15 text-tracev2-risk-medium'
                              : 'bg-tracev2-risk-low/15 text-tracev2-risk-low'
                        }`}
                      >
                        {RISK_LABEL[sess.risk]}
                      </span>
                    </div>
                    <p className={`mt-1.5 text-sm leading-relaxed text-tracev2-muted ${expandedSession === i ? '' : 'line-clamp-2'}`}>
                      {sess.notes || 'No notes recorded for this session.'}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Translation panel */}
          {(sessions[0]?.notes || caseData.notes) && (
            <div className="mt-3">
              {!translation && !translating && (
                <button
                  onClick={handleTranslate}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-tracev2-border py-2.5 text-xs font-medium text-tracev2-muted hover:border-tracev2-accent/50 hover:text-tracev2-accent transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 5h12M9 3v2M5.5 8.5c.6 2 2 3.5 3.5 5M4 16s1.5-1 3-1 3 1 3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 21L17 11l-5 10M19.6 17H14.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Translate notes to English
                </button>
              )}
              {translating && (
                <div className="rounded-xl border border-tracev2-accent/30 bg-tracev2-accent/5 p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tracev2-accent" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-tracev2-accent">Translating…</span>
                  </div>
                  <p className="mt-1.5 text-sm text-tracev2-muted">{translation || 'Working on it…'}</p>
                </div>
              )}
              {translation && !translating && (
                <div className="rounded-xl border border-tracev2-accent/30 bg-tracev2-accent/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-tracev2-accent">English translation</span>
                    <button onClick={() => setTranslation('')} className="text-tracev2-subtle hover:text-tracev2-muted">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-tracev2-text">{translation}</p>
                </div>
              )}
              {translationError && (
                <p className="mt-1 text-xs text-tracev2-risk-medium">{translationError}</p>
              )}
            </div>
          )}
          </div>
        )}

        {tab === 'documents' && (
          <div>
            {/* Selected service banner */}
            {selectedService && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-tracev2-accent/40 bg-tracev2-accent/10 px-3 py-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-tracev2-accent">Referral to</div>
                  <div className="text-sm font-semibold text-tracev2-text">{selectedService.shortName}</div>
                  <div className="text-[11px] text-tracev2-muted">{selectedService.type} · {selectedService.location}</div>
                </div>
                <button onClick={() => setSelectedService(null)} className="text-tracev2-subtle hover:text-tracev2-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            <div className="space-y-2">
              {DOC_TYPES.filter((d) => !d.isMeta && (!d.supervisorOnly || supervisorMode)).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDoc({ open: true, type: d.id })}
                  className="flex w-full items-center justify-between rounded-xl border border-tracev2-border bg-tracev2-card px-3.5 py-3 text-start transition-colors duration-150 hover:border-tracev2-accent/60"
                >
                  <div>
                    <span className="text-sm font-medium text-tracev2-text">{d.label}</span>
                    {d.supervisorOnly && (
                      <span className="ml-1 text-[9px] font-semibold text-tracev2-accent bg-tracev2-accent/10 px-1.5 py-0.5 rounded-full">
                        Supervisor
                      </span>
                    )}
                    {d.id === 'referral' && selectedService && (
                      <span className="ml-2 text-[10px] text-tracev2-accent">→ {selectedService.shortName}</span>
                    )}
                  </div>
                  <span className="text-tracev2-accent">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ))}

              {/* Find a Service (meta action) */}
              {DOC_TYPES.filter((d) => d.isMeta).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setServiceFinder(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-tracev2-border bg-tracev2-card px-3.5 py-3 text-start transition-colors duration-150 hover:border-tracev2-accent/60"
                >
                  <div>
                    <span className="text-sm font-medium text-tracev2-text">{d.label}</span>
                    {!selectedService && (
                      <span className="ml-2 text-[10px] text-tracev2-subtle">Pre-fill referral with partner details</span>
                    )}
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-tracev2-accent">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-tracev2-subtle">Review all AI-generated content before sending.</p>
          </div>
        )}
      </div>

      <DocumentModal
        open={doc.open}
        docType={doc.type}
        caseData={caseData}
        targetService={selectedService}
        demoContent={demoDocContent}
        onClose={() => {
          setDoc({ open: false, type: null });
          setDemoDocContent(null);
        }}
      />

      <ServiceFinderModal
        open={serviceFinder}
        caseData={caseData}
        onClose={() => setServiceFinder(false)}
        onSelect={(svc) => {
          setSelectedService(svc);
          setServiceFinder(false);
        }}
      />

      {showPrint && (
        <CasePrintScreen caseData={{ ...caseData, follow_up_tasks: tasks }} onBack={() => setShowPrint(false)} />
      )}
    </div>
  );
}

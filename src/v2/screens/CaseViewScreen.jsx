// Phase 4 — 3-tab case view (Overview / Notes / Documents).
// Opened when a caseworker taps a case card. Receives the case object; the
// Overview tab shows structured data + a follow-up task checklist, Notes lists
// sessions, Documents streams AI-generated documents.
import { useState } from 'react';
import RiskBadge from '../components/RiskBadge.jsx';
import DocumentModal from '../components/DocumentModal.jsx';
import { RISK_BANNER, RISK_LABEL } from '../theme.js';
import { DOC_TYPES } from '../lib/documents.js';
import { toggleTask } from '../lib/caseStore.js';
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

function Row({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-tracev2-border/50 py-2 last:border-b-0">
      <div className="w-36 flex-shrink-0 text-[11px] uppercase tracking-wide text-tracev2-subtle">{label}</div>
      <div className="flex-1 text-sm text-tracev2-text">{value || <span className="text-tracev2-subtle">Not recorded</span>}</div>
    </div>
  );
}

export default function CaseViewScreen({ caseData, onBack, onAddSessionNote, onTasksChanged }) {
  const [tab, setTab] = useState('overview');
  const [tasks, setTasks] = useState(caseData?.follow_up_tasks || []);
  const [expandedSession, setExpandedSession] = useState(0);
  const [doc, setDoc] = useState({ open: false, type: null });
  const [riskOpen, setRiskOpen] = useState(false);

  const s = caseData?.structuredData || {};
  const risk = caseData?.riskLevel || s.risk_level || 'medium';
  const indicators = (s.ctdc_indicators?.length ? s.ctdc_indicators : caseData?.ctdcIndicators) || [];

  function handleToggleTask(i) {
    const next = toggleTask(caseData.id, i);
    setTasks(next);
    onTasksChanged?.(caseData.id, next);
  }

  // For now a single session from the case's existing notes.
  const sessions = [
    { when: caseData?.lastUpdated || 'This session', notes: caseData?.notes || '', risk }
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between px-4 py-2">
        <button onClick={onBack} aria-label="Back" className="text-tracev2-muted transition-colors duration-150 hover:text-tracev2-text">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="rtl:-scale-x-100">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-sm font-semibold tabular-nums text-tracev2-text">{caseData?.id}</div>
        <RiskBadge open={riskOpen} onToggle={() => setRiskOpen((o) => !o)} onClose={() => setRiskOpen(false)} level={risk} indicators={indicators.length ? indicators : mockRiskIndicators} />
      </div>

      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-tracev2-border px-2">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors duration-150 ${
              tab === tb.id ? 'border-tracev2-accent text-tracev2-accent' : 'border-transparent text-tracev2-subtle hover:text-tracev2-text'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
        {tab === 'overview' && (
          <div>
            {/* Risk banner */}
            <div className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold ${RISK_BANNER[risk]}`}>
              {RISK_LABEL[risk]}
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
          <div className="space-y-2">
            {sessions.map((sess, i) => {
              const expanded = expandedSession === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedSession(expanded ? -1 : i)}
                  className="block w-full rounded-xl border border-tracev2-border bg-tracev2-card p-3 text-start"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-tracev2-text">{sess.when}</span>
                    <span className="rounded-full bg-tracev2-bg px-2 py-0.5 text-[10px] text-tracev2-muted ring-1 ring-tracev2-border">
                      {RISK_LABEL[sess.risk]}
                    </span>
                  </div>
                  <p className={`mt-1.5 text-sm leading-relaxed text-tracev2-muted ${expanded ? '' : 'line-clamp-2'}`}>
                    {sess.notes || <span className="text-tracev2-subtle">No notes recorded for this session.</span>}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'documents' && (
          <div>
            <div className="space-y-2">
              {DOC_TYPES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDoc({ open: true, type: d.id })}
                  className="flex w-full items-center justify-between rounded-xl border border-tracev2-border bg-tracev2-card px-3.5 py-3 text-start transition-colors duration-150 hover:border-tracev2-accent/60"
                >
                  <span className="text-sm font-medium text-tracev2-text">{d.label}</span>
                  <span className="text-tracev2-accent">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
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
        onClose={() => setDoc({ open: false, type: null })}
      />
    </div>
  );
}

// DailyBriefCard — streaming AI caseload brief, shown at the top of the
// dashboard. Claude reads all active cases and generates a prioritised morning
// briefing: what's urgent, what's overdue, any patterns, first recommended
// action. Collapses once read and regenerates at most once per session.
import { useEffect, useRef, useState } from 'react';
import { streamCaseChat } from '../lib/claudeStream.js';
import { mockCases } from '../mockData.js';

function buildBriefSystem(cases) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const caseBlocks = cases
    .slice(0, 8) // cap at 8 for token budget
    .map((c) => {
      const s = c.structuredData || {};
      const indicators = (c.ctdcIndicators || s.ctdc_indicators || []).join('; ') || 'none recorded';
      const tasks = (c.follow_up_tasks || []);
      const overdue = tasks.filter((t) => !t.done && (t.due === 'Overdue' || t.due?.toLowerCase().includes('today'))).length;
      return `Case ${c.id}: ${c.ageRange || '—'} · ${c.sex === 'F' ? 'F' : c.sex === 'M' ? 'M' : '—'} · Risk: ${(c.riskLevel || 'unknown').toUpperCase()} · Status: ${c.status || 'unknown'} · Last update: ${c.lastUpdated || '—'}\n  CTDC: ${indicators}\n  Overdue tasks: ${overdue}`;
    })
    .join('\n\n');

  return `You are TRACE, an AI assistant for a frontline anti-trafficking caseworker. Today is ${today}.

The caseworker has just opened the app. Write a concise, practical morning briefing based on their current caseload (below). Format it as a short paragraph or 3–4 tight lines — not a long essay. Cover:
1. Which case(s) need attention most urgently and why
2. Any overdue follow-up tasks (flag by case ID)
3. Any patterns worth noting across cases (e.g. two high-risk cases both have document confiscation — possible network)
4. One clear recommended first action for the caseworker

Tone: professional, calm, direct. Do not repeat every case — synthesise. Do not invent data. Refer to survivors only by case ID.

CASELOAD:
${caseBlocks}`;
}

const SESSION_KEY = 'trace_v2_daily_brief';

function getCached() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (raw?.text) return raw;
  } catch { /* ignore */ }
  return null;
}

function setCache(text) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ text })); } catch { /* ignore */ }
}

export default function DailyBriefCard({ cases = [] }) {
  // Always brief on something — fall back to the demo caseload so the card
  // renders on a fresh reset before any real cases have loaded.
  const briefCases = cases.length > 0 ? cases : mockCases;
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const abortRef = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Use cached brief for this session (avoids double-API call on re-render)
    const cached = getCached();
    if (cached) { setText(cached.text); return; }

    if (!navigator.onLine) {
      setError('Brief unavailable offline.');
      return;
    }

    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let buf = '';

    streamCaseChat({
      system: buildBriefSystem(briefCases),
      history: [],
      question: 'Generate the daily caseload brief now.',
      max_tokens: 400,
      signal: controller.signal,
      onToken: (chunk) => {
        buf += chunk;
        setText(buf);
      }
    })
      .then(() => setCache(buf))
      .catch((err) => {
        if (err?.name !== 'AbortError') setError('Brief unavailable — check connection.');
      })
      .finally(() => setStreaming(false));

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases.length]);

  if (dismissed) return null;
  if (!text && !streaming && !error) return null;

  return (
    <div data-tutorial="daily-brief" className="mt-3 rounded-xl border border-tracev2-accent/30 bg-tracev2-accent/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          {/* Spark icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-tracev2-accent flex-shrink-0">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-tracev2-accent">
            Today&apos;s brief
          </span>
          {streaming && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tracev2-accent" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-tracev2-subtle hover:text-tracev2-muted"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-tracev2-subtle hover:text-tracev2-muted"
            aria-label="Dismiss"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-tracev2-accent/20 px-3.5 py-2.5">
          {error ? (
            <p className="text-[12px] text-tracev2-risk-medium">{error}</p>
          ) : (
            <p className="text-[12.5px] leading-relaxed text-tracev2-text">
              {text}
              {streaming && (
                <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 animate-pulse bg-tracev2-accent align-middle" />
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Weekly caseworker wellness check-in. A gentle, private, once-per-week
// 3-question modal (trauma-informed tone). Responses are stored locally; a
// sustained low average (2 consecutive weeks) raises a discreet supervisor
// alert so someone checks in on the caseworker. This is staff wellbeing — it
// never touches survivor/case data.
import { useState } from 'react';

const LAST_KEY = 'trace_v2_wellness_last';
const HISTORY_KEY = 'trace_v2_wellness_history';
const SKIP_KEY = 'trace_v2_wellness_skip';
const ALERT_KEY = 'trace_v2_wellness_alert';

const EMOJIS = ['😔', '😟', '😐', '🙂', '😊'];

const QUESTIONS = [
  {
    id: 'caseload',
    text: 'How are you feeling about your caseload this week?',
    labels: ['Overwhelmed', 'Struggling', 'Managing', 'OK', 'Good']
  },
  {
    id: 'support',
    text: 'Have you had enough support from your supervisor or team?',
    labels: ['Not at all', 'Rarely', 'Sometimes', 'Usually', 'Yes, fully']
  },
  {
    id: 'personal',
    text: 'How are you feeling personally — outside of work?',
    labels: ['Very difficult', 'Hard', 'OK', 'Good', 'Well']
  }
];

// --- ISO week + due helpers (exported for TraceV2App) ---------------------
export function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Due if not already completed this ISO week and not inside a 7-day skip window.
export function isWellnessDue() {
  try {
    if (localStorage.getItem(LAST_KEY) === isoWeek()) return false;
    const skipUntil = Number(localStorage.getItem(SKIP_KEY) || 0);
    if (skipUntil && Date.now() < skipUntil) return false;
    return true;
  } catch {
    return false;
  }
}

// Active supervisor wellness alert, if any (read by the Dashboard supervisor queue).
export function getWellnessAlert() {
  try {
    const raw = JSON.parse(localStorage.getItem(ALERT_KEY));
    return raw && raw.active ? raw : null;
  } catch {
    return null;
  }
}

export function clearWellnessAlert() {
  localStorage.removeItem(ALERT_KEY);
}

const RESOURCES = [
  { name: 'IOM Staff Wellbeing', url: 'https://staffwellbeing.iom.int', host: 'staffwellbeing.iom.int' },
  { name: 'Headington Institute', url: 'https://headington.org', host: 'headington.org' }
];

export default function WellnessCheckModal({ open, onClose, caseworkerName }) {
  const [scores, setScores] = useState({ caseload: null, support: null, personal: null });
  const [done, setDone] = useState(false);

  if (!open) return null;

  const allAnswered = QUESTIONS.every((q) => scores[q.id] != null);
  const firstName = (caseworkerName || '').trim().split(/\s+/)[0];

  function handleSubmit() {
    if (!allAnswered) return;
    const week = isoWeek();
    const values = QUESTIONS.map((q) => scores[q.id]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      history = [];
    }
    // Replace any existing entry for this week, then append.
    history = history.filter((h) => h.week !== week);
    history.push({ week, scores: { ...scores }, avg });

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      localStorage.setItem(LAST_KEY, week);
      localStorage.removeItem(SKIP_KEY);

      // Sustained low wellbeing: this check + the previous one both below 2.5.
      const lastTwo = history.slice(-2);
      if (lastTwo.length === 2 && lastTwo.every((h) => h.avg < 2.5)) {
        localStorage.setItem(
          ALERT_KEY,
          JSON.stringify({
            active: true,
            week,
            caseworker: caseworkerName || 'Caseworker',
            message: 'Caseworker wellness alert — please check in with this caseworker.'
          })
        );
      }
    } catch {
      /* storage unavailable — fail quietly, this is a wellbeing nudge */
    }

    setDone(true);
  }

  function handleSkip() {
    try {
      localStorage.setItem(SKIP_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {
      /* no-op */
    }
    onClose?.();
  }

  return (
    <div className="absolute inset-0 z-[95] flex flex-col bg-tracev2-bg">
      {done ? (
        // --- Thank-you screen ---
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tracev2-risk-low/15 text-2xl">💚</div>
          <h1 className="mt-4 text-lg font-semibold text-tracev2-text">Thank you for checking in.</h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-tracev2-muted">
            This work is heavy, and looking after yourself matters. Your answers stay on this device.
          </p>

          <div className="mt-6 w-full max-w-xs space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-tracev2-subtle">If you&apos;d like support</p>
            {RESOURCES.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-tracev2-border bg-tracev2-card px-3.5 py-3 text-start transition-colors duration-150 hover:border-tracev2-accent/60"
              >
                <span>
                  <span className="block text-sm font-medium text-tracev2-text">{r.name}</span>
                  <span className="block text-[11px] text-tracev2-subtle">{r.host}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-tracev2-accent">
                  <path d="M7 17L17 7M17 7H8M17 7v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-7 w-full max-w-xs rounded-xl bg-tracev2-accent py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90"
          >
            Done
          </button>
        </div>
      ) : (
        // --- Questions ---
        <>
          <div className="flex-shrink-0 px-5 pt-6">
            <h1 className="text-lg font-semibold text-tracev2-text">
              {firstName ? `A quick check-in, ${firstName}` : 'A quick check-in'}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-tracev2-muted">
              Once a week, just for you — private and takes a moment. There are no wrong answers.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
            <div className="space-y-5">
              {QUESTIONS.map((q) => (
                <div key={q.id}>
                  <p className="text-sm font-medium text-tracev2-text">{q.text}</p>
                  <div className="mt-2 flex gap-1.5">
                    {q.labels.map((label, i) => {
                      const value = i + 1;
                      const selected = scores[q.id] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setScores((s) => ({ ...s, [q.id]: value }))}
                          className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-colors duration-150 ${
                            selected
                              ? 'border-tracev2-accent bg-tracev2-accent/10'
                              : 'border-tracev2-border bg-tracev2-card hover:border-tracev2-muted'
                          }`}
                        >
                          <span className="text-xl leading-none">{EMOJIS[i]}</span>
                          <span className={`text-[9px] leading-tight text-center ${selected ? 'text-tracev2-accent' : 'text-tracev2-subtle'}`}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-tracev2-border px-5 py-4 pb-[max(env(safe-area-inset-bottom),16px)]">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full rounded-xl bg-tracev2-accent py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90 disabled:opacity-40"
            >
              Submit
            </button>
            <button
              onClick={handleSkip}
              className="mt-2 w-full py-1.5 text-xs text-tracev2-subtle transition-colors duration-150 hover:text-tracev2-muted"
            >
              Skip this week
            </button>
          </div>
        </>
      )}
    </div>
  );
}

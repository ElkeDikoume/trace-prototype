// In-app guided tour for v2. Modeled on the v1 TutorialOverlay pattern: a
// full-viewport overlay that spotlights one `[data-tutorial]` target at a time
// (a rect with a 9999px box-shadow dimming everything else, plus an accent
// ring) and floats a tooltip beside it. Targets that aren't mounted fall back
// to a plain dark overlay with a centered tooltip.
import { useEffect, useState } from 'react';

const STEPS = [
  {
    selector: '[data-tutorial="header"]',
    title: 'Welcome to TRACE v2',
    body: "Your AI-powered caseworker assistant. Let's take a 60-second tour."
  },
  {
    selector: '[data-tutorial="daily-brief"]',
    title: 'AI daily brief',
    body: "Every morning TRACE reads your caseload and surfaces what's urgent, what's overdue, and what patterns have emerged — no manual review needed."
  },
  {
    selector: '[data-tutorial="pattern-alert"]',
    title: 'Pattern alerts',
    body: 'Cross-case patterns — like document confiscation appearing across multiple cases — are flagged automatically, with no API call required.'
  },
  {
    selector: '[data-tutorial="bottom-nav-intake"]',
    title: 'Start an intake',
    body: 'Tap here to open a new case. Speak or type notes in any language — TRACE checks CTDC indicators in real time as you go.'
  },
  {
    selector: '[data-tutorial="bottom-nav-ai"]',
    title: 'Ask AI',
    body: 'Open a conversation grounded in the active case. Ask for a second opinion, a referral letter, or a CTDC clarification.'
  },
  {
    selector: '[data-tutorial="bottom-nav-docs"]',
    title: 'Document generation',
    body: 'Generate referral letters, risk assessments, IOM HTCDS forms, and more in seconds — in English or French. Every output requires your review before it leaves the app.'
  },
  {
    selector: '[data-tutorial="privacy-btn"]',
    title: 'Privacy mode',
    body: 'One tap blurs all case data from bystanders. Tap again to restore.'
  }
];

export default function TutorialOverlay({ onFinish }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const target = document.querySelector(STEPS[step].selector);
    if (!target) {
      setRect(null);
      return undefined;
    }
    target.scrollIntoView({ block: 'center' });
    const id = setTimeout(() => {
      const r = target.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }, 80);
    return () => clearTimeout(id);
  }, [step]);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onFinish();
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  const current = STEPS[step];
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 400;
  const tooltipTop = rect ? Math.min(rect.top + rect.height + 12, viewportH - 190) : viewportH / 2 - 90;
  const tooltipLeft = rect ? Math.max(12, Math.min(rect.left, viewportW - 288)) : Math.max(12, viewportW / 2 - 144);

  return (
    <div className="fixed inset-0 z-[100]">
      {rect ? (
        <div
          className="fixed rounded-lg pointer-events-none transition-all duration-200"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
            border: '2px solid #3b4fd8'
          }}
        />
      ) : (
        <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.75)' }} />
      )}

      <div
        className="fixed w-72 rounded-xl border border-tracev2-border bg-tracev2-card p-4 shadow-xl"
        style={{ top: tooltipTop, left: tooltipLeft }}
      >
        <div className="mb-1 text-sm font-semibold text-tracev2-text">{current.title}</div>
        <p className="mb-3 text-xs leading-relaxed text-tracev2-muted">{current.body}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === step ? 'bg-tracev2-accent' : 'bg-tracev2-border'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onFinish} className="text-xs text-tracev2-subtle hover:text-tracev2-muted">
              Skip
            </button>
            {step > 0 && (
              <button onClick={back} className="text-xs text-tracev2-muted hover:text-tracev2-text">
                Back
              </button>
            )}
            <button
              onClick={next}
              className="rounded-lg bg-tracev2-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-tracev2-accent/90"
            >
              {step === STEPS.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

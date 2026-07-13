import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

const STEPS = [
  { selector: '[data-tutorial="header"]', title: 'Welcome to TRACE', body: "This is your caseworker AI assistant. Let's take a 60-second tour." },
  { selector: '[data-tutorial="language-selector"]', title: 'Interface language', body: 'Switch the interface and AI responses between English, French, Arabic, Spanish, and Portuguese at any time.' },
  { selector: '[data-tutorial="pattern-banner"]', title: 'Pattern intelligence', body: "Cross-case alerts from your organization's caseload, simulated for this prototype." },
  { selector: '[data-tutorial="form-selector"]', title: 'Start a new case', body: 'Choose a form type to begin a new case, or reopen an existing one.' },
  { selector: '[data-tutorial="active-form"]', title: 'Voice or text intake', body: 'Speak or type case notes in 8 languages. AI structures them into the form and flags risk automatically.' },
  { selector: '[data-tutorial="chatbot"]', title: 'Ask TRACE', body: 'Ask questions about the case, request a referral letter, or ask why a case was flagged, grounded in the case data.' },
  { selector: '[data-tutorial="support-care"]', title: 'Support & Care', body: 'Take care of yourself too. Tap the heart any time for a breathing exercise and wellbeing resources.' }
];

export default function TutorialOverlay({ onFinish }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const target = document.querySelector(STEPS[step].selector);
    if (!target) {
      setRect(null);
      return;
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
  const tooltipTop = rect ? Math.min(rect.top + rect.height + 12, viewportH - 170) : viewportH / 2 - 80;
  const tooltipLeft = rect ? Math.max(12, Math.min(rect.left, viewportW - 272)) : 12;

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
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
            border: '2px solid #0ea5e9'
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/70" />
      )}

      <div
        className="fixed bg-trace-900 border border-trace-700 rounded-xl p-4 w-64 shadow-xl"
        style={{ top: tooltipTop, left: tooltipLeft }}
      >
        <div className="text-sm font-semibold text-slate-100 mb-1">{t(current.title)}</div>
        <p className="text-xs text-slate-400 mb-3">{t(current.body)}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-trace-accent' : 'bg-trace-700'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onFinish} className="text-xs text-slate-500 hover:text-slate-300">{t('Skip')}</button>
            {step > 0 && <button onClick={back} className="text-xs text-slate-400 hover:text-slate-200">{t('Back')}</button>}
            <button onClick={next} className="text-xs px-2 py-1 rounded bg-trace-accent text-white hover:bg-sky-500">
              {step === STEPS.length - 1 ? t('Done') : t('Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

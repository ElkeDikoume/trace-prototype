// Onboarding walkthrough for v2.
// Step 0: centered modal (language picker) with a darkened backdrop — the user
// must choose their language before anything else, so a full-screen gate is
// intentional here.
// Steps 1–4: bottom-sheet that slides up from the bottom of the phone frame
// while the live app remains fully visible and navigable behind it. Each step
// drives the app to the relevant screen via the onStepChange(step) callback,
// so the judge can see the real interface responding as the card narrates it.
import { useState } from 'react';
import i18n, { LANGUAGES } from '../lib/i18n.js';

const TOTAL_STEPS = 5; // 0–4

// Per-step primary CTA labels. Index matches step number.
const CTA_LABELS = [
  'Continue →',
  'Open the flagged case →',
  'See Fatima consult TRACE →',
  'Generate the referral letter →',
  'Start using TRACE →',
];

// Shared progress-dot row, used by both layout variants.
function ProgressDots({ step }) {
  return (
    <div className="flex flex-shrink-0 justify-center gap-1.5 pt-3">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            i === step ? 'w-4 bg-blue-600' : i < step ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function TutorialOverlay({ onClose, onFinish, onStepChange }) {
  const [step, setStep] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('trace_lang');
    return LANGUAGES.some((l) => l.code === stored) ? stored : 'en';
  });

  const finish = onClose || onFinish;

  function chooseLanguage(code) {
    setLang(code);
    localStorage.setItem('trace_lang', code);
    i18n.changeLanguage(code);
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      finish?.();
    }
  }

  function back() {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      onStepChange?.(prevStep);
    }
  }

  const ctaLabel = CTA_LABELS[step] ?? 'Next →';

  // ---- Step 0: language picker — full-screen modal with backdrop ----
  // Kept as a blocking overlay so language is chosen before anything else loads.
  if (step === 0) {
    return (
      // Tour copy is hardcoded English, so pin LTR — picking Arabic flips the
      // app behind the overlay to RTL, but the card itself must not mirror.
      <div dir="ltr" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="mx-4 flex w-full max-w-sm flex-col rounded-2xl bg-white p-6 shadow-xl" style={{ maxHeight: '82vh' }}>
          <div className="flex-1 overflow-y-auto py-2">
            <div className="mb-3 flex justify-start">
              <button
                onClick={finish}
                className="text-xs text-gray-400 underline mt-2"
                aria-label="Skip tour"
              >
                Skip tour
              </button>
            </div>
            <h2 className="text-center text-lg font-bold text-gray-900">Choose your language</h2>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => chooseLanguage(l.code)}
                  aria-pressed={lang === l.code}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-start transition-colors duration-150 ${
                    lang === l.code ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">
                    {l.flag}
                  </span>
                  <span className={`text-sm font-medium ${lang === l.code ? 'text-blue-700' : 'text-gray-700'}`}>
                    {l.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <ProgressDots step={step} />

          <div className="mt-2 flex flex-shrink-0 items-center justify-between border-t border-gray-100 pt-4">
            {/* No back button on step 0 — language is the first gate. */}
            <span />
            <button
              onClick={next}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Minimized state: floating pill at bottom center ----
  if (minimized) {
    return (
      <div dir="ltr" className="fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none">
        <button
          onClick={() => setMinimized(false)}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors duration-150 hover:bg-blue-700"
          aria-label="Expand tour"
        >
          <span>TRACE Guide &middot; Step {step}/4</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>
    );
  }

  // ---- Steps 1–4: bottom-sheet — app stays visible behind ----
  // pointer-events-none on the outer wrapper lets taps pass through to the app
  // chrome (bottom nav, status bar). The inner card re-enables pointer events
  // for the tour controls only.
  return (
    <div dir="ltr" className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
      <div
        className="pointer-events-auto bg-white rounded-t-2xl shadow-2xl border-t border-gray-100 px-5 pt-4 pb-6 mx-auto max-w-sm flex flex-col"
        style={{ maxHeight: '55vh' }}
      >
        {/* Drag handle + minimize button */}
        <div className="mb-3 flex flex-shrink-0 items-center justify-between">
          <div className="w-7" />
          <span className="h-1 w-10 rounded-full bg-gray-200" aria-hidden="true" />
          <button
            onClick={() => setMinimized(true)}
            className="rounded-full p-1 text-gray-300 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-500"
            aria-label="Minimize tour"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Scrollable step content */}
        <div className="flex-1 overflow-y-auto">

          {/* ---- Step 1: field moment ---- */}
          {step === 1 && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                You are Fatima &middot; IOM N&apos;Djamena
              </p>
              <h2 className="mt-3 text-lg font-bold leading-snug text-gray-900">
                It&apos;s 6am. TRACE flagged one case as HIGH RISK overnight.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                You have 47 open cases. Let&apos;s see what happened.
              </p>
            </>
          )}

          {/* ---- Step 2: risk flag + before/after ---- */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">
                From voice note to risk flag &mdash; automatically
              </h2>

              {/* Two-column before/after panel */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3">
                {/* Left: raw field note */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Field note &middot; Hausa
                  </p>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-gray-700">
                    Babu isasshen abinci. Ta fada min ana ri&#x199;e da takardun ta. Ba za ta iya tafiya ba tare da izini ba. Yana da bashi da yawa.
                  </p>
                </div>

                {/* Right: TRACE structured output */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    TRACE structured
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    <li className="flex items-start gap-1.5 text-xs text-gray-700">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                      Documents held
                    </li>
                    <li className="flex items-start gap-1.5 text-xs text-gray-700">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                      Movement restricted
                    </li>
                    <li className="flex items-start gap-1.5 text-xs text-gray-700">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                      Debt confirmed
                    </li>
                    <li className="mt-2 text-xs font-bold text-red-600">
                      &rarr; HIGH RISK (3/7 indicators)
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                3 minutes of voice. No forms. No typing.
              </p>
            </>
          )}

          {/* ---- Step 3: ask TRACE ---- */}
          {/* The actual chat exchange for this step is pre-loaded into the chatbot
              component state by TraceV2App via onStepChange(3). This card surfaces
              the framing only — the live chat panel visible behind the overlay
              shows the full Q&A. */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">
                Fatima asked whether Amina qualified for emergency referral
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                TRACE cited NRS Protocol 4.2, flagged the debt indicator as disqualifying a standard pathway, and drafted next steps &mdash; in the language Fatima chose.
              </p>
              <p className="mt-4 text-xs text-gray-400">
                See the full exchange in the chat above &#x2191;
              </p>
            </>
          )}

          {/* ---- Step 4: pattern alert + every output ---- */}
          {step === 4 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">
                One intake. Documents ready. A pattern no single caseworker could see alone.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                A pattern alert fired: two other caseworkers in Diffa documented the same debt indicator this week &mdash; across cases they&apos;d never connected.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                IOM-standard referral letter, situation report, and follow-up plan &mdash; all generated from Fatima&apos;s intake. Ready to download.
              </p>
            </>
          )}

        </div>{/* end scrollable content */}

        <ProgressDots step={step} />

        <div className="mt-2 flex flex-shrink-0 items-center justify-between border-t border-gray-100 pt-4">
          {step > 0 ? (
            <button
              onClick={back}
              className="rounded-lg px-2 py-2 text-sm text-tracev2-muted transition-colors duration-150 hover:text-gray-700"
            >
              &larr; Back
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={next}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

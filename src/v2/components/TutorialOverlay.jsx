// Onboarding walkthrough for v2 — a self-contained 6-step card over a blurred
// app backdrop. Unlike the earlier scripted tour, no step drives the live app:
// each step explains one capability, so the walkthrough never depends on screen
// state or the API. Step 0 also sets the caseworker's UI language.
import { useState } from 'react';
import i18n, { LANGUAGES } from '../lib/i18n.js';
import traceLogo from '../../assets/trace-logo.png';

const TOTAL_STEPS = 6; // 0–5

function Icon({ emoji, tone }) {
  return (
    <span className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${tone}`} aria-hidden="true">
      {emoji}
    </span>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">{children}</span>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2 text-xs leading-snug text-gray-600">
      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
      <span>{children}</span>
    </li>
  );
}

export default function TutorialOverlay({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
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
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else finish?.();
  }

  const ctaLabel = step === 0 ? 'Continue →' : step === TOTAL_STEPS - 1 ? 'Start using TRACE →' : 'Next →';

  return (
    // The tour copy is hardcoded English, so pin it LTR — picking Arabic flips
    // the app behind the overlay to RTL, but the card itself must not mirror.
    <div dir="ltr" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col rounded-2xl bg-white p-6 shadow-xl" style={{ maxHeight: '82vh' }}>
        <div className="flex-1 overflow-y-auto py-2">
          {/* ---- Step 0: language ---- */}
          {step === 0 && (
            <>
              <button
                onClick={finish}
                className="mb-3 flex items-center gap-1 text-xs text-tracev2-subtle transition-colors hover:text-tracev2-muted"
                aria-label="Skip"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Skip
              </button>
              <h2 className="text-center text-lg font-bold text-gray-900">Choose your language</h2>
              <p className="mt-1 text-center text-sm text-gray-500">TRACE is designed for the Lake Chad Basin.</p>

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
            </>
          )}

          {/* ---- Step 1: welcome ---- */}
          {step === 1 && (
            <>
              <h2 className="text-center text-lg font-bold text-gray-900">Welcome to TRACE</h2>
              <p className="mt-1 text-center text-sm leading-relaxed text-gray-500">
                An AI assistant that makes anti-trafficking caseworkers better at their work.
              </p>

              {/* Hero: the logo alone, tagline below the card */}
              <div className="mt-4 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-8">
                <img src={traceLogo} alt="TRACE" className="h-24 w-24 rounded-2xl bg-white object-contain p-3 shadow" />
              </div>
              <p className="mt-3 text-center text-sm font-bold leading-relaxed text-gray-800">
                Capture assessments. Generate reports. Trigger cluster alerts. All from the field.
              </p>

              <ul className="mt-4 space-y-2">
                <Bullet>82% of displaced persons in the Lake Chad Basin have little formal education</Bullet>
                <Bullet>Caseworkers manage 50+ complex cases — with paper forms</Bullet>
              </ul>
            </>
          )}

          {/* ---- Step 2: intake ---- */}
          {step === 2 && (
            <>
              <Icon emoji="🎙️" tone="bg-indigo-100 text-indigo-700" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">Capture in any language</h2>
              <p className="mt-1 text-sm text-gray-500">No forms. No typing. Just speak.</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                Tap the + Intake button and speak your field observations in Arabic, Hausa, French, or any local
                language. TRACE transcribes, translates, and structures your notes into a VCA automatically — ready for
                cluster reporting.
              </p>

              {/* A local field language (Hausa) — not one of the UI languages —
                  transcribed and translated into structured English. */}
              <div className="mt-4 space-y-1.5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Field note · Hausa → English
                </p>
                <p className="text-gray-800">{'Babu isasshen abinci. Yara suna fama da rashin abinci mai gina jiki.'}</p>
                <p className="text-gray-300" aria-hidden="true">
                  ↓
                </p>
                <p className="text-gray-700">{'Not enough food. Children are suffering from malnutrition.'}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>3 minutes → full VCA report</Pill>
                <Pill>Auto-detects language</Pill>
              </div>
            </>
          )}

          {/* ---- Step 3: Ask TRACE AI ---- */}
          {step === 3 && (
            <>
              <Icon emoji="✦" tone="bg-violet-100 text-violet-700" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">Your AI field intelligence system</h2>
              <p className="mt-1 text-sm text-gray-500">Not a chatbot. A case-aware decision tool.</p>

              <div className="mt-4 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                <div className="flex justify-end">
                  <span className="max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 text-white">
                    Draft a situation report for case #0043
                  </span>
                </div>
                <div className="flex justify-start">
                  <span className="max-w-[90%] whitespace-pre-line rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-800">
                    {`Generating situation report for Koura Village, Diffa Region...
Flood risk · 340 households · HIGH priority.
Report drafted in English — ready to share with OCHA.`}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-gray-700">TRACE AI can also:</p>
              <ul className="mt-1.5 space-y-1.5">
                <Bullet>Generate VCA reports, referral letters, cluster alerts</Bullet>
                <Bullet>Answer questions about any case in your caseload</Bullet>
                <Bullet>Identify cross-case patterns across your operating area</Bullet>
              </ul>
            </>
          )}

          {/* ---- Step 4: records ---- */}
          {step === 4 && (
            <>
              <Icon emoji="📋" tone="bg-emerald-100 text-emerald-700" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">All your documents in one place</h2>
              <p className="mt-1 text-sm text-gray-500">Every report TRACE generates is saved automatically.</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                Tap Records in the bottom nav to find VCA reports, situation reports, referral letters, and cluster
                alerts — searchable by case, date, or type. Generate a new document for any case in seconds.
              </p>
            </>
          )}

          {/* ---- Step 5: alerts ---- */}
          {step === 5 && (
            <>
              <Icon emoji="🔔" tone="bg-rose-100 text-rose-700" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">Cluster alerts — sent and received</h2>
              <p className="mt-1 text-sm text-gray-500">Stay connected to your operating area.</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                TRACE receives cluster alerts from WASH, Protection, Health, and other sector leads — geo-filtered to
                your area. You can also trigger outbound alerts from any case, notifying cluster coordinators of
                situations on the ground.
              </p>
            </>
          )}
        </div>

        {/* Progress dots */}
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

        {/* Footer */}
        <div className="mt-2 flex flex-shrink-0 items-center justify-between border-t border-gray-100 pt-4">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-lg px-2 py-2 text-sm text-tracev2-muted transition-colors duration-150 hover:text-gray-700"
            >
              ← Back
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

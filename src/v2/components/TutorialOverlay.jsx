// Scripted demo walkthrough for v2. Step 0 is an intro card; steps 1–4 drive the
// real app — navigating to live screens and showing scripted (no-API) content so
// the demo is reliable. Scenario: "You're Marie-Claire, a caseworker in
// N'Djamena. Falmata, 16, was brought in this morning. Here's how TRACE helps."
//
// Steps 1–2 spotlight a real element (dark overlay + accent ring) with an info
// card; steps 3–4 float an info card over the full-screen AiChat / DocumentModal.
import { useEffect, useState } from 'react';

// Intro video embed. Empty → "coming soon" placeholder; set to a player URL to
// render an inline iframe instead.
const VIDEO_URL = '';

const TOTAL = 4;

// Scripted AI consultation injected into AiChatScreen (via window global).
const DEMO_AI_MESSAGES = [
  { role: 'user', content: "Why was Falmata's case flagged HIGH RISK?" },
  {
    role: 'assistant',
    content:
      "Three CTDC indicators are confirmed in the notes: document confiscation (indicator 2.1), recruitment by deception — false employment offer (indicator 1.2), and the survivor is an unaccompanied minor aged 16–18 (indicator 6.3). The combination of all three automatically triggers a HIGH RISK classification. I'd prioritise the medical assessment today — it's the only outstanding urgent task."
  }
];

// Scripted referral letter injected into DocumentModal (via demoContent).
const DEMO_DOC_CONTENT = `N'Djamena, 19 July 2026

IOM Chad — Protection Unit
Ref: TRACE-#0043 | CONFIDENTIAL

We refer Case #0043, female, aged 16–18, for urgent protection services. Three CTDC trafficking indicators are confirmed: document confiscation, recruitment by deception, and unaccompanied minor status. A medical assessment is urgently required within 48 hours.

Caseworker: Marie-Claire D. | Reviewed and approved for release.`;

// Per-step display content. `kind` controls placement:
//   spotlight       — dark overlay + accent ring on `selector`, card at bottom
//   floating-bottom — no overlay, card floats above the AiChat input bar
//   floating-top    — no overlay, card floats below the DocumentModal header
const STEP_CONTENT = {
  1: {
    kind: 'spotlight',
    selector: '[data-tutorial="daily-brief"]',
    heading: 'Your morning briefing — written by AI',
    body: "Before you open a single case, TRACE has already read your full caseload. Falmata's case is flagged HIGH RISK. Document confiscation confirmed. Medical assessment overdue. You know where to start.",
    label: '1 of 4'
  },
  2: {
    kind: 'spotlight',
    selector: '[data-tutorial="case-notes"]',
    heading: 'Intake in any language — structured in seconds',
    body: "Falmata's notes were taken in Hausa. TRACE detects the language automatically and translates into English — then fills 19 IOM form fields without manual data entry. The caseworker speaks the language of the survivor. TRACE handles the rest.",
    example: {
      hausa: 'An kwace mata takardunta, an ce za ta biya kudin…',
      english: 'Her documents were confiscated. She was told she must pay…'
    },
    label: '2 of 4'
  },
  3: {
    kind: 'floating-bottom',
    heading: 'Ask AI — a senior colleague, always available',
    body: "The AI already read Falmata's file before you asked. Ask for second opinions, CTDC clarifications, or a draft supervisor update.",
    label: '3 of 4'
  },
  4: {
    kind: 'floating-top',
    heading: 'Documents in seconds — in English or French',
    body: 'Referral letters, risk assessments, IOM HTCDS forms, safe exit plans. Every document is AI-drafted and caseworker-reviewed before it leaves the app.',
    label: '4 of 4'
  }
};

export default function TutorialOverlay({ onFinish, onNavigate, onOpenAi, onOpenDocModal }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  // Per-step side effects: navigate the real app, then (for spotlight steps)
  // poll for the target element and measure it. Polling absorbs the async gap
  // between navigation and the target mounting.
  useEffect(() => {
    if (step === 0) {
      setRect(null);
      return undefined;
    }
    let cancelled = false;
    const timers = [];
    const schedule = (fn, ms) => {
      const t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    };

    const spotlight = (selector) => {
      let tries = 0;
      const find = () => {
        if (cancelled) return;
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ block: 'center' });
          schedule(() => {
            if (cancelled) return;
            const r = el.getBoundingClientRect();
            setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          }, 70);
        } else if (tries++ < 40) {
          schedule(find, 60);
        } else {
          setRect(null);
        }
      };
      find();
    };

    const clickWhenReady = (selector, after) => {
      let tries = 0;
      const go = () => {
        if (cancelled) return;
        const el = document.querySelector(selector);
        if (el) {
          el.click();
          after?.();
        } else if (tries++ < 40) {
          schedule(go, 60);
        }
      };
      go();
    };

    setRect(null);

    // The AI screen consumes this global on mount; keep it set only while on the
    // AI step so it never leaks into a real chat session (StrictMode-safe: the
    // overlay owns the lifecycle, AiChatScreen only reads).
    if (step !== 3 && typeof window !== 'undefined') window.__traceDemoMessages = null;

    if (step === 1) {
      onNavigate?.('dashboard');
      spotlight('[data-tutorial="daily-brief"]');
    } else if (step === 2) {
      onNavigate?.('caseView', '#0043');
      // Switch to the Notes tab so its content (the spotlight target) renders.
      clickWhenReady('[data-tutorial="tab-notes"]', () => spotlight('[data-tutorial="case-notes"]'));
    } else if (step === 3) {
      window.__traceDemoMessages = DEMO_AI_MESSAGES;
      onOpenAi?.();
    } else if (step === 4) {
      onOpenDocModal?.('#0043', 'referral', DEMO_DOC_CONTENT);
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function next() {
    if (step < TOTAL) setStep(step + 1);
    else onFinish?.();
  }

  // ---- Step 0: intro card ----
  if (step === 0) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-5"
        style={{ background: 'rgba(0,0,0,0.85)' }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-tracev2-border bg-tracev2-bg p-5 shadow-2xl">
          <h2 className="text-lg font-bold text-tracev2-text">Welcome to TRACE</h2>
          <p className="mt-1 text-sm leading-relaxed text-tracev2-muted">
            An AI assistant that makes anti-trafficking caseworkers better at their work.
          </p>

          <div className="mt-4">
            {VIDEO_URL ? (
              <iframe
                src={VIDEO_URL}
                title="TRACE demo video"
                allowFullScreen
                className="aspect-video w-full rounded-xl border border-tracev2-border"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-tracev2-border bg-tracev2-card">
                <span className="text-xs text-tracev2-subtle">Demo video loading soon…</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 text-xs leading-snug text-tracev2-muted">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-tracev2-accent" />
              <span>82% of displaced persons in the Lake Chad Basin have little formal education</span>
            </div>
            <div className="flex items-start gap-2 text-xs leading-snug text-tracev2-muted">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-tracev2-accent" />
              <span>Caseworkers manage 50+ complex cases — with paper forms</span>
            </div>
          </div>

          <button
            onClick={next}
            className="mt-5 w-full rounded-lg bg-tracev2-accent py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tracev2-accent/90"
          >
            Start tour →
          </button>
          <button
            onClick={onFinish}
            className="mt-2 w-full text-center text-xs text-tracev2-subtle hover:text-tracev2-muted"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  // ---- Steps 1–4: scripted walkthrough ----
  const content = STEP_CONTENT[step];
  const isSpotlight = content.kind === 'spotlight';

  // Info-card anchor. All cards sit at the bottom so they never cover the
  // content they describe: floating-bottom clears the AiChat input bar;
  // floating-top clears the DocumentModal action bar (and keeps the short
  // referral letter fully visible above it); spotlight sits at the very bottom.
  const cardPos =
    content.kind === 'floating-top'
      ? { bottom: 156 }
      : content.kind === 'floating-bottom'
        ? { bottom: 118 }
        : { bottom: 24 };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Spotlight dimming + accent ring (spotlight steps only) */}
      {isSpotlight &&
        (rect ? (
          <div
            className="fixed rounded-lg transition-all duration-200"
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
        ))}

      {/* Info card */}
      <div
        className="pointer-events-auto fixed left-1/2 w-[calc(100%-24px)] max-w-sm -translate-x-1/2 rounded-xl border border-tracev2-border bg-tracev2-card p-4 shadow-2xl"
        style={cardPos}
      >
        <div className="text-sm font-semibold text-tracev2-text">{content.heading}</div>
        <p className="mt-1 text-xs leading-relaxed text-tracev2-muted">{content.body}</p>

        {content.example && (
          <div className="mt-2 rounded-lg border border-tracev2-border bg-tracev2-bg p-2 text-xs">
            <div className="text-tracev2-muted">
              <span className="text-tracev2-subtle">Hausa →</span> &ldquo;{content.example.hausa}&rdquo;
            </div>
            <div className="mt-1 text-tracev2-text">
              <span className="text-tracev2-subtle">English →</span> &ldquo;{content.example.english}&rdquo;
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] tabular-nums text-tracev2-subtle">{content.label}</span>
          <div className="flex items-center gap-2">
            <button onClick={onFinish} className="text-xs text-tracev2-subtle hover:text-tracev2-muted">
              Skip
            </button>
            <button
              onClick={next}
              className="rounded-lg bg-tracev2-accent px-3 py-1 text-xs font-semibold text-white hover:bg-tracev2-accent/90"
            >
              {step === TOTAL ? 'Finish tour' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

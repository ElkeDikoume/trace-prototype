import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Clicks the FormSelector's collapsed toggle bar (if it's collapsed) so the
// three primary form-type cards are actually in the DOM before Shepherd
// tries to attach a spotlight to them. A blank case is already active by
// the time the tour runs, so FormSelector defaults to its collapsed variant.
function ensureFormCardsVisible() {
  return new Promise((resolve) => {
    if (!document.querySelector('[data-tutorial="form-cards-primary"]')) {
      const section = document.querySelector('[data-tutorial="form-selector"]');
      section?.querySelector(':scope > button')?.click();
      // Give the browser a full paint cycle to settle the layout reflow
      // from expanding the card grid before Shepherd measures anything,
      // resolving on the same tick raced with the previous step's fade-out.
      setTimeout(resolve, 150);
    } else {
      resolve();
    }
  });
}

// Undoes window.__traceLoadSampleNotes's edit to the intake notes field if
// the judge loaded the sample notes and then navigated Previous back to
// this step, so re-entering the step always shows a clean field, matching
// the step's own "click below to load the raw notes" framing.
function clearNotesIfSeededByTour() {
  return new Promise((resolve) => {
    if (window.__traceNotesSeededByTour) {
      window.__traceClearSampleNotes?.();
      window.__traceNotesSeededByTour = false;
    }
    resolve();
  });
}

// Small paint/reflow buffer after the structuring promise has already
// resolved (see the 'structure-cta' step's customButtons), so the
// now-populated fields have settled before Shepherd measures them.
function waitForStructuring() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function ensureRiskBannerVisible() {
  return new Promise((resolve) => {
    document.querySelector('[data-tutorial="risk-flag"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(resolve, 300);
  });
}

const REFERRAL_DEMO_QUESTION = "Write a referral letter for Amina to Maison de la Femme in N'Djamena.";

// Opens the floating chat bubble programmatically before the chatbot step's
// spotlight renders, since the panel is a toggled overlay now rather than an
// always-visible bottom panel. Once it's open, pre-fills (but does not send)
// the demo question so the judge can press Send themselves.
function openChatbotWithPrefill() {
  return new Promise((resolve) => {
    window.__traceOpenChatbot?.();
    setTimeout(() => {
      window.__tracePreFillChat?.(REFERRAL_DEMO_QUESTION);
      resolve();
    }, 400);
  });
}

// Closes the chat bubble and switches to the Insights tab programmatically
// (rather than clicking the nav button) before the next step's spotlight
// renders.
function closeChatbotThenSwitchToInsights() {
  return new Promise((resolve) => {
    window.__traceCloseChatbot?.();
    setTimeout(() => {
      window.__traceSwitchToInsights?.();
      resolve();
    }, 300);
  });
}

const STEP_DEFS = [
  {
    id: 'language-selector',
    attachTo: { element: '[data-tutorial="language-selector"]', on: 'bottom' },
    title: 'Choose your language',
    text: 'TRACE supports 5 interface languages: French, English, Arabic, Spanish, and Portuguese. Click the language selector now to see the full list. In production, this switches the entire interface. Real-time local language interpretation (Hausa, Fulfulde, Zarma) is available when connected.'
  },
  {
    id: 'offline-indicator',
    attachTo: { element: '[data-tutorial="offline-indicator"]', on: 'bottom' },
    title: 'Works offline, no connectivity required',
    text: 'In the field, in Diffa, Bangui, or the Lake Chad Basin, caseworkers can capture intake, flag risk from local rules, and prepare referral-ready records with zero connectivity. Syncs automatically when connection returns.',
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      { text: 'Next →', action: () => tour.next(), classes: 'trace-shepherd-btn-primary' }
    ]
  },
  {
    id: 'form-select',
    attachTo: { element: '[data-tutorial="form-cards-primary"]', on: 'bottom' },
    title: 'Select a form type',
    text: "Choose the type of case record to open. HTCDS Intake is already selected for this demo, the IOM Human Trafficking Case Data Standards. Eight form types total, each with its own field schema. Caseworkers select from 8 IOM-standard protection form types. In production, existing forms, including paper forms photographed or ODK exports, can be uploaded and mapped automatically. Select 'HTCDS Trafficking Intake' for this demo.",
    beforeShowPromise: ensureFormCardsVisible
  },
  {
    id: 'intake-notes',
    attachTo: { element: '[data-tutorial="voice-intake"]', on: 'top' },
    title: 'Enter intake notes',
    text: "Caseworkers can speak intake notes directly in their language, no typing needed. For this demo, Amina's notes are pre-recorded in Hausa. Click 'Load sample intake notes' to hear what TRACE receives in the field.",
    beforeShowPromise: clearNotesIfSeededByTour,
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      {
        text: 'Load sample intake notes →',
        action: () => {
          window.__traceLoadSampleNotes?.();
          window.__traceNotesSeededByTour = true;
          tour.next();
        },
        classes: 'trace-shepherd-btn-primary'
      }
    ]
  },
  {
    id: 'interpret-prompt',
    attachTo: { element: '[data-tutorial="interpret-button"]', on: 'right' },
    title: 'Verify meaning before structuring',
    text: "Amina spoke her intake notes in Hausa. TRACE interpreted them into English so the caseworker can verify meaning before structuring. This preserves the survivor's voice and avoids double translation.",
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      {
        text: "I've clicked Interpret →",
        action: async () => {
          await window.__traceInterpretNow?.();
          tour.next();
        },
        classes: 'trace-shepherd-btn-primary'
      }
    ]
  },
  {
    id: 'interpretation',
    attachTo: { element: '[data-tutorial="online-interpretation"]', on: 'top' },
    title: 'Hausa → English interpretation',
    text: "TRACE interpreted Hausa into English in real time. Hausa has 50+ million speakers across the Sahel, yet almost no humanitarian tools serve them. In production: Meta SeamlessM4T handles Hausa, Fulfulde, and Zarma. For this pilot, Sub-Saharan African languages were prioritized: Hausa, Fulfulde, and Zarma. Additional language packs can be added in production.<br /><br />Now click the 'Structure notes with AI →' button to map these notes into the IOM case form fields. Give it about 30 seconds."
  },
  {
    id: 'structure-cta',
    attachTo: { element: '[data-tutorial="structure-button"]', on: 'bottom' },
    title: 'Structure with AI',
    text: "Click the 'Structure notes with AI →' button now to continue. TRACE will map the interpreted notes into the correct IOM HTCDS form fields. This takes about 30 seconds, you'll see the fields populate as TRACE works.",
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      {
        text: 'Structure notes with AI →',
        action: async () => {
          await window.__traceStructureNow?.();
          tour.next();
        },
        classes: 'trace-shepherd-btn-primary'
      }
    ]
  },
  {
    id: 'form-fields',
    attachTo: { element: '[data-tutorial="form-fields"]', on: 'top' },
    title: 'Notes in. Fields out.',
    text: 'Every field was populated from the spoken notes in about 5 seconds. Key fields like Age and Current Location were extracted directly from the spoken notes, the caseworker can edit any field before saving.',
    beforeShowPromise: waitForStructuring
  },
  {
    id: 'risk-flag',
    attachTo: { element: '[data-tutorial="risk-flag"]', on: 'bottom' },
    title: 'Risk score with receipts',
    text: 'HIGH risk, not a black box. TRACE shows which exact fields triggered each of the four CTDC indicators: recruitment fraud, document confiscation, movement restriction, and debt bondage.'
  },
  {
    id: 'ask-ai-why',
    attachTo: { element: '[data-tutorial="ask-ai-why"]', on: 'bottom' },
    title: 'Ask TRACE AI why',
    text: "Every risk flag traces back to a specific field value or keyword, not a guess. Click 'Ask AI why' to open the TRACE Assistant. It will explain, in plain language, exactly which details triggered each CTDC indicator.",
    beforeShowPromise: ensureRiskBannerVisible,
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      {
        text: 'Next →',
        action: () => {
          window.__traceOpenChatbot?.();
          setTimeout(() => tour.next(), 300);
        },
        classes: 'trace-shepherd-btn-primary'
      }
    ]
  },
  {
    id: 'services',
    attachTo: { element: '[data-tutorial="services"]', on: 'bottom' },
    title: 'Suggested referral services',
    text: 'Based on case details and location, TRACE surfaces possible services for human review. These referral options come from a cached IOM and UNHCR provider directory, available offline. In production, organizations with administrative access configure which service directories populate this list, including UNHCR PING, IOM DTM partner networks, or their own verified provider list.'
  },
  {
    id: 'chatbot',
    attachTo: { element: '[data-tutorial="chatbot-input"]', on: 'top' },
    title: 'Ask TRACE anything',
    text: "The TRACE Assistant is open and grounded in Amina's case. The question above is pre-filled. Press Send to watch TRACE draft a complete referral letter, or type your own question.<br /><br />When you're done, you can return to this chat at any time by clicking the chat bubble in the bottom-right corner.",
    beforeShowPromise: openChatbotWithPrefill,
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      {
        text: 'Skip →',
        action: () => {
          window.__traceCloseChatbot?.();
          tour.next();
        },
        classes: 'trace-shepherd-btn-secondary'
      },
      {
        text: 'Send & Continue →',
        action: () => {
          window.__traceAskDemo?.(REFERRAL_DEMO_QUESTION);
          setTimeout(() => tour.next(), 500);
        },
        classes: 'trace-shepherd-btn-primary'
      }
    ]
  },
  {
    id: 'supervisor-tab',
    attachTo: { element: '[data-tutorial="documents-tab"]', on: 'bottom' },
    title: 'Insights tab, where TRACE works for you.',
    text: "Generate the referral letter here with one click. TRACE uses the structured fields, risk flags, and survivor details from this case to draft it. You review and edit before anything is sent.<br /><br />The Insights tab holds every AI-generated document for this case: referral letter, case summary, IOM monthly return entry, missing information report, and follow-up plan. Each is editable and downloadable before any action is taken. The Missing Information Report shows exactly what data gaps remain for a complete CTDC risk assessment, distinct from the risk score itself.",
    beforeShowPromise: closeChatbotThenSwitchToInsights
  },
  {
    id: 'supervisor-view',
    attachTo: { element: '[data-tutorial="documents-panel"]', on: 'top' },
    title: 'AI-generated, caseworker-owned',
    text: 'Each document is a draft. The caseworker reads it, edits it, and downloads it. The AI writes; the caseworker decides what goes out.'
  },
  {
    id: 'closing',
    title: "That's TRACE.",
    text: 'Offline-first. Multilingual. Human-in-the-loop. Built for frontline caseworkers where the data gaps are largest and the tools are worst. Explore the rest on your own.',
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      { text: 'Explore TRACE →', action: () => tour.complete(), classes: 'trace-shepherd-btn-primary' }
    ]
  }
];

export function startGuidedTour({ onEnd } = {}) {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'trace-shepherd',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true }
    }
  });

  // Defensive cleanup: Shepherd should only ever have one step's element
  // mounted at a time, but overlapping beforeShowPromise/customButton timers
  // (this tour uses several) can occasionally let a new step show before the
  // previous one has torn down, stacking dialogs and breaking Previous/Next.
  // Force-destroy every step that isn't the one currently showing.
  tour.on('show', () => {
    const current = tour.getCurrentStep();
    tour.steps.forEach((step) => {
      if (step !== current && step.el && document.body.contains(step.el)) {
        step.destroy();
      }
    });
    // Fade the new step in (paired with the CSS opacity transition on
    // .trace-shepherd) rather than having it appear instantly.
    if (current?.el) {
      current.el.style.opacity = '0';
      requestAnimationFrame(() => {
        current.el.style.opacity = '1';
      });
    }
  });

  STEP_DEFS.forEach((def, i) => {
    const isFirst = i === 0;
    let buttons;

    if (def.customButtons) {
      buttons = def.customButtons(tour);
    } else {
      buttons = [];
      if (!isFirst) {
        buttons.push({ text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' });
      }
      buttons.push({ text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' });
      buttons.push({ text: 'Next', action: () => tour.next(), classes: 'trace-shepherd-btn-primary' });
    }

    tour.addStep({
      id: def.id,
      title: def.title,
      text: def.text,
      attachTo: def.attachTo,
      beforeShowPromise: def.beforeShowPromise,
      scrollTo: !!def.attachTo,
      buttons
    });
  });

  if (onEnd) {
    tour.on('complete', onEnd);
    tour.on('cancel', onEnd);
  }

  tour.start();
  return tour;
}

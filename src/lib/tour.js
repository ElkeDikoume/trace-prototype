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
      // from expanding the card grid before Shepherd measures anything —
      // resolving on the same tick raced with the previous step's fade-out.
      setTimeout(resolve, 150);
    } else {
      resolve();
    }
  });
}

// Small paint/reflow buffer after the structuring promise has already
// resolved (see the 'structure-cta' step's customButtons), so the
// now-populated fields have settled before Shepherd measures them.
function waitForStructuring() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

// Opens the floating chat bubble programmatically before the chatbot step's
// spotlight renders, since the panel is a toggled overlay now rather than an
// always-visible bottom panel.
function openChatbotBubble() {
  return new Promise((resolve) => {
    window.__traceOpenChatbot?.();
    setTimeout(resolve, 200);
  });
}

// Clicks the Insights tab (the previous step only spotlights it) and
// waits for DocumentsPanel to mount before the next step measures it.
function openDocumentsPanel() {
  return new Promise((resolve) => {
    document.querySelector('[data-tutorial="documents-tab"]')?.click();
    setTimeout(resolve, 300);
  });
}

const STEP_DEFS = [
  {
    id: 'language-selector',
    attachTo: { element: '[data-tutorial="language-selector"]', on: 'bottom' },
    title: 'Choose your language',
    text: 'TRACE works in the caseworker\'s language. The interface and AI responses switch immediately. For this walkthrough, stay in English — but try switching and switching back.'
  },
  {
    id: 'offline-indicator',
    attachTo: { element: '[data-tutorial="offline-indicator"]', on: 'bottom' },
    title: 'Works offline — no connectivity required',
    text: 'TRACE stores cases locally on the device. Caseworkers in Diffa, Bangui, or the Lake Chad Basin can capture intake, flag risk, and generate referrals with zero connectivity. Data syncs automatically when a connection is restored.',
    customButtons: (tour) => [
      { text: 'Next →', action: () => tour.next(), classes: 'trace-shepherd-btn-primary' }
    ]
  },
  {
    id: 'form-select',
    attachTo: { element: '[data-tutorial="form-cards-primary"]', on: 'bottom' },
    title: 'Select a form type',
    text: 'Choose the type of case record to open. HTCDS Intake is already selected for this demo — the IOM Human Trafficking Case Data Standards. Eight form types total, each with its own field schema.',
    beforeShowPromise: ensureFormCardsVisible
  },
  {
    id: 'intake-notes',
    attachTo: { element: '[data-tutorial="voice-intake"]', on: 'top' },
    title: 'Enter intake notes',
    text: "In the field, caseworkers often begin with notes in the survivor's own language. This example arrived in Hausa — a language spoken by 50+ million people across the Sahel, with almost no humanitarian tool support. Click below to load the raw notes.",
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      {
        text: 'Load sample intake notes →',
        action: () => { window.__traceLoadSampleNotes?.(); tour.next(); },
        classes: 'trace-shepherd-btn-primary'
      }
    ]
  },
  {
    id: 'interpretation',
    attachTo: { element: '[data-tutorial="online-interpretation"]', on: 'top' },
    title: 'Hausa → English interpretation',
    text: 'These notes arrived in Hausa. Before structuring, TRACE interprets them to English so the caseworker preserves the survivor\'s meaning. Hausa has 50+ million speakers — almost no humanitarian tools serve them.'
  },
  {
    id: 'structure-cta',
    attachTo: { element: '[data-tutorial="structure-button"]', on: 'bottom' },
    title: 'Structure with AI',
    text: 'TRACE converts the freeform notes into the correct IOM fields. The AI does not replace judgment — it reduces documentation burden. Click below to structure the notes with AI.',
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      {
        text: 'Structure with AI →',
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
    text: 'Every field was populated from the spoken notes in about 5 seconds. Key fields like Age and Current Location were extracted directly from the spoken notes — the caseworker can edit any field before saving.',
    beforeShowPromise: waitForStructuring
  },
  {
    id: 'risk-flag',
    attachTo: { element: '[data-tutorial="risk-flag"]', on: 'bottom' },
    title: 'Risk score with receipts',
    text: 'HIGH risk — not a black box. TRACE shows which exact fields triggered each of the four CTDC indicators: recruitment fraud, document confiscation, movement restriction, and debt bondage. And it tells the caseworker what information is still missing.'
  },
  {
    id: 'services',
    attachTo: { element: '[data-tutorial="services"]', on: 'bottom' },
    title: 'Suggested referral services',
    text: 'Based on case details and location, TRACE surfaces possible services for human review. In full deployment this pulls from live IOM DTM and UNHCR directories.'
  },
  {
    id: 'chatbot',
    attachTo: { element: '[data-tutorial="chatbot-input"]', on: 'top' },
    title: 'Ask TRACE anything',
    text: "Grounded in this case and IOM HTCDS protocol. The chatbot is live — watch it answer a real question about this case.",
    beforeShowPromise: openChatbotBubble,
    customButtons: (tour) => [
      { text: 'Previous', action: () => tour.back(), classes: 'trace-shepherd-btn-secondary' },
      { text: 'End Tour', action: () => tour.cancel(), classes: 'trace-shepherd-btn-ghost' },
      { text: 'Skip →', action: () => tour.next(), classes: 'trace-shepherd-btn-secondary' },
      {
        text: 'Ask TRACE: why was this flagged? →',
        action: () => {
          window.__traceAskDemo?.();
          setTimeout(() => tour.next(), 600);
        },
        classes: 'trace-shepherd-btn-primary'
      }
    ]
  },
  {
    id: 'supervisor-tab',
    attachTo: { element: '[data-tutorial="documents-tab"]', on: 'bottom' },
    title: 'Insights tab — where TRACE works for you.',
    text: 'Generate any case document in one click, review caseload patterns across your organization, and access IOM protocol guidance — all from one place.'
  },
  {
    id: 'supervisor-view',
    attachTo: { element: '[data-tutorial="documents-panel"]', on: 'top' },
    title: 'AI-generated, caseworker-owned',
    text: 'Each document is a draft. The caseworker reads it, edits it, and downloads it. The AI writes; the caseworker decides what goes out.',
    beforeShowPromise: openDocumentsPanel
  },
  {
    id: 'closing',
    title: "That's TRACE.",
    text: 'Offline-first. Multilingual. Human-in-the-loop. Built for frontline caseworkers where the data gaps are largest and the tools are worst. Explore the rest on your own.'
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

  STEP_DEFS.forEach((def, i) => {
    const isFirst = i === 0;
    const isLast = i === STEP_DEFS.length - 1;
    let buttons;

    if (def.customButtons) {
      buttons = def.customButtons(tour);
    } else if (isLast) {
      buttons = [{ text: 'Explore TRACE →', action: () => tour.complete(), classes: 'trace-shepherd-btn-primary' }];
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

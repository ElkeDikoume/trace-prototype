import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Clicks the FormSelector's collapsed toggle bar (if it's collapsed) so the
// three primary form-type cards are actually in the DOM before Shepherd
// tries to attach a spotlight to them. A demo case is already active by the
// time the tour runs, so FormSelector defaults to its collapsed variant.
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

const STEP_DEFS = [
  {
    id: 'pattern-intelligence',
    attachTo: { element: '[data-tutorial="pattern-banner"]', on: 'bottom' },
    title: 'Cross-case intelligence',
    text: "Before opening a single case, TRACE surfaces what no individual worker can see — the same broker appearing across unconnected files, a new trafficking corridor emerging. Flagged for human review."
  },
  {
    id: 'form-cards',
    attachTo: { element: '[data-tutorial="form-cards-primary"]', on: 'bottom' },
    title: '8 standard humanitarian forms',
    text: 'Select the intake type. TRACE knows the IOM HTCDS schema for each one and pre-populates every field it can from existing case data.',
    beforeShowPromise: ensureFormCardsVisible
  },
  {
    id: 'form-fields',
    attachTo: { element: '[data-tutorial="form-fields"]', on: 'top' },
    title: 'Structured automatically',
    text: 'Case notes spoken or typed in any of 5 languages are structured into the correct fields. This case arrived in Arabic. Every field you see was filled by TRACE.'
  },
  {
    id: 'interpretation',
    attachTo: { element: '[data-tutorial="online-interpretation"]', on: 'top' },
    title: 'Local language interpretation',
    text: 'Hausa to English in one step — no separate translation pass. 50+ million speakers across the Sahel. Almost no humanitarian tools serve them. TRACE does.'
  },
  {
    id: 'risk-flag',
    attachTo: { element: '[data-tutorial="risk-flag"]', on: 'bottom' },
    title: "Risk flag with what's missing",
    text: 'HIGH risk. Three CTDC indicators matched. But TRACE goes further: it tells the caseworker exactly what information is still missing that would sharpen or reduce this read.'
  },
  {
    id: 'chatbot',
    attachTo: { element: '[data-tutorial="chatbot-input"]', on: 'top' },
    title: 'Ask TRACE anything',
    text: "Grounded in this case's data and IOM HTCDS protocol. Ask why it was flagged. Ask for service recommendations. Ask for a referral letter. Try it."
  },
  {
    id: 'supervisor',
    attachTo: { element: '[data-tutorial="supervisor-tab"]', on: 'bottom' },
    title: 'Supervisor intelligence',
    text: 'Geographic risk hotspots, caseload distribution, and cross-case patterns. All flagged for caseworker and supervisor review — never autonomous.'
  },
  {
    id: 'support-care',
    attachTo: { element: '[data-tutorial="support-care"]', on: 'bottom' },
    title: 'Caseworker wellbeing',
    text: 'After every HIGH risk case, TRACE checks in on the caseworker. Vicarious trauma is documented in this work. TRACE takes it seriously.'
  },
  {
    id: 'closing',
    title: "You've seen TRACE.",
    text: 'Live prototype built for frontline anti-trafficking caseworkers. Offline-first. Multilingual. Human-in-the-loop. Explore the rest on your own.'
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
    const buttons = [];

    if (isLast) {
      buttons.push({ text: 'Done', action: () => tour.complete(), classes: 'trace-shepherd-btn-primary' });
    } else {
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

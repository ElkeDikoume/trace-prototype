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
    text: 'Before opening a single case, TRACE shows what no individual caseworker can see alone. Same broker name across 3 unconnected files. A new corridor in 7 days. All flagged for human review — never acted on automatically.'
  },
  {
    id: 'form-cards',
    attachTo: { element: '[data-tutorial="form-cards-primary"]', on: 'bottom' },
    title: 'Choose your form type',
    text: "A caseworker in N'Djamena opened TRACE and selected HTCDS Intake — the IOM standard for anti-trafficking documentation. Eight form types. TRACE knows the field schema for each one.",
    beforeShowPromise: ensureFormCardsVisible
  },
  {
    id: 'form-fields',
    attachTo: { element: '[data-tutorial="form-fields"]', on: 'top' },
    title: 'Notes in. Structure out.',
    text: "She spoke her intake notes in Hausa. Eight seconds later, TRACE filled every field you're looking at — no typing, no template. The caseworker reviews and corrects. That's the loop."
  },
  {
    id: 'interpretation',
    attachTo: { element: '[data-tutorial="online-interpretation"]', on: 'top' },
    title: '50 million speakers. Almost no tools.',
    text: 'The raw notes were in Hausa. TRACE interpreted them to English before structuring. Hausa, Fulfulde, Zarma — local languages across the Sahel that existing humanitarian tools almost entirely ignore.'
  },
  {
    id: 'risk-flag',
    attachTo: { element: '[data-tutorial="risk-flag"]', on: 'bottom' },
    title: 'Risk score with receipts',
    text: 'HIGH risk — not a black box. TRACE shows which exact fields triggered each CTDC indicator: document confiscation, debt bondage, movement restriction. The caseworker can verify every flag. And TRACE tells her what information is still missing.'
  },
  {
    id: 'chatbot',
    attachTo: { element: '[data-tutorial="chatbot-input"]', on: 'top' },
    title: 'Ask TRACE anything',
    text: "Grounded in this case's data and IOM HTCDS protocol. 'Why was this flagged?' 'Draft a referral letter to Maison de la Femme.' 'What information am I still missing?' Try it — the chatbot is live."
  },
  {
    id: 'supervisor',
    attachTo: { element: '[data-tutorial="supervisor-tab"]', on: 'bottom' },
    title: 'What no single caseworker sees',
    text: 'Geographic hotspots, caseload distribution, cross-case patterns. De-identified. Flagged for supervisor review. No autonomous action. This is what makes TRACE an organizational tool, not just a caseworker tool.'
  },
  {
    id: 'support-care',
    attachTo: { element: '[data-tutorial="support-care"]', on: 'bottom' },
    title: 'The caseworker is the resource',
    text: 'After every HIGH-risk case, TRACE checks in. Vicarious trauma is documented in this work — burnout is one of the leading causes of data gaps in trafficking case management. TRACE takes it seriously.'
  },
  {
    id: 'closing',
    title: "That's TRACE.",
    text: 'Offline-first. Multilingual. Human-in-the-loop. Built for frontline caseworkers in the Lake Chad Basin and francophone West Africa — where the data gaps are largest and the tools are worst. Explore the rest on your own.'
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
      buttons.push({ text: 'Explore TRACE →', action: () => tour.complete(), classes: 'trace-shepherd-btn-primary' });
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

// SIMULATED DATA SOURCE — Pattern Intelligence (cross-caseload analysis)
//
// Stands in for a live query across the organization's full caseload —
// something no single caseworker sees on their own. To wire up the real
// thing: replace the body of fetchPatternAlerts() with a query against the
// org's case database (e.g. shared employer/recruiter names, geographic
// clustering, indicator trends over time), keeping the same record shape so
// callers (App.jsx, PatternAlertsBanner.jsx, the chatbot grounding context)
// don't change.

import { simulateLatency } from './shared.js';

export const PATTERN_ALERTS = [
  {
    id: 'pattern-001',
    title: 'Recurring employer name across cases',
    description: '"Alhaji Moussa Transport & Logistics" is named as employer or recruiter in 3 separate case files logged in Diffa and Niamey since June 2026 — consistent with an active recruitment network.',
    severity: 'high',
    casesCited: 3,
    region: 'Diffa / Niamey',
    detectedDate: '2026-07-10'
  },
  {
    id: 'pattern-002',
    title: 'Shared recruitment channel',
    description: '5 cases opened since May 2026 report recruitment through the same informal WhatsApp job-broker group operating between Zinder and Agadez, all promising hospitality or domestic work abroad.',
    severity: 'elevated',
    casesCited: 5,
    region: 'Zinder–Agadez corridor',
    detectedDate: '2026-07-05'
  },
  {
    id: 'pattern-003',
    title: 'Rising debt bondage indicators',
    description: 'Debt bondage indicators among domestic-worker cases in Niamey are up 40% quarter-over-quarter, coinciding with new arrivals from recent border-area displacement — brokers may be targeting recently displaced households.',
    severity: 'watch',
    casesCited: 11,
    region: 'Niamey',
    detectedDate: '2026-07-01'
  }
];

export async function fetchPatternAlerts() {
  await simulateLatency(180);
  return PATTERN_ALERTS;
}

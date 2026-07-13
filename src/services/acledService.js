// SIMULATED DATA SOURCE — ACLED (Armed Conflict Location & Event Data)
//
// Stands in for a live query against the ACLED API (acleddata.com). To wire
// up the real thing: replace the body of fetchAcledEvents() with a request
// to ACLED's API filtered by country/region and date range, keeping the same
// record shape so callers (App.jsx, AcledPanel.jsx, the chatbot grounding
// context) don't change.

import { simulateLatency, tokenize } from './shared.js';

export const ACLED_EVENTS = [
  {
    id: 'acled-001',
    date: '2026-06-18',
    eventType: 'Violence against civilians',
    actor: 'ISWAP faction',
    location: 'Bosso area, Diffa Region',
    country: 'Niger',
    fatalities: 6,
    note: 'Attack on a fishing community near Lake Chad triggered new displacement toward Diffa town, raising exploitation risk for the newly displaced.'
  },
  {
    id: 'acled-002',
    date: '2026-06-29',
    eventType: 'Battle',
    actor: 'Niger Armed Forces vs. ISWAP',
    location: 'Lake Chad islands',
    country: 'Niger / Chad border area',
    fatalities: 14,
    note: 'Military operation displaced island fishing households; IOM DTM recorded new arrivals in Bosso and Baga Sola within days.'
  },
  {
    id: 'acled-003',
    date: '2026-07-02',
    eventType: 'Explosion / remote violence',
    actor: 'Unidentified armed group',
    location: 'Diffa–Nguigmi road corridor',
    country: 'Niger',
    fatalities: 2,
    note: 'IED incident disrupted commercial transport on the main corridor, pushing more travelers onto informal, higher-risk routes.'
  },
  {
    id: 'acled-004',
    date: '2026-05-24',
    eventType: 'Violence against civilians',
    actor: 'Boko Haram faction',
    location: 'Baga, Borno State',
    country: 'Nigeria',
    fatalities: 9,
    note: 'Cross-border spillover; families reported crossing into Diffa Region within days, consistent with the DTM new-arrival spike.'
  },
  {
    id: 'acled-005',
    date: '2026-06-05',
    eventType: 'Riot / civil unrest',
    actor: 'Community militia clash',
    location: 'Zinder outskirts',
    country: 'Niger',
    fatalities: 3,
    note: 'Localized unrest disrupted seasonal agricultural-labor migration patterns along the Zinder–Kano corridor.'
  },
  {
    id: 'acled-006',
    date: '2026-07-08',
    eventType: 'Abduction / forced disappearance',
    actor: 'Unidentified armed group',
    location: 'Bosso, Lake Chad Basin',
    country: 'Niger',
    fatalities: 0,
    note: 'Reported abduction of 4 young women from a lakeside village — consistent with the recruitment-for-exploitation pattern flagged in recent case data.'
  }
];

export async function fetchAcledEvents(locationQuery, limit = 3) {
  await simulateLatency(220);

  if (!locationQuery) {
    return [...ACLED_EVENTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }

  const queryTokens = new Set(tokenize(locationQuery));
  const scored = ACLED_EVENTS.map((event) => {
    const eventTokens = tokenize(`${event.location} ${event.country}`);
    const score = eventTokens.reduce((acc, tok) => acc + (queryTokens.has(tok) ? 1 : 0), 0);
    return { ...event, score };
  });

  scored.sort((a, b) => b.score - a.score || b.date.localeCompare(a.date));
  const matched = scored.filter((e) => e.score > 0);
  return (matched.length > 0 ? matched : scored).slice(0, limit);
}

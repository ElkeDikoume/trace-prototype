// SIMULATED DATA SOURCE, IOM DTM (Displacement Tracking Matrix)
//
// Stands in for a live query against IOM's DTM API (dtm.iom.int). To wire up
// the real thing: replace the body of fetchDtmContext() with a request to the
// DTM API for the relevant country/site, keeping the same record shape so
// callers (App.jsx, DtmPanel.jsx, the chatbot grounding context) don't change.

import { simulateLatency, tokenize } from './shared.js';

export const DTM_LOCATIONS = [
  {
    id: 'dtm-diffa',
    location: 'Diffa',
    country: 'Niger',
    region: 'Lake Chad Basin',
    displacedPopulation: 251000,
    primaryOrigin: 'Cross-border displacement from Borno State, Nigeria',
    vulnerabilityScore: 78,
    trend: 'increasing',
    note: 'New arrivals fleeing ISWAP activity around the Lake Chad islands; elevated trafficking risk reported at informal border crossings.',
    lastUpdated: '2026-06-30'
  },
  {
    id: 'dtm-agadez',
    location: 'Agadez',
    country: 'Niger',
    region: 'Sahel transit corridor',
    displacedPopulation: 42000,
    primaryOrigin: 'Mixed West African migrants (Nigeria, Guinea, Côte d’Ivoire) in transit toward Libya/Algeria',
    vulnerabilityScore: 71,
    trend: 'stable',
    note: 'High concentration of unaccompanied migrants at transit stops; recruitment fraud commonly reported at departure points.',
    lastUpdated: '2026-06-25'
  },
  {
    id: 'dtm-niamey',
    location: 'Niamey',
    country: 'Niger',
    region: 'Sahel / urban',
    displacedPopulation: 68000,
    primaryOrigin: 'Secondary displacement from Tillabéri and Diffa regions',
    vulnerabilityScore: 54,
    trend: 'increasing',
    note: 'Growing informal domestic-labor market draws displaced women and girls; service coverage has not kept pace with arrivals.',
    lastUpdated: '2026-07-02'
  },
  {
    id: 'dtm-bosso',
    location: 'Bosso',
    country: 'Niger',
    region: 'Lake Chad Basin',
    displacedPopulation: 34500,
    primaryOrigin: 'Lake Chad island communities displaced by military operations and insecurity',
    vulnerabilityScore: 82,
    trend: 'increasing',
    note: 'Island populations relocated repeatedly in recent months; fishing-labor exploitation indicators are rising alongside new arrivals.',
    lastUpdated: '2026-07-05'
  },
  {
    id: 'dtm-bagasola',
    location: 'Baga Sola',
    country: 'Chad',
    region: 'Lake Chad Basin',
    displacedPopulation: 58000,
    primaryOrigin: 'Chadian returnees and Nigerian refugees from the Lake Chad islands',
    vulnerabilityScore: 75,
    trend: 'stable',
    note: 'Overcrowded reception sites; child-protection and GBV case referrals have increased over the last two reporting cycles.',
    lastUpdated: '2026-06-28'
  }
];

export async function fetchDtmContext(locationQuery) {
  await simulateLatency(220);
  if (!locationQuery) return null;

  const queryTokens = new Set(tokenize(locationQuery));
  let best = null;
  let bestScore = 0;

  for (const site of DTM_LOCATIONS) {
    const siteTokens = tokenize(`${site.location} ${site.country} ${site.region}`);
    const score = siteTokens.reduce((acc, tok) => acc + (queryTokens.has(tok) ? 1 : 0), 0);
    if (score > bestScore) {
      best = site;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best : null;
}

export async function listDtmLocations() {
  await simulateLatency(150);
  return DTM_LOCATIONS;
}

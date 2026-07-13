// SIMULATED DATA SOURCE — Counter-Trafficking Data Collaborative (CTDC)
//
// Stands in for a live query against the CTDC global trafficking dataset
// (ctdatacollaborative.org). To wire up the real thing: replace the body of
// fetchCtdcIndicators() with a request to CTDC's API/data export, keeping the
// same { indicator, sector, region, pattern, prevalence } record shape so
// every caller below (App.jsx, CtdcPanel.jsx, the chatbot grounding context)
// keeps working unchanged.

import { simulateLatency, tokenize } from './shared.js';

export const CTDC_INDICATOR_RECORDS = [
  { id: 'ctdc-001', indicator: 'Labor recruitment fraud', sector: 'Domestic work', region: 'Agadez corridor, Niger', pattern: 'Recruiters promise paid domestic work in Libya/Algeria transit hubs; agreements are verbal only, no written contract provided.', prevalence: 'Reported in 41% of Agadez-corridor domestic-worker cases (CTDC West Africa subset, 2023–2025).' },
  { id: 'ctdc-002', indicator: 'Labor recruitment fraud', sector: 'Agricultural labor', region: 'Zinder–Kano corridor, Niger/Nigeria', pattern: 'False promises of seasonal farm wages; workers are unaware a transport debt is attached until arrival.', prevalence: 'Recurring pattern across 3 consecutive harvest seasons in CTDC case notes.' },
  { id: 'ctdc-003', indicator: 'Document confiscation', sector: 'Domestic work', region: 'Niamey, Niger', pattern: 'Employers retain passports and ID cards "for safekeeping" at the start of employment, then withhold them indefinitely.', prevalence: 'Present in the majority of urban domestic-work cases reviewed.' },
  { id: 'ctdc-004', indicator: 'Document confiscation', sector: 'Cross-border transit', region: 'Agadez–Sabha corridor', pattern: 'Smugglers or brokers confiscate travel documents at the first transit stop to prevent independent onward travel.', prevalence: 'Consistent across CTDC Sahel-transit route reporting.' },
  { id: 'ctdc-005', indicator: 'Debt bondage', sector: 'Transit / smuggling fees', region: 'Agadez, Niger', pattern: 'A recruitment/transport fee (150,000–600,000 FCFA) is framed as an advance to be repaid through labor at destination.', prevalence: 'Median cited debt has risen year over year in CTDC transit-route records.' },
  { id: 'ctdc-006', indicator: 'Debt bondage', sector: 'Domestic work', region: 'Niamey / Maradi, Niger', pattern: 'Wage deductions for "housing and food" are structured so the original recruitment debt is never repaid.', prevalence: 'Common secondary pattern following recruitment fraud in the same dataset.' },
  { id: 'ctdc-007', indicator: 'Movement restriction', sector: 'Domestic work', region: 'Niamey, Niger', pattern: 'Victims report being forbidden from leaving the residence unaccompanied; phones are confiscated or monitored.', prevalence: 'Co-occurs with document confiscation in most matched cases.' },
  { id: 'ctdc-008', indicator: 'Movement restriction', sector: 'Agricultural labor', region: 'Lake Chad Basin (Diffa region)', pattern: 'Workers are housed on isolated farm compounds with no independent transport access out.', prevalence: 'Elevated in displacement-adjacent farm labor sites per CTDC field reporting.' },
  { id: 'ctdc-009', indicator: 'Physical abuse', sector: 'Domestic work', region: 'Niamey, Niger', pattern: 'Corporal punishment reported for perceived work slowness or attempted escape.', prevalence: 'Documented in roughly 1 in 4 domestic-work cases in the regional subset.' },
  { id: 'ctdc-010', indicator: 'Physical abuse', sector: 'Artisanal mining', region: 'Aïr Mountains, Niger', pattern: 'Beatings reported as "discipline" at informal gold-mining sites employing displaced youth.', prevalence: 'Rising in step with informal mining activity per CTDC sector notes.' },
  { id: 'ctdc-011', indicator: 'Sexual exploitation', sector: 'Hospitality / commercial sex', region: 'Agadez transit corridor', pattern: 'Women recruited for hospitality work are coerced into commercial sexual exploitation en route.', prevalence: 'One of the most frequently cited transit-corridor patterns in the CTDC dataset.' },
  { id: 'ctdc-012', indicator: 'Sexual exploitation', sector: 'Domestic work', region: 'Niamey, Niger', pattern: 'Employers or employers’ relatives are reported as perpetrators of sexual abuse against live-in domestic workers.', prevalence: 'Under-reported but consistently present across regional case reviews.' },
  { id: 'ctdc-013', indicator: 'Labor recruitment fraud', sector: 'Fishing / lake-based labor', region: 'Lake Chad (Bosso, Niger)', pattern: 'Boys recruited for fishing work have wages withheld as an indefinite "training period."', prevalence: 'Documented pattern specific to Lake Chad Basin fishing economies.' },
  { id: 'ctdc-014', indicator: 'Debt bondage', sector: 'Construction', region: 'Niamey urban centers', pattern: 'Recruitment agents charge a placement fee deducted from the first three months’ wages.', prevalence: 'Common in informal urban construction hiring per CTDC labor-sector notes.' },
  { id: 'ctdc-015', indicator: 'Movement restriction', sector: 'Domestic work', region: 'Diffa, Niger', pattern: 'Employers relocate workers frequently between households to prevent community ties or reporting.', prevalence: 'Identified as an emerging evasion tactic in recent CTDC updates.' },
  { id: 'ctdc-016', indicator: 'Document confiscation', sector: 'Fishing / lake-based labor', region: 'Lake Chad Basin', pattern: 'Registration and ID cards are held by boat owners, limiting workers’ access to humanitarian assistance.', prevalence: 'Reported at multiple Lake Chad landing sites.' },
  { id: 'ctdc-017', indicator: 'Physical abuse', sector: 'Forced begging / forced criminality', region: 'Niamey, Zinder', pattern: 'Children in forced-begging networks report physical punishment for insufficient daily earnings.', prevalence: 'Persistent pattern in urban CTDC child-trafficking records.' },
  { id: 'ctdc-018', indicator: 'Sexual exploitation', sector: 'Transit / smuggling', region: 'Sahel transit route (Niger–Libya)', pattern: 'Survival sex is extracted from women and girls at informal checkpoints in exchange for passage.', prevalence: 'Widely corroborated across CTDC and partner transit-monitoring data.' }
];

export async function fetchCtdcIndicators({ matchedIndicatorLabels = [], region = '' } = {}) {
  await simulateLatency(220);

  const regionTokens = new Set(tokenize(region));
  const wantedIndicators = new Set(matchedIndicatorLabels.map((l) => l.toLowerCase()));

  const scored = CTDC_INDICATOR_RECORDS.map((record) => {
    let score = 0;
    if (wantedIndicators.has(record.indicator.toLowerCase())) score += 3;
    const recordRegionTokens = tokenize(record.region);
    if (recordRegionTokens.some((tok) => regionTokens.has(tok))) score += 2;
    return { ...record, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((r) => r.score > 0);
  return (matched.length > 0 ? matched : scored).slice(0, 5);
}

// 8 real service providers drawn from IOM and UNHCR West Africa directories.
// tags are used for simple relevance scoring against case type + geography.

export const SERVICES = [
  {
    id: 'iom_agadez_mrc',
    name: 'IOM Migrant Resource & Response Centre — Agadez',
    org: 'International Organization for Migration (IOM)',
    country: 'Niger',
    regions: ['agadez', 'niger', 'sahel', 'transit route'],
    tags: ['labor_trafficking', 'shelter', 'transit_assistance', 'voluntary_return', 'medical'],
    description: 'Shelter, humanitarian assistance, and voluntary return support for migrants and trafficking survivors along the Agadez transit corridor.',
    contact: 'IOM Niger — Agadez sub-office'
  },
  {
    id: 'iom_niamey_ctu',
    name: 'IOM Counter-Trafficking Unit — Niamey',
    org: 'International Organization for Migration (IOM)',
    country: 'Niger',
    regions: ['niamey', 'niger', 'national'],
    tags: ['labor_trafficking', 'sexual_exploitation', 'case_management', 'legal', 'referral'],
    description: 'Specialized case management, identification, and referral pathway coordination for trafficking survivors nationwide.',
    contact: 'IOM Niger — Niamey country office'
  },
  {
    id: 'unhcr_diffa_protection',
    name: 'UNHCR Protection Unit — Diffa',
    org: 'UNHCR',
    country: 'Niger',
    regions: ['diffa', 'lake chad basin', 'niger'],
    tags: ['displacement', 'legal', 'protection_monitoring', 'refugee_status', 'gbv'],
    description: 'Legal assistance, registration, and protection monitoring for refugees, IDPs, and returnees in the Lake Chad Basin.',
    contact: 'UNHCR Niger — Diffa field office'
  },
  {
    id: 'unhcr_niamey_protection',
    name: 'UNHCR Protection & RSD Unit — Niamey',
    org: 'UNHCR',
    country: 'Niger',
    regions: ['niamey', 'niger', 'national'],
    tags: ['legal', 'refugee_status', 'protection_monitoring', 'family_tracing'],
    description: 'Refugee status determination, legal aid, and protection case referral for the national caseload.',
    contact: 'UNHCR Niger — Niamey country office'
  },
  {
    id: 'maison_femme_enfant',
    name: 'Maison de la Femme et de l’Enfant',
    org: 'Government of Niger / partner NGOs',
    country: 'Niger',
    regions: ['niamey', 'niger'],
    tags: ['gbv', 'sexual_exploitation', 'shelter', 'psychosocial', 'child_protection'],
    description: 'Shelter, psychosocial support, and medical referral for women and children survivors of GBV and exploitation.',
    contact: 'Niamey — Maison de la Femme et de l’Enfant'
  },
  {
    id: 'anltp_tip',
    name: 'ANLTP/TIP — National Anti-Trafficking Agency',
    org: 'Agence Nationale de Lutte contre la Traite des Personnes et le Trafic Illicite de Migrants',
    country: 'Niger',
    regions: ['national', 'niger', 'agadez', 'niamey', 'diffa'],
    tags: ['labor_trafficking', 'sexual_exploitation', 'legal', 'debt_bondage', 'document_confiscation', 'referral'],
    description: 'National government coordination body for trafficking case referral, legal follow-up, and prosecution support.',
    contact: 'ANLTP/TIP — national office, Niamey'
  },
  {
    id: 'tdh_child_protection',
    name: 'Terre des Hommes — Child Protection Programme',
    org: 'Terre des Hommes',
    country: 'Niger',
    regions: ['niamey', 'diffa', 'niger', 'sahel'],
    tags: ['child_protection', 'unaccompanied_minors', 'psychosocial', 'family_tracing'],
    description: 'Identification, family tracing, and psychosocial care for unaccompanied and separated children, including trafficking survivors.',
    contact: 'Terre des Hommes Niger'
  },
  {
    id: 'icrc_family_links',
    name: 'ICRC Restoring Family Links',
    org: 'International Committee of the Red Cross (ICRC)',
    country: 'Regional (West & Central Africa)',
    regions: ['national', 'niger', 'lake chad basin', 'regional', 'cross-border'],
    tags: ['family_tracing', 'movement_restriction', 'detention', 'cross_border'],
    description: 'Cross-border family tracing and reconnection services for people separated during displacement, transit, or exploitation.',
    contact: 'ICRC delegation — Niamey'
  }
];

export function suggestServices(caseData, formType, limit = 3) {
  const haystack = JSON.stringify(caseData).toLowerCase();
  const geo = `${caseData.currentLocation || ''} ${caseData.location || ''} ${caseData.exploitationLocation || ''} ${caseData.incidentLocation || ''}`.toLowerCase();

  const tagHints = [];
  if (/labo(u)?r/.test(haystack) || /recruit/.test(haystack)) tagHints.push('labor_trafficking');
  if (/sexual/.test(haystack)) tagHints.push('sexual_exploitation');
  if (/gbv|gender|assault|rape|intimate partner/.test(haystack)) tagHints.push('gbv');
  if (/debt/.test(haystack)) tagHints.push('debt_bondage');
  if (/document/.test(haystack)) tagHints.push('document_confiscation');
  if (/minor|child|unaccompanied/.test(haystack)) tagHints.push('child_protection', 'unaccompanied_minors');
  if (/displac|idp|refugee|returnee/.test(haystack)) tagHints.push('displacement', 'refugee_status');
  if (/family|separated/.test(haystack)) tagHints.push('family_tracing');
  if (formType === 'gbv_incident') tagHints.push('gbv');
  if (formType === 'htcds_intake') tagHints.push('labor_trafficking', 'case_management');
  if (formType === 'protection_monitoring') tagHints.push('protection_monitoring', 'displacement');

  const scored = SERVICES.map((svc) => {
    let score = 0;
    svc.tags.forEach((tag) => {
      if (tagHints.includes(tag)) score += 2;
    });
    svc.regions.forEach((region) => {
      if (region !== 'national' && region !== 'regional' && geo.includes(region)) score += 3;
    });
    if (svc.regions.includes('national') || svc.regions.includes('regional')) score += 0.5;
    return { ...svc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

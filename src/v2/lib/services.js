// Curated service directory for the demo — IOM/NGO partners operating in Chad
// and the Lake Chad Basin region. Used to pre-populate referral letters so
// caseworkers don't have to recall contact details from memory.
// Sources: IOM Chad, UNHCR Chad, OCHA FTS Chad, partner coordination lists.

export const SERVICE_TYPES = ['All', 'Shelter', 'Legal Aid', 'Medical', 'Psychosocial', 'Livelihood', 'Child Protection', 'Law Enforcement'];

export const SERVICES = [
  {
    id: 'iom-chad',
    name: "IOM — International Organization for Migration, Chad",
    shortName: 'IOM Chad',
    type: 'Medical',
    secondaryType: 'Psychosocial',
    location: "N'Djamena",
    address: "Avenue Charles de Gaulle, N'Djamena, Chad",
    contact: "+235 22 52 39 91",
    email: "iomtchad@iom.int",
    description: "Direct assistance to trafficking survivors: emergency shelter referral, medical care, psychosocial support, voluntary return assistance, and reintegration support.",
    forMinors: true
  },
  {
    id: 'unhcr-chad',
    name: "UNHCR — UN Refugee Agency, Chad",
    shortName: 'UNHCR Chad',
    type: 'Legal Aid',
    secondaryType: 'Shelter',
    location: "N'Djamena",
    address: "Quartier Ambassatna, N'Djamena, Chad",
    contact: "+235 22 52 33 85",
    email: "tchnd@unhcr.org",
    description: "Protection for refugees and stateless persons. Legal documentation, RSD procedures, and emergency shelter coordination.",
    forMinors: true
  },
  {
    id: 'afpad',
    name: "AFPAD — Association des Femmes pour la Paix et le Développement",
    shortName: 'AFPAD',
    type: 'Shelter',
    secondaryType: 'Psychosocial',
    location: "N'Djamena",
    address: "Quartier Moursal, N'Djamena, Chad",
    contact: "+235 66 25 18 43",
    email: null,
    description: "Emergency shelter and psychosocial support for women and girls who are survivors of GBV and trafficking. Short-term safe house available.",
    forMinors: true
  },
  {
    id: 'ahpd',
    name: "AHPD — Association Humanitaire pour la Paix et le Développement",
    shortName: 'AHPD',
    type: 'Legal Aid',
    secondaryType: 'Livelihood',
    location: "N'Djamena",
    address: "N'Djamena, Chad",
    contact: "+235 66 31 72 18",
    email: null,
    description: "Legal aid and rights-awareness for trafficking survivors and vulnerable migrants. Livelihood and vocational training referrals.",
    forMinors: false
  },
  {
    id: 'unicef-chad',
    name: "UNICEF — Child Protection Programme, Chad",
    shortName: 'UNICEF Chad',
    type: 'Child Protection',
    secondaryType: 'Psychosocial',
    location: "N'Djamena",
    address: "Rue 1058, N'Djamena, Chad",
    contact: "+235 22 52 39 79",
    email: "ndjamena@unicef.org",
    description: "Child protection case management for unaccompanied and separated children, child trafficking survivors, and children associated with armed groups.",
    forMinors: true
  },
  {
    id: 'icrc-chad',
    name: "ICRC — International Committee of the Red Cross, Chad",
    shortName: 'ICRC Chad',
    type: 'Child Protection',
    secondaryType: 'Legal Aid',
    location: "N'Djamena",
    address: "Avenue Mobutu, N'Djamena, Chad",
    contact: "+235 22 52 14 20",
    email: "ndjamena-gza@icrc.org",
    description: "Family tracing and reunification (RCH), protection for detainees, and emergency response. Key partner for missing persons alerts.",
    forMinors: true
  },
  {
    id: 'msf-chad',
    name: "MSF — Médecins Sans Frontières, Chad",
    shortName: 'MSF Chad',
    type: 'Medical',
    secondaryType: null,
    location: "N'Djamena / Abéché",
    address: "N'Djamena, Chad",
    contact: "+235 22 51 30 19",
    email: null,
    description: "Emergency medical care including GBV clinical management, reproductive health, and mental health first aid for survivors of violence and trafficking.",
    forMinors: true
  },
  {
    id: 'coopi-chad',
    name: "COOPI — Cooperazione Internazionale, Chad",
    shortName: 'COOPI Chad',
    type: 'Livelihood',
    secondaryType: 'Psychosocial',
    location: "N'Djamena / Lac Region",
    address: "N'Djamena, Chad",
    contact: "+235 66 49 85 30",
    email: "chad@coopi.org",
    description: "Livelihood recovery, vocational training, and protection programming for trafficking-affected communities in the Lake Chad Basin.",
    forMinors: false
  },
  {
    id: 'pn-chad',
    name: "Police Nationale — Brigade Spéciale de Protection des Mineurs",
    shortName: 'Police des Mineurs',
    type: 'Law Enforcement',
    secondaryType: 'Child Protection',
    location: "N'Djamena",
    address: "Direction de la Police Judiciaire, N'Djamena, Chad",
    contact: "+235 22 51 24 66",
    email: null,
    description: "Specialised police unit for child protection cases, including trafficking of minors. Official complaint registration and protective custody orders.",
    forMinors: true
  },
  {
    id: 'aprofem',
    name: "APROFEM — Association pour la Promotion de la Femme",
    shortName: 'APROFEM',
    type: 'Psychosocial',
    secondaryType: 'Livelihood',
    location: "N'Djamena",
    address: "Quartier Farcha, N'Djamena, Chad",
    contact: "+235 66 27 44 91",
    email: null,
    description: "Psychosocial support and economic empowerment for women survivors of trafficking and GBV. Savings groups, skills training, and peer support networks.",
    forMinors: false
  },
  {
    id: 'capad',
    name: "CAPAD — Centre d'Accueil et de Protection des Droits",
    shortName: 'CAPAD',
    type: 'Legal Aid',
    secondaryType: 'Shelter',
    location: "N'Djamena",
    address: "N'Djamena, Chad",
    contact: "+235 66 35 87 22",
    email: null,
    description: "Legal rights support, temporary protection shelter, and case accompaniment for trafficking survivors seeking justice or family reintegration.",
    forMinors: true
  },
  {
    id: 'hc-chad',
    name: "Haut-Commissariat pour les Réfugiés (HCR) — Antenne de N'Djamena",
    shortName: 'HCR N\'Djamena',
    type: 'Shelter',
    secondaryType: 'Legal Aid',
    location: "N'Djamena",
    address: "N'Djamena, Chad",
    contact: "+235 22 52 33 85",
    email: null,
    description: "Coordinated shelter placement and legal protection for refugees and asylum seekers, including victims of trafficking who may have protection needs.",
    forMinors: true
  }
];

export function filterServices({ type = 'All', query = '', minorsOnly = false }) {
  return SERVICES.filter((s) => {
    if (type !== 'All' && s.type !== type && s.secondaryType !== type) return false;
    if (minorsOnly && !s.forMinors) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

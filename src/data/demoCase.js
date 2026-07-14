// Prefilled sample case for Demo Mode, so anyone can try the full TRACE loop
// (intake → risk flag → services → chatbot) without entering real data.

export const DEMO_CASE_FORM_ID = 'htcds_intake';

export const DEMO_CASE_DATA = {
  fullName: 'AK-001',
  age: '28',
  gender: 'Female',
  nationality: 'Chadian',
  currentLocation: "N'Djamena, Chad",
  countryOfOrigin: 'Chad',
  recruitmentMethod: 'Recruited via an informal broker who promised paid domestic and hospitality work in N\'Djamena; no contract was provided and the job was not what was promised.',
  recruiterRelationship: 'Broker introduced by an acquaintance',
  journeyRoute: 'Traveled from rural Mayo-Kebbi region to N\'Djamena',
  exploitationType: 'Labor exploitation',
  exploitationLocation: "N'Djamena, Chad",
  employerBroker: 'Household employer (name withheld)',
  documentsConfiscated: 'Yes',
  debtOwed: 'Owes a placement fee of 350,000 XAF, deducted from wages before any pay is received',
  movementRestricted: 'Yes',
  physicalAbuse: 'Unknown',
  sexualAbuse: 'Unknown',
  immediateNeeds: 'Currently in shelter care; needs a medical check-up and psychosocial support',
  caseworkerNotes: 'Case captured via Arabic voice intake at an N\'Djamena partner shelter. Survivor presents with labor trafficking indicators: recruitment fraud, document confiscation, debt bondage, and movement restriction.'
};

// Raw Hausa-language intake note the guided tour loads into a blank case's
// notes field to demonstrate live AI structuring (see App.jsx's
// window.__traceLoadSampleNotes). Kept identical to the source text in
// OnlineInterpretationPanel.jsx's interpretation example, so Step 3
// (load notes) and Step 4 (interpretation panel) show the same testimony.
// The debt-bondage sentence states that indicator explicitly (see prior
// commit) so HIGH risk fires reliably. The final sentence adds her age and
// current location explicitly, since neither was clearly stated before,
// only her origin (Kano) was mentioned, so the tour's "form-fields" step
// can honestly point at Age and Current Location as fields the AI actually
// extracted from the notes, not fields that happened to stay empty. The
// opening clause names her ("Amina ta ce...", "Amina said...") so the
// structuring step can genuinely extract a Full Name too, rather than the
// AI needing to invent one that was never actually spoken.
export const DEMO_INTAKE_NOTES = "Amina ta ce mai daukar ma'aikata ya karɓi takardar shaidar ta, ba za ta iya tafiya ba. An kawo ta daga Kano, ana cewa za a ba ta aiki a gidan yara, amma an tilasta ta yin aiki ba tare da kuɗi ba. Ta ce an gaya mata cewa tana bin bashin daukar ma'aikata, kuma ana cire kuɗi daga albashinta kafin ta karɓi kome. Tana da shekaru 28, kuma a yanzu ana tsare da ita a N'Djamena.";

// Two additional seeded examples so first-time visitors see varied case
// types (form type, geography, profile) without running the demo first.
// A couple of fields are added beyond what's literally specified below
// (location for Ibrahim, survivorIdentifier for Marie-Claire, and
// incidentType mapped to a real select option) so the required fields for
// each form schema (see forms.js) actually render filled in, rather than
// appearing blank despite the case having real data.
export const EXAMPLE_CASE_IBRAHIM = {
  id: 'example-ibrahim',
  formId: 'protection_monitoring',
  data: {
    fullName: 'Ibrahim S. (pseudonym)',
    age: '16',
    gender: 'Male',
    nationality: 'Nigerien',
    currentLocation: 'Diffa, Niger',
    location: 'Diffa, Niger',
    vulnerabilityIndicators: 'Unaccompanied minor, separated from family during displacement from Lake Chad area, no documentation',
    protectionConcerns: 'At risk of recruitment by armed actors; no guardian present; no shelter arrangement',
    immediateNeeds: 'Emergency shelter, legal documentation, family tracing',
    caseworkerNotes: 'Referred by UNICEF partner at Diffa transit point. No family contact established.'
  },
  chatHistory: []
};

export const EXAMPLE_CASE_MARIECLAIRE = {
  id: 'example-marieclaire',
  formId: 'gbv_incident',
  data: {
    fullName: 'Marie-Claire T. (pseudonym)',
    survivorIdentifier: 'Marie-Claire T. (pseudonym)',
    age: '34',
    gender: 'Female',
    nationality: 'Congolese',
    currentLocation: 'Bangui, CAR',
    incidentType: 'Sexual assault',
    incidentLocation: 'Transit shelter, Bangui',
    immediateNeeds: 'Medical care, psychosocial support, legal aid',
    caseworkerNotes: 'Survivor arrived at partner shelter in Bangui after displacement from DRC. Incident occurred during transit. Has two children, ages 4 and 7, currently with her.'
  },
  chatHistory: []
};

// Field schemas for each case form type.
// type: 'text' | 'textarea' | 'select' | 'date' | 'checkboxGroup'

export const FORM_TYPES = [
  {
    id: 'htcds_intake',
    name: 'IOM HTCDS Trafficking Intake',
    shortName: 'HTCDS Intake',
    description: 'Initial intake aligned to IOM Human Trafficking Case Data Standards.',
    riskEligible: true,
    fields: [
      { key: 'fullName', label: 'Full name (or identifier if anonymous)', type: 'text', required: true },
      { key: 'age', label: 'Age', type: 'text' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Unknown'] },
      { key: 'nationality', label: 'Nationality', type: 'text' },
      { key: 'currentLocation', label: 'Current location (city/region, country)', type: 'text', required: true },
      { key: 'countryOfOrigin', label: 'Country of origin', type: 'text' },
      { key: 'recruitmentMethod', label: 'How was the survivor recruited?', type: 'textarea' },
      { key: 'recruiterRelationship', label: 'Relationship to recruiter/broker', type: 'text' },
      { key: 'journeyRoute', label: 'Journey / transit route', type: 'textarea' },
      { key: 'exploitationType', label: 'Type of exploitation', type: 'select', options: ['Labor exploitation', 'Sexual exploitation', 'Domestic servitude', 'Forced marriage', 'Organ removal', 'Forced criminality', 'Unknown / unclear'] },
      { key: 'exploitationLocation', label: 'Location of exploitation', type: 'text' },
      { key: 'employerBroker', label: 'Employer / broker / trafficker name (if known)', type: 'text' },
      { key: 'documentsConfiscated', label: 'Were identity documents confiscated?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'debtOwed', label: 'Debt owed / debt bondage details', type: 'textarea' },
      { key: 'movementRestricted', label: 'Was movement restricted or monitored?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'physicalAbuse', label: 'Physical abuse reported?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'sexualAbuse', label: 'Sexual abuse / exploitation reported?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'immediateNeeds', label: 'Immediate needs (medical, shelter, safety)', type: 'textarea' },
      { key: 'caseworkerNotes', label: 'Caseworker notes', type: 'textarea' }
    ]
  },
  {
    id: 'protection_monitoring',
    name: 'Protection Monitoring Form',
    shortName: 'Protection Monitoring',
    description: 'Ongoing protection risk monitoring for an individual or household.',
    riskEligible: true,
    fields: [
      { key: 'fullName', label: 'Full name (or identifier)', type: 'text', required: true },
      { key: 'age', label: 'Age', type: 'text' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Unknown'] },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'householdSize', label: 'Household size', type: 'text' },
      { key: 'displacementStatus', label: 'Displacement status', type: 'select', options: ['IDP', 'Refugee', 'Returnee', 'Migrant', 'Host community', 'Unknown'] },
      { key: 'protectionConcerns', label: 'Protection concerns observed', type: 'textarea' },
      { key: 'movementRestricted', label: 'Movement restricted?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'documentsConfiscated', label: 'Documents confiscated or missing?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'debtOwed', label: 'Debt or economic coercion reported?', type: 'textarea' },
      { key: 'physicalAbuse', label: 'Physical abuse indicators?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'sexualAbuse', label: 'Sexual violence indicators?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'accessToServices', label: 'Access to services (health, legal, etc.)', type: 'textarea' },
      { key: 'monitorNotes', label: 'Monitor notes', type: 'textarea' }
    ]
  },
  {
    id: 'gbv_incident',
    name: 'GBV Incident Report',
    shortName: 'GBV Incident',
    description: 'Gender-based violence incident documentation.',
    riskEligible: false,
    fields: [
      { key: 'survivorIdentifier', label: 'Survivor identifier (code, not name, if possible)', type: 'text', required: true },
      { key: 'age', label: 'Age', type: 'text' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'] },
      { key: 'incidentDate', label: 'Date of incident', type: 'date' },
      { key: 'incidentLocation', label: 'Location of incident', type: 'text' },
      { key: 'incidentType', label: 'Type of incident', type: 'select', options: ['Physical assault', 'Sexual assault', 'Rape', 'Forced marriage', 'Denial of resources', 'Psychological abuse', 'Other'] },
      { key: 'perpetratorRelationship', label: 'Relationship to perpetrator', type: 'select', options: ['Intimate partner', 'Family member', 'Employer', 'Stranger', 'Authority figure', 'Unknown', 'Other'] },
      { key: 'incidentDescription', label: 'Description of incident', type: 'textarea' },
      { key: 'medicalAttention', label: 'Medical attention received?', type: 'select', options: ['Yes', 'No', 'Referred', 'Unknown'] },
      { key: 'safetyRisk', label: 'Immediate safety risk?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'referralsMade', label: 'Referrals made', type: 'textarea' },
      { key: 'caseworkerNotes', label: 'Caseworker notes', type: 'textarea' }
    ]
  },
  {
    id: 'progress_note',
    name: 'Case Progress Note',
    shortName: 'Progress Note',
    description: 'Ongoing case management update.',
    riskEligible: false,
    fields: [
      { key: 'caseId', label: 'Case ID / reference', type: 'text' },
      { key: 'noteDate', label: 'Date of note', type: 'date' },
      { key: 'sessionType', label: 'Session type', type: 'select', options: ['In-person', 'Phone', 'Home visit', 'Shelter visit', 'Other'] },
      { key: 'currentStatus', label: 'Current status summary', type: 'textarea' },
      { key: 'servicesProvided', label: 'Services provided since last note', type: 'textarea' },
      { key: 'newConcerns', label: 'New concerns identified', type: 'textarea' },
      { key: 'nextSteps', label: 'Next steps / action plan', type: 'textarea' },
      { key: 'nextFollowUpDate', label: 'Next follow-up date', type: 'date' },
      { key: 'caseworkerNotes', label: 'Additional notes', type: 'textarea' }
    ]
  },
  {
    id: 'referral',
    name: 'Inter-Agency Referral',
    shortName: 'Referral',
    description: 'Formal referral of a case to another agency or service provider.',
    riskEligible: false,
    fields: [
      { key: 'caseId', label: 'Case ID / reference', type: 'text' },
      { key: 'clientIdentifier', label: 'Client identifier', type: 'text', required: true },
      { key: 'referringAgency', label: 'Referring agency', type: 'text' },
      { key: 'referringCaseworker', label: 'Referring caseworker', type: 'text' },
      { key: 'receivingAgency', label: 'Receiving agency / service', type: 'text', required: true },
      { key: 'referralReason', label: 'Reason for referral', type: 'textarea' },
      { key: 'urgency', label: 'Urgency', type: 'select', options: ['Routine', 'Priority', 'Emergency'] },
      { key: 'servicesRequested', label: 'Services requested', type: 'textarea' },
      { key: 'consentObtained', label: 'Client consent obtained for information sharing?', type: 'select', options: ['Yes', 'No'] },
      { key: 'additionalInfo', label: 'Additional information for receiving agency', type: 'textarea' }
    ]
  },
  {
    id: 'consent',
    name: 'Consent Form',
    shortName: 'Consent',
    description: 'Informed consent for services, data sharing, or referral.',
    riskEligible: false,
    fields: [
      { key: 'clientIdentifier', label: 'Client identifier', type: 'text', required: true },
      { key: 'consentDate', label: 'Date', type: 'date' },
      { key: 'consentScope', label: 'Consent covers', type: 'checkboxGroup', options: ['Case documentation', 'Information sharing with other agencies', 'Referral to services', 'Photography/media', 'Follow-up contact'] },
      { key: 'consentExplainedIn', label: 'Consent explained in (language)', type: 'select', options: ['French', 'English', 'Arabic', 'Spanish', 'Portuguese', 'Local language via interpreter'] },
      { key: 'clientUnderstanding', label: 'Client confirmed understanding?', type: 'select', options: ['Yes', 'No', 'Partial'] },
      { key: 'guardianConsent', label: 'Guardian consent required and obtained (if minor)?', type: 'select', options: ['N/A', 'Yes', 'No'] },
      { key: 'withdrawalExplained', label: 'Right to withdraw consent explained?', type: 'select', options: ['Yes', 'No'] },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    id: 'follow_up',
    name: 'Follow-Up Review',
    shortName: 'Follow-Up',
    description: 'Scheduled follow-up review of a case in progress.',
    riskEligible: false,
    fields: [
      { key: 'caseId', label: 'Case ID / reference', type: 'text' },
      { key: 'reviewDate', label: 'Review date', type: 'date' },
      { key: 'timeSinceIntake', label: 'Time since intake / last review', type: 'text' },
      { key: 'goalsProgress', label: 'Progress toward case goals', type: 'textarea' },
      { key: 'currentRiskLevel', label: 'Current perceived risk level', type: 'select', options: ['Low', 'Medium', 'High', 'Unknown'] },
      { key: 'servicesOutstanding', label: 'Services still outstanding', type: 'textarea' },
      { key: 'clientWellbeing', label: 'Client well-being assessment', type: 'textarea' },
      { key: 'caseStatus', label: 'Recommended case status', type: 'select', options: ['Continue active', 'Step down', 'Close, resolved', 'Close, lost contact', 'Escalate'] },
      { key: 'reviewNotes', label: 'Review notes', type: 'textarea' }
    ]
  }
];

export function getFormById(id) {
  return FORM_TYPES.find((f) => f.id === id) || null;
}

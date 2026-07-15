// Phase 2 (v2-demo) mock data for the mobile shell.
// NOTE: no real names or identifying survivor information anywhere — case IDs
// and coarse demographics only. Real cases/auth/Supabase arrive in Phase 3.

export const caseworkerName = 'Marie-Claire D.';
export const caseworkerFirstName = 'Marie-Claire';
export const caseworkerInitials = 'MC';

// riskLevel: 'high' | 'medium' | 'low'
// status:    'Active' | 'Urgent' | 'Pending' | 'In progress'
export const mockCases = [
  {
    id: '#0042',
    ageRange: '16–17',
    sex: 'F',
    riskLevel: 'high',
    status: 'Urgent',
    lastUpdated: '12 min ago',
    notes:
      'Referred by border reception point. Reports being promised domestic work abroad; travel documents held by a third party. Frightened, minimal sleep, unsure of current whereabouts of two travel companions.'
  },
  {
    id: '#0039',
    ageRange: '25–30',
    sex: 'M',
    riskLevel: 'medium',
    status: 'In progress',
    lastUpdated: '1 h ago',
    notes:
      'Self-presented at partner shelter. Owes a recruitment debt for transit; withheld wages at previous worksite. Seeking legal-aid referral and safe accommodation.'
  },
  {
    id: '#0037',
    ageRange: '18–24',
    sex: 'F',
    riskLevel: 'low',
    status: 'Active',
    lastUpdated: '3 h ago',
    notes:
      'Follow-up visit. Stable temporary housing secured last week. Reviewing options for vocational training. No new safety concerns reported today.'
  },
  {
    id: '#0031',
    ageRange: '30–40',
    sex: 'M',
    riskLevel: 'medium',
    status: 'Pending',
    lastUpdated: 'Yesterday',
    notes:
      'Intake started, awaiting interpreter for full session. Preliminary account suggests labour exploitation on an agricultural site. Documents pending verification.'
  },
  {
    id: '#0028',
    ageRange: '12–15',
    sex: 'F',
    riskLevel: 'high',
    status: 'Urgent',
    lastUpdated: '2 days ago',
    notes:
      'Unaccompanied minor. Escalated to child-protection focal point. Awaiting confirmation of emergency placement. Do not close before safeguarding sign-off.'
  }
];

// Dashboard summary pills derived from the mock caseload.
export const caseStats = {
  active: mockCases.filter((c) => c.status === 'Active' || c.status === 'In progress').length,
  urgent: mockCases.filter((c) => c.riskLevel === 'high').length,
  pending: mockCases.filter((c) => c.status === 'Pending').length
};

// Placeholder CTDC-style indicators shown in the discreet risk badge on the
// Active Intake screen. Mock only — the real risk engine is out of Phase 2 scope.
export const mockRiskIndicators = [
  'Recruitment by deception (promised work abroad)',
  'Document / ID retention by a third party',
  'Debt bondage indicators reported',
  'Restricted freedom of movement'
];

// Placeholder structured fields returned by the mock "Translate & Structure"
// action. The real Claude API call is Phase 3.
export const mockStructuredFields = [
  { label: 'Detected language', value: 'Hausa (auto-detected)' },
  { label: 'Case type', value: 'Suspected trafficking — labour / domestic' },
  { label: 'Survivor age range', value: '16–17' },
  { label: 'Location', value: "N'Djamena reception point" },
  { label: 'Presenting needs', value: 'Safe accommodation, legal aid, medical screening' },
  { label: 'Immediate risk flags', value: 'Document retention, third-party control, minor' },
  { label: 'Suggested next step', value: 'Refer to child-protection focal point' }
];

// Next auto-generated case id, one past the highest mock id.
export function nextCaseId() {
  const max = mockCases.reduce((m, c) => Math.max(m, parseInt(c.id.replace('#', ''), 10) || 0), 0);
  return '#' + String(max + 1).padStart(4, '0');
}

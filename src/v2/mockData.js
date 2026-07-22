// v2-demo mock data for the mobile shell.
// NOTE: no real names or identifying survivor information — case IDs and coarse
// demographics only. structuredData mirrors the HTCDS-aligned JSON Claude
// produces; ctdc_indicators mirror real CTDC framework categories.

export const caseworkerName = 'Marie-Claire D.';
export const caseworkerFirstName = 'Marie-Claire';
export const caseworkerInitials = 'MC';

// riskLevel: 'high' | 'medium' | 'low'
// status:    'draft' | 'structured' | 'synced' | 'submitted' (record workflow)
export const mockCases = [
  {
    // Falmata — the scripted demo-walkthrough protagonist (see TutorialOverlay).
    id: '#0043',
    ageRange: '16–17',
    sex: 'F',
    riskLevel: 'high',
    status: 'structured',
    lastUpdated: 'this morning',
    location: 'Koura Village, Diffa',
    notes:
      'Sunanta Falmata, tana da shekaru 16. An kwace mata takardunta, an ce za ta biya kuɗin tafiya kafin a bar ta ta tafi. An yi mata alkawarin aikin gida a birnin N\'Djamena, amma tun da ta zo ba a biya ta ba. Ba a bar ta ta fita ita kaɗai ba, tana kwana a gidan mai aiki. Tana matuƙar jin tsoro, ba ta iya barci. Ba ta san inda mutumin da ya kawo ta yake ba, kuma ba ta taɓa ganin iyalinta ba tun watanni uku.',
    structuredData: {
      detected_language: 'Hausa (auto-detected)',
      case_type: 'Suspected trafficking — domestic servitude (unaccompanied minor)',
      age_range: '16–17',
      sex: 'F',
      recruitment_method: 'False promise of paid domestic employment in N\'Djamena; recruited by an acquaintance posing as a labour broker',
      control_method: 'Document confiscation; debt imposed for transport costs; restricted movement; isolation from family',
      exploitation_type: 'Domestic servitude — forced labour in a private household',
      risk_level: 'high',
      ctdc_indicators: [
        'Recruited by deception (false promise of employment)',
        'Minor at time of recruitment',
        'Documents withheld by third party',
        'Unable to leave workplace or residence freely',
        'Unpaid or underpaid labour',
        'Isolation from family and community'
      ],
      summary:
        'Survivor, 16, female, unaccompanied minor, brought to the N\'Djamena reception point this morning. She reports being recruited in her home village by an acquaintance who promised paid domestic work in the capital. On arrival her identity and travel documents were confiscated and she was told she must repay her transport costs before she could leave. She has not been paid, is not permitted to leave the household unaccompanied, and has had no contact with her family for three months. Three CTDC trafficking indicators are confirmed. Medical assessment is outstanding and urgent.'
    },
    ctdcIndicators: [
      'Recruited by deception (false promise of employment)',
      'Minor at time of recruitment',
      'Documents withheld by third party',
      'Unable to leave workplace or residence freely',
      'Unpaid or underpaid labour',
      'Isolation from family and community'
    ],
    // Site-level risk factors surfaced by the collapsible risk banner on the
    // case Overview tab (preferred over the CTDC indicators when present).
    riskFactors: [
      'No early warning system in place',
      'No evacuation route identified',
      '340 households without WASH access',
      'Repeat flood event — 2nd occurrence in 18 months',
      'No shelter pre-positioning in region',
      'Village DRR committee not yet convened'
    ],
    follow_up_tasks: [
      { task: 'Complete medical assessment and psychosocial screening', due: 'Overdue', priority: 'high', done: false },
      { task: 'Refer to child-protection focal point and notify supervisor', due: 'Today', priority: 'high', done: false },
      { task: 'Arrange emergency safe shelter placement', due: 'Today', priority: 'high', done: false },
      { task: 'Request legal aid for document recovery', due: 'This week', priority: 'medium', done: false }
    ]
  },
  {
    id: '#0042',
    ageRange: '16–17',
    sex: 'F',
    riskLevel: 'high',
    status: 'draft',
    lastUpdated: '12 min ago',
    location: 'Toumour Pastoral Camp, Diffa',
    notes:
      'Kana magana da ita a wurin karɓa. Ta ce an yi mata alkawari na aiki a gida a waje. Mutumin da ya turo ta ya riƙe takardunta. Ba ta da barci sosai, tana jin tsoro. Ba ta san inda abokan tafiyarta biyu suke ba. Ta ce tana yin aiki tsawon sa\'o\'i 16 kowace rana ba tare da biyan kuɗi ba. Uwargidanta ta hana ta fita daga gidan.',
    structuredData: {
      detected_language: 'Hausa (auto-detected)',
      case_type: 'Suspected trafficking — domestic servitude (minor)',
      age_range: '16–17',
      sex: 'F',
      recruitment_method: 'False promise of paid domestic employment abroad; recruited through a neighbour posing as a labour broker',
      control_method: 'Document confiscation; physical confinement to household; debt imposed for transport costs; threats to contact family',
      exploitation_type: 'Domestic servitude — forced labour in private household; possible sexual exploitation (to be assessed at medical screening)',
      risk_level: 'high',
      ctdc_indicators: [
        'Recruited by deception (false promise of employment)',
        'Minor at time of recruitment',
        'Documents withheld by third party',
        'Unable to leave workplace or residence freely',
        'Unpaid or underpaid labour',
        'Isolation from family and community'
      ],
      summary:
        'Survivor, 16–17, female, referred by the border reception point after being intercepted during transit. She reports being approached in her home village by a neighbour who promised paid domestic work abroad. Upon arrival, her national ID and travel documents were taken by the household employer. She has been working 16-hour days without wages, is not permitted to leave the residence, and has had no contact with her family in three months. Two travel companions remain unaccounted for. Immediate risks: document detention, minor status, possible undisclosed additional exploitation, and missing persons concern for travel companions.'
    },
    ctdcIndicators: [
      'Recruited by deception (false promise of employment)',
      'Minor at time of recruitment',
      'Documents withheld by third party',
      'Unable to leave workplace or residence freely',
      'Unpaid or underpaid labour',
      'Isolation from family and community'
    ],
    riskFactors: [
      'Active displacement — 847 individuals',
      'Malnutrition risk: no MUAC screening completed',
      'No WASH infrastructure on site',
      'Security incident reported in surrounding area',
      '3 overdue tasks including family tracing'
    ],
    follow_up_tasks: [
      { task: 'Refer to child-protection focal point and notify supervisor', due: 'Today', priority: 'high', done: false },
      { task: 'Arrange emergency safe shelter placement', due: 'Today', priority: 'high', done: false },
      { task: 'Schedule medical screening including psychosocial assessment', due: 'Within 48 h', priority: 'high', done: false },
      { task: 'Initiate missing persons alert for two travel companions', due: 'Within 24 h', priority: 'high', done: false },
      { task: 'Request legal aid for document recovery process', due: 'This week', priority: 'medium', done: false }
    ]
  },
  {
    id: '#0039',
    ageRange: '25–30',
    sex: 'M',
    riskLevel: 'medium',
    status: 'synced',
    lastUpdated: '1 h ago',
    location: 'Garin Wanzam, Maradi',
    notes:
      'Ya zo da kansa a matsuguni. Ya ce wani "jami\'in" ya dauke shi aiki a gonaki. An ce masa zai biya kuɗin tafiyarsa daga albashi — amma ba a biya shi ba watanni uku. Yana da bashi na CFA 85,000. Ba shi da takardar shaida ta aiki kuma yana zaune a sansanin da mai gonaki ya samar. Ya nemi taimako na shari\'a da matsuguni mai aminci.',
    structuredData: {
      detected_language: 'Arabic (auto-detected)',
      case_type: 'Suspected trafficking — labour exploitation',
      age_range: '25–30',
      sex: 'M',
      recruitment_method: 'Fraudulent job offer through a community broker who charged transit and placement fees upfront',
      control_method: 'Debt bondage (CFA 85,000 transport and placement debt deducted against wages never paid); employer holds informal "contract"; tied housing on worksite',
      exploitation_type: 'Forced labour — agricultural sector; possible forced overtime with no rest days',
      risk_level: 'medium',
      ctdc_indicators: [
        'Recruited through deceptive job offer',
        'Debt bondage — recruitment and transport fees withheld from wages',
        'Wages withheld or not paid as agreed (3 months)',
        'Tied housing — accommodation controlled by employer',
        'No written employment contract or legal work authorisation'
      ],
      summary:
        'Survivor, 25–30, male, self-presented at a partner shelter. He was recruited through a community broker who promised agricultural work with transport costs deducted from salary. Upon arrival at the site, wages were never paid and a debt of CFA 85,000 was imposed. He has worked for three months with no pay, no days off, and no written contract. His accommodation is a worksite compound controlled by the employer, making it difficult to leave. He is requesting legal aid for wage recovery and safe accommodation while his case is assessed.'
    },
    ctdcIndicators: [
      'Recruited through deceptive job offer',
      'Debt bondage — recruitment and transport fees withheld from wages',
      'Wages withheld or not paid as agreed (3 months)',
      'Tied housing — accommodation controlled by employer',
      'No written employment contract or legal work authorisation'
    ],
    riskFactors: [
      'Protection concerns flagged by community leader',
      'GBV referral pathway not activated',
      'No female caseworker available on site'
    ],
    follow_up_tasks: [
      { task: 'Connect with legal-aid partner for wage recovery and contract review', due: 'This week', priority: 'high', done: true },
      { task: 'Arrange safe transitional accommodation away from worksite', due: 'Within 48 h', priority: 'high', done: false },
      { task: 'Obtain written statement and document debt terms as evidence', due: 'Next session', priority: 'medium', done: false },
      { task: 'Psychosocial support referral — assess for depression and anxiety', due: 'This week', priority: 'medium', done: false }
    ]
  },
  {
    id: '#0037',
    ageRange: '18–24',
    sex: 'F',
    riskLevel: 'low',
    status: 'submitted',
    lastUpdated: '3 h ago',
    location: 'Bosso North Quarter, Diffa',
    notes:
      'Session de suivi. Hébergement temporaire sécurisé depuis la semaine dernière. Bonne communication avec la référente psychosociale. Explore les options de formation professionnelle en couture et en coiffure. Aucune nouvelle préoccupation de sécurité signalée.',
    structuredData: {
      detected_language: 'French (auto-detected)',
      case_type: 'Post-identification recovery — labour exploitation (prior)',
      age_range: '18–24',
      sex: 'F',
      recruitment_method: 'Previously recruited through fraudulent domestic work offer (documented in intake — case #0037, session 1)',
      control_method: 'Document withholding (resolved — documents recovered); isolation (resolved)',
      exploitation_type: 'Domestic servitude (prior; survivor no longer in exploitative situation)',
      risk_level: 'low',
      ctdc_indicators: [
        'Prior document withholding (resolved)',
        'Prior unpaid labour (resolved)'
      ],
      summary:
        'Survivor, 18–24, female, in stable recovery. Temporary safe housing secured last week through the IOM partner network. She is engaging positively with psychosocial support and has expressed interest in vocational training (tailoring or hairdressing). No new safety concerns. Focus this phase: livelihood pathway, documentation support, and ongoing psychosocial check-ins.'
    },
    ctdcIndicators: [
      'Prior document withholding (resolved)',
      'Prior unpaid labour (resolved)'
    ],
    riskFactors: [
      'Overcrowded host community site',
      'No documentation for 12 households'
    ],
    follow_up_tasks: [
      { task: 'Enrol in vocational training programme (tailoring or hairdressing)', due: 'Next 2 weeks', priority: 'medium', done: false },
      { task: 'Confirm national ID replacement application submitted', due: 'This week', priority: 'medium', done: true },
      { task: 'Schedule monthly psychosocial check-in', due: 'In 4 weeks', priority: 'low', done: false }
    ]
  },
  {
    id: '#0031',
    ageRange: '30–40',
    sex: 'M',
    riskLevel: 'medium',
    status: 'draft',
    lastUpdated: 'Yesterday',
    location: 'Baroua, Diffa',
    notes:
      'Intake commenced. Survivor presented with a community health worker. Preliminary account indicates labour exploitation at an agricultural site — wages withheld, excessive hours, and restricted movement on the compound. Full session pending interpreter (Arabic). Documents presented but authenticity under review.',
    structuredData: {
      detected_language: 'Arabic (interpreter pending)',
      case_type: 'Suspected trafficking — labour exploitation (intake incomplete)',
      age_range: '30–40',
      sex: 'M',
      recruitment_method: 'Unconfirmed pending full interpreted session',
      control_method: 'Restricted movement on worksite compound; documents held pending review',
      exploitation_type: 'Forced labour — agricultural (preliminary)',
      risk_level: 'medium',
      ctdc_indicators: [
        'Wages withheld (preliminary report)',
        'Restricted movement on worksite',
        'Documents of unclear status'
      ],
      summary:
        'Intake initiated but not yet complete. An Arabic interpreter is required for the full session. Preliminary account from a community health worker escort indicates labour exploitation at an agricultural worksite, including wage withholding and restricted compound access. Documents presented for verification. Risk assessed as medium pending full disclosure.'
    },
    ctdcIndicators: [
      'Wages withheld (preliminary report)',
      'Restricted movement on worksite',
      'Documents of unclear status'
    ],
    riskFactors: ['Pending intake documentation', 'No follow-up scheduled'],
    follow_up_tasks: [
      { task: 'Book Arabic interpreter and reschedule full intake session', due: 'Within 48 h', priority: 'high', done: false },
      { task: 'Verify document authenticity with national identification office', due: 'This week', priority: 'medium', done: false }
    ]
  },
  {
    id: '#0028',
    ageRange: '12–15',
    sex: 'F',
    riskLevel: 'high',
    status: 'submitted',
    lastUpdated: '2 days ago',
    notes:
      'Unaccompanied minor. No known guardian contact. Referred by border police after being found in a vehicle with four unrelated adults. Unable to account for travel arrangement. Visibly distressed; limited verbal response. Escalated to child-protection focal point. Awaiting emergency placement confirmation. Do not close without safeguarding sign-off from supervisor.',
    structuredData: {
      detected_language: 'Arabic (Chadian dialect, auto-detected)',
      case_type: 'Suspected trafficking — unaccompanied minor (urgent safeguarding)',
      age_range: '12–15',
      sex: 'F',
      recruitment_method: 'Unknown — unable to disclose at initial contact; adults in vehicle not confirmed as family',
      control_method: 'Unconfirmed; minor presents as highly distressed and non-verbal in initial contact',
      exploitation_type: 'To be determined — child-protection protocol active',
      risk_level: 'high',
      ctdc_indicators: [
        'Minor — unaccompanied, no verified guardian',
        'Found with unrelated adults unable to account for travel arrangement',
        'Visible psychological distress at contact',
        'Unable to disclose account of journey or origin'
      ],
      summary:
        'Unaccompanied minor, 12–15, female, referred by border police following interception in a vehicle with four unrelated adults. Unable to explain travel arrangement or disclose origin. Presenting with significant psychological distress and limited verbal response. Child-protection focal point has been notified and a supervisor alert is active. Emergency placement is pending confirmation. This case must not be closed without written safeguarding sign-off.'
    },
    ctdcIndicators: [
      'Minor — unaccompanied, no verified guardian',
      'Found with unrelated adults unable to account for travel arrangement',
      'Visible psychological distress at contact',
      'Unable to disclose account of journey or origin'
    ],
    follow_up_tasks: [
      { task: 'Confirm emergency placement with child-protection focal point', due: 'Overdue', priority: 'high', done: false },
      { task: 'Obtain supervisor safeguarding sign-off before any case closure', due: 'Required', priority: 'high', done: false },
      { task: 'Arrange trauma-informed child psychologist session', due: 'Within 48 h', priority: 'high', done: false },
      { task: 'Initiate search for guardian / family tracing via Red Cross', due: 'This week', priority: 'high', done: false }
    ]
  }
];

// Dashboard summary pills derived from the mock caseload. Records that have
// left the caseworker's hands are active; anything still being worked is
// pending (see the same buckets in DashboardScreen).
export const caseStats = {
  active: mockCases.filter((c) => c.status === 'synced' || c.status === 'submitted').length,
  urgent: mockCases.filter((c) => c.riskLevel === 'high').length,
  pending: mockCases.filter((c) => c.status === 'draft' || c.status === 'structured').length
};

// CTDC-style indicators shown in the risk badge on the Active Intake screen
// while a new intake is in progress (before structuring).
export const mockRiskIndicators = [
  'Recruited by deception (false promise of employment)',
  'Documents withheld by third party',
  'Debt bondage — recruitment or transport fees imposed',
  'Restricted freedom of movement'
];

// Placeholder structured fields returned by the mock "Translate & Structure"
// preview (shown before the Claude API call resolves in offline/slow conditions).
export const mockStructuredFields = [
  { label: 'Detected language', value: 'Hausa (auto-detected)' },
  { label: 'Case type', value: 'Suspected trafficking — domestic servitude (minor)' },
  { label: 'Survivor age range', value: '16–17' },
  { label: 'Location', value: "N'Djamena reception point" },
  { label: 'Presenting needs', value: 'Safe accommodation, legal aid, medical screening, child-protection referral' },
  { label: 'Immediate risk flags', value: 'Document retention, minor status, third-party control, missing companions' },
  { label: 'Suggested next step', value: 'Escalate to child-protection focal point immediately' }
];

// Next auto-generated case id, one past the highest mock id.
export function nextCaseId() {
  const max = mockCases.reduce((m, c) => Math.max(m, parseInt(c.id.replace('#', ''), 10) || 0), 0);
  return '#' + String(max + 1).padStart(4, '0');
}

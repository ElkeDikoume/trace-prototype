// v2-demo mock data for the mobile shell.
// NOTE: no real names or identifying survivor information — case IDs and coarse
// demographics only. structuredData mirrors the HTCDS-aligned JSON Claude
// produces; ctdc_indicators mirror real CTDC framework categories.

export const caseworkerName = 'Marie-Claire D.';
export const caseworkerFirstName = 'Marie-Claire';
export const caseworkerInitials = 'MC';

// riskLevel: 'high' | 'medium' | 'low'
// status:    'Active' | 'Urgent' | 'Pending' | 'In progress'
export const mockCases = [
  {
    // Falmata — the scripted demo-walkthrough protagonist (see TutorialOverlay).
    id: '#0043',
    ageRange: '16–17',
    sex: 'F',
    riskLevel: 'high',
    status: 'Urgent',
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
    status: 'Urgent',
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
    status: 'In progress',
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
    status: 'Active',
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
    status: 'Pending',
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
    status: 'Urgent',
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

// Archive of previously generated documents, shown on the Records tab. Stands
// alone from any open case — each entry keeps its own case reference and the
// text as it was generated.
export const mockDocuments = [
  {
    id: 'doc-0043-vca',
    docType: 'VCA Report',
    caseId: '#0043',
    generatedAt: 'Today · 09:14',
    content: `VULNERABILITY AND CAPACITY ASSESSMENT (VCA)
Case reference: #0043
Assessment date: today
Prepared by: TRACE (AI-generated — caseworker review required)

1. SITE AND POPULATION
Location assessed: Koura Village. Repeat flood-affected settlement, second event in 18 months.
Households without WASH access: 340.

2. VULNERABILITY FACTORS
- No early warning system in place.
- No evacuation route identified or communicated to residents.
- No shelter pre-positioning in the region.
- Village DRR committee not yet convened.

3. CAPACITIES
Community leadership is present and responsive. Prior flood response established informal
household-to-household alert practice that can be formalised.

4. RECOMMENDED ACTIONS
a. Convene the village DRR committee within 7 days.
b. Map and mark one primary and one secondary evacuation route.
c. Escalate WASH coverage gap to the sector lead.

End of report.`
  },
  {
    id: 'doc-0042-sitrep',
    docType: 'Situation Report',
    caseId: '#0042',
    generatedAt: 'Today · 08:02',
    content: `SITUATION REPORT
Case reference: #0042
Reporting period: last 24 hours
Prepared by: TRACE (AI-generated — caseworker review required)

OVERVIEW
Active displacement affecting 847 individuals at Toumour pastoral camp. Population arrived
over a 72-hour window and remains unregistered in part.

KEY CONCERNS
- Malnutrition risk: no MUAC screening completed to date.
- No WASH infrastructure on site.
- Security incident reported in the surrounding area; movement outside the camp discouraged.
- Three follow-up tasks overdue, including family tracing.

ACTIONS TAKEN
Child-protection focal point notified. Emergency shelter placement requested.

NEXT STEPS
Complete MUAC screening for all under-fives within 48 hours. Confirm WASH partner deployment.
Escalate the security incident to the area coordinator.

End of report.`
  },
  {
    id: 'doc-0039-referral',
    docType: 'Referral Letter',
    caseId: '#0039',
    generatedAt: 'Yesterday · 16:45',
    content: `REFERRAL LETTER
Case reference: #0039
Date: yesterday
Prepared by: TRACE (AI-generated — caseworker review required)

To: Protection Partner Agency, Garin Wanzam
Re: Referral for protection assessment and legal aid

Dear colleagues,

We are referring case #0039 for protection assessment and legal-aid support. The case concerns
an adult male reporting labour exploitation at an agricultural site, including three months of
withheld wages and an imposed transport debt of CFA 85,000.

Protection concerns have been flagged by a community leader. The GBV referral pathway has not
yet been activated and no female caseworker is available on site, which limits our capacity to
complete a full assessment locally.

Services requested: legal aid for wage recovery, protection assessment, and safe transitional
accommodation away from the worksite.

Caseworker sign-off: ______________________`
  },
  {
    id: 'doc-0037-risk',
    docType: 'Risk Assessment Report',
    caseId: '#0037',
    generatedAt: '2 days ago · 11:30',
    content: `RISK ASSESSMENT REPORT
Case reference: #0037
Date: 2 days ago
Prepared by: TRACE (AI-generated — caseworker review required)

1. CASE OVERVIEW
Survivor in post-identification recovery following prior labour exploitation. Temporary safe
housing secured through the partner network.

2. INDICATORS IDENTIFIED
- Prior document withholding (resolved — documents recovered).
- Prior unpaid labour (resolved).

3. RISK LEVEL: LOW
Justification: the survivor is no longer in the exploitative situation, housing is stable, and
engagement with psychosocial support is consistent. No new safety concerns reported.

4. RESIDUAL CONCERNS
Overcrowded host community site. No documentation for 12 households at the same site.

5. RECOMMENDED ACTIONS
Continue monthly psychosocial check-ins. Confirm national ID replacement. Proceed with the
vocational training pathway.

End of report.`
  },
  {
    id: 'doc-0031-summary',
    docType: 'Case Summary',
    caseId: '#0031',
    generatedAt: 'Last week · 14:20',
    content: `CASE SUMMARY
Case reference: #0031
Date: last week
Prepared by: TRACE (AI-generated — caseworker review required)

Case #0031 concerns an adult male, 30–40, who presented at the reception point accompanied by a
community health worker. Intake was commenced but is not complete — an Arabic interpreter is
required for the full session.

The preliminary account indicates labour exploitation at an agricultural worksite: wages
withheld, excessive hours, and restricted movement within the compound. Documents were presented
but their authenticity is under review. Risk is assessed as medium pending full disclosure.

Current status: intake documentation pending, no follow-up session yet scheduled. Recommended
next steps are to book the interpreter and reschedule the full intake within 48 hours, and to
verify the presented documents with the national identification office.

End of summary.`
  }
];

// Dashboard summary pills derived from the mock caseload.
export const caseStats = {
  active: mockCases.filter((c) => c.status === 'Active' || c.status === 'In progress').length,
  urgent: mockCases.filter((c) => c.riskLevel === 'high').length,
  pending: mockCases.filter((c) => c.status === 'Pending').length
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

// Deterministic, offline-capable risk flagging against 6 core CTDC/IOM trafficking
// indicators. Runs entirely client-side (no API call) so it works with zero
// connectivity, per TRACE's offline-first design.

export const RISK_INDICATORS = [
  {
    id: 'labor_recruitment_fraud',
    label: 'Labor recruitment fraud',
    weight: 1.5,
    fieldKeys: ['recruitmentMethod', 'recruiterRelationship'],
    keywords: ['fake job', 'false promise', 'promised', 'deceiv', 'lied', 'misled', 'fraudulent', 'not what was promised', 'different job', 'no contract']
  },
  {
    id: 'document_confiscation',
    label: 'Document confiscation',
    weight: 2,
    fieldKeys: ['documentsConfiscated'],
    valueMatch: { documentsConfiscated: 'Yes' },
    keywords: ['confiscat', 'took my passport', 'took her id', 'took his id', 'withheld document', 'papers taken']
  },
  {
    id: 'debt_bondage',
    label: 'Debt bondage',
    weight: 2,
    fieldKeys: ['debtOwed'],
    keywords: ['debt', 'owe', 'owed', 'repay', 'advance', 'recruitment fee', 'travel cost deducted']
  },
  {
    id: 'movement_restriction',
    label: 'Movement restriction',
    weight: 2,
    fieldKeys: ['movementRestricted'],
    valueMatch: { movementRestricted: 'Yes' },
    keywords: ['locked in', 'not allowed to leave', 'guarded', 'monitored constantly', 'could not leave', 'confined']
  },
  {
    id: 'physical_abuse',
    label: 'Physical abuse',
    weight: 3,
    fieldKeys: ['physicalAbuse'],
    valueMatch: { physicalAbuse: 'Yes' },
    keywords: ['beaten', 'hit', 'physical abuse', 'assault', 'injur', 'struck']
  },
  {
    id: 'sexual_exploitation',
    label: 'Sexual exploitation',
    weight: 3,
    fieldKeys: ['sexualAbuse', 'exploitationType', 'incidentType'],
    valueMatch: { sexualAbuse: 'Yes', exploitationType: 'Sexual exploitation' },
    keywords: ['sexual exploitation', 'sexual abuse', 'rape', 'forced sex', 'sexual violence']
  }
];

const FREE_TEXT_KEYS = [
  'caseworkerNotes', 'incidentDescription', 'protectionConcerns', 'monitorNotes',
  'reviewNotes', 'goalsProgress', 'clientWellbeing', 'journeyRoute', 'notes'
];

function textFrom(caseData, keys) {
  return keys
    .map((k) => caseData[k])
    .filter(Boolean)
    .join(' \n ')
    .toLowerCase();
}

// Plain-English rendering of an evidence item, used for the Claude grounding
// context (internal, not shown to the caseworker) — the UI renders and
// translates evidence itself via RiskFlag.jsx.
export function formatEvidenceEn(e) {
  return e.type === 'field' ? `Field "${e.field}" = "${e.value}"` : `Keyword match: "${e.keyword}"`;
}

export function analyzeRisk(caseData) {
  const allFreeText = textFrom(caseData, FREE_TEXT_KEYS);

  const matches = RISK_INDICATORS.map((indicator) => {
    const evidence = [];
    const seen = new Set();
    function pushUnique(item) {
      const key = JSON.stringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        evidence.push(item);
      }
    }

    if (indicator.valueMatch) {
      Object.entries(indicator.valueMatch).forEach(([key, expected]) => {
        if (caseData[key] && String(caseData[key]).toLowerCase() === String(expected).toLowerCase()) {
          pushUnique({ type: 'field', field: key, value: caseData[key] });
        }
      });
    }

    const fieldText = textFrom(caseData, indicator.fieldKeys);
    const searchSpace = `${fieldText} ${allFreeText}`;
    indicator.keywords.forEach((kw) => {
      if (searchSpace.includes(kw)) {
        pushUnique({ type: 'keyword', keyword: kw });
      }
    });

    return {
      id: indicator.id,
      label: indicator.label,
      weight: indicator.weight,
      matched: evidence.length > 0,
      evidence
    };
  });

  const matched = matches.filter((m) => m.matched);
  const score = matched.reduce((sum, m) => sum + m.weight, 0);

  let level = 'low';
  if (score >= 6) level = 'high';
  else if (score >= 2.5) level = 'medium';

  return {
    level,
    score,
    matched,
    allIndicators: matches
  };
}

// Fields that directly feed the indicator matching above. If they're empty,
// the risk read may be missing evidence rather than genuinely showing "no risk."
const INDICATOR_FIELD_HINTS = {
  recruitmentMethod: 'No information collected on how the survivor was recruited — this is a key indicator field for labor recruitment fraud.',
  documentsConfiscated: 'No information collected on document status — this is a key indicator field for document confiscation.',
  debtOwed: 'No information collected on debt or financial obligations — this is a key indicator field for debt bondage.',
  movementRestricted: 'No information collected on movement restriction — this is a key indicator field for assessing control over the survivor.',
  physicalAbuse: 'No information collected on physical abuse — this is a key indicator field.',
  sexualAbuse: 'No information collected on sexual abuse — this is a key indicator field for sexual exploitation.',
  exploitationType: 'Exploitation type has not been specified — this narrows which indicators can be matched at all.'
};

export function getMissingIndicatorFields(caseData, form) {
  if (!form || !caseData) return [];
  const formFieldKeys = new Set(form.fields.map((f) => f.key));

  return Object.entries(INDICATOR_FIELD_HINTS)
    .filter(([key]) => formFieldKeys.has(key))
    .filter(([key]) => {
      const value = caseData[key];
      return value === undefined || value === null || String(value).trim() === '';
    })
    .map(([key, reason]) => ({
      key,
      label: form.fields.find((f) => f.key === key)?.label || key,
      reason
    }));
}

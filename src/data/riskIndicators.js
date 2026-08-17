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

// Raw, case-preserving join. Used to pull the caseworker's own sentence back
// out once a match has been located in the lowercased copy.
function rawTextFrom(caseData, keys) {
  return keys
    .map((k) => caseData[k])
    .filter(Boolean)
    .join(' \n ');
}

function textFrom(caseData, keys) {
  return rawTextFrom(caseData, keys).toLowerCase();
}

// Turns a camelCase field key into something a caseworker can read.
// "documentsConfiscated" -> "Documents confiscated".
function humanizeFieldKey(key) {
  const spaced = String(key || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

const MAX_QUOTE_CHARS = 220;

// Given the position of a keyword hit, return the sentence around it from the
// ORIGINAL text.
//
// Why this exists: the matcher runs over a lowercased haystack using keyword
// stems ("confiscat", "owe"), so the naive thing to display is the stem itself.
// That is what this build used to do, and it produced evidence lines reading
// `Keyword match: "confiscat"` on a note that actually said "he took their
// identity papers on the first night". A stem is not evidence, and "confiscat"
// is not even a word. The caseworker's own sentence is the evidence. This finds
// it so the flag can cite the source instead of the pattern.
function sentenceAround(rawText, index, keywordLength) {
  if (!rawText || index < 0) return null;

  const isBoundary = (ch) => ch === '.' || ch === '!' || ch === '?' || ch === '\n';

  let start = index;
  while (start > 0 && !isBoundary(rawText[start - 1])) start--;

  let end = index + keywordLength;
  while (end < rawText.length && !isBoundary(rawText[end])) end++;
  if (end < rawText.length) end++; // keep the terminating punctuation

  let quote = rawText.slice(start, end).trim();
  if (!quote) return null;

  // A long run with no punctuation would swamp the flag list. Window it around
  // the match rather than truncating from the left edge and losing the hit.
  if (quote.length > MAX_QUOTE_CHARS) {
    const rel = index - start;
    const from = Math.max(0, rel - Math.floor(MAX_QUOTE_CHARS / 2));
    const to = Math.min(quote.length, from + MAX_QUOTE_CHARS);
    quote = `${from > 0 ? '…' : ''}${quote.slice(from, to).trim()}${to < quote.length ? '…' : ''}`;
  }

  return quote;
}

// Plain-English rendering of an evidence item, used for the Claude grounding
// context (internal, not shown to the caseworker), the UI renders and
// translates evidence itself via RiskFlag.jsx.
export function formatEvidenceEn(e) {
  if (e.type === 'field') return `${humanizeFieldKey(e.field)}: ${e.value}`;
  return e.quote ? `Caseworker's note: "${e.quote}"` : `Term matched: "${e.keyword}"`;
}

export function analyzeRisk(caseData) {
  const allFreeText = textFrom(caseData, FREE_TEXT_KEYS);
  const allFreeTextRaw = rawTextFrom(caseData, FREE_TEXT_KEYS);

  const matches = RISK_INDICATORS.map((indicator) => {
    const evidence = [];
    const seen = new Set();
    function pushUnique(item) {
      // Dedupe on what the caseworker will actually see, so two stems that
      // resolve to the same sentence ("owe" and "owed") produce one line, not
      // the same quote twice.
      const key = item.type === 'field'
        ? `field:${item.field}`
        : `quote:${item.quote || item.keyword}`;
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
    const fieldTextRaw = rawTextFrom(caseData, indicator.fieldKeys);
    const searchSpace = `${fieldText} ${allFreeText}`;
    // Same concatenation, original casing, so an index into searchSpace lands
    // on the same character in searchSpaceRaw.
    const searchSpaceRaw = `${fieldTextRaw} ${allFreeTextRaw}`;
    indicator.keywords.forEach((kw) => {
      const at = searchSpace.indexOf(kw);
      if (at !== -1) {
        pushUnique({ type: 'keyword', keyword: kw, quote: sentenceAround(searchSpaceRaw, at, kw.length) });
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
  recruitmentMethod: 'No information collected on how the survivor was recruited, this is a key indicator field for labor recruitment fraud.',
  documentsConfiscated: 'No information collected on document status, this is a key indicator field for document confiscation.',
  debtOwed: 'No information collected on debt or financial obligations, this is a key indicator field for debt bondage.',
  movementRestricted: 'No information collected on movement restriction, this is a key indicator field for assessing control over the survivor.',
  physicalAbuse: 'No information collected on physical abuse, this is a key indicator field.',
  sexualAbuse: 'No information collected on sexual abuse, this is a key indicator field for sexual exploitation.',
  exploitationType: 'Exploitation type has not been specified, this narrows which indicators can be matched at all.'
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

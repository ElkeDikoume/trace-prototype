// Real "Translate & Structure" for the v2 intake. Sends the caseworker's raw
// notes to Claude via the existing server proxy (POST /api/claude) and gets
// back structured HTCDS-aligned JSON. The chosen intake language is injected
// into the system prompt so Claude knows the source language to translate from.

const HTCDS_KEYS = [
  'case_type',
  'detected_language',
  'age_range',
  'sex',
  'nationality',
  'location',
  'exploitation_type',
  'presenting_needs',
  'risk_level',
  'ctdc_indicators',
  'summary',
  'suggested_next_step'
];

function buildSystemPrompt(sourceLanguage) {
  const languageLine =
    !sourceLanguage || sourceLanguage === 'Auto-detect'
      ? 'The caseworker\'s notes may be written in any language — detect the language and translate accordingly.'
      : `The caseworker's notes may be written in ${sourceLanguage}. Translate and structure accordingly.`;

  return `You are TRACE, an AI assistant that structures frontline anti-trafficking case notes into the IOM Human Trafficking Case Data Standards (HTCDS) format, aligned with CTDC (Counter-Trafficking Data Collaborative) indicators.

${languageLine}

Return ONLY a single valid JSON object (no prose, no markdown fences) with exactly these keys:
{
  "case_type": "short label, e.g. Suspected trafficking — labour",
  "detected_language": "the source language you detected/were told",
  "age_range": "e.g. 16-17, or empty string if unknown",
  "sex": "F, M, or empty string if unknown",
  "nationality": "or empty string",
  "location": "or empty string",
  "exploitation_type": "e.g. labour, domestic servitude, sexual, or empty string",
  "presenting_needs": "comma-separated needs, or empty string",
  "risk_level": "one of: high, medium, low",
  "ctdc_indicators": ["array of short CTDC indicator phrases actually supported by the notes"],
  "summary": "2-3 sentence English narrative summary preserving confidentiality (never invent a real name)",
  "suggested_next_step": "one concrete next action"
}

Rules:
- Translate all free-text values into English, but preserve place names and quoted statements.
- Only include information present or clearly implied in the notes. Do not invent details.
- Never output a real personal name; refer to the survivor generically.
- risk_level must be exactly high, medium, or low.`;
}

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response.');
  return JSON.parse(candidate.slice(start, end + 1));
}

// Returns the parsed HTCDS object. Throws on network / parse errors so the
// caller can decide (e.g. fall back to the offline queue).
export async function structureIntake({ notes, sourceLanguage }) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system: buildSystemPrompt(sourceLanguage),
      messages: [{ role: 'user', content: `Caseworker notes:\n${notes}` }],
      max_tokens: 1024
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Structuring request failed.');

  const parsed = extractJson(data.text || '');
  // Normalise: guarantee the keys exist and risk_level is valid.
  const out = {};
  HTCDS_KEYS.forEach((k) => {
    out[k] = parsed[k] ?? (k === 'ctdc_indicators' ? [] : '');
  });
  if (!['high', 'medium', 'low'].includes(out.risk_level)) out.risk_level = 'medium';
  if (!Array.isArray(out.ctdc_indicators)) out.ctdc_indicators = [];
  return out;
}

// HTCDS object -> [{label, value}] rows for the Structured preview modal.
export function structuredToFields(s) {
  const rows = [
    ['Detected language', s.detected_language],
    ['Case type', s.case_type],
    ['Age range', s.age_range],
    ['Sex', s.sex],
    ['Nationality', s.nationality],
    ['Location', s.location],
    ['Exploitation type', s.exploitation_type],
    ['Presenting needs', s.presenting_needs],
    ['Risk level', s.risk_level ? s.risk_level.toUpperCase() : ''],
    ['CTDC indicators', (s.ctdc_indicators || []).join('; ')],
    ['Summary', s.summary],
    ['Suggested next step', s.suggested_next_step]
  ];
  return rows.filter(([, v]) => v && String(v).trim() !== '').map(([label, value]) => ({ label, value }));
}

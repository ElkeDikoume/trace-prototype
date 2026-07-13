import { formatEvidenceEn } from '../data/riskIndicators.js';

async function callClaude({ system, messages, max_tokens }) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ system, messages, max_tokens })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Claude API request failed');
  }
  return data.text;
}

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response');
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Structures freeform caseworker notes (voice or typed, any of the 5 supported
 * languages) into the field schema of the selected form.
 */
export async function structureNotesIntoForm({ freeText, language, form }) {
  const fieldList = form.fields
    .map((f) => `- ${f.key} (${f.type}${f.options ? `, options: ${f.options.join(' | ')}` : ''}): ${f.label}`)
    .join('\n');

  const system = `You are an assistant helping humanitarian caseworkers structure freeform case notes into a standardized form used for anti-trafficking and protection casework, aligned with IOM Human Trafficking Case Data Standards (HTCDS).

The caseworker's notes may be in French, English, Arabic, Spanish, or Portuguese. Read them in whatever language they are in.

Extract information into this exact JSON schema (return ONLY valid JSON, no prose, no markdown fences):
{
${form.fields.map((f) => `  "${f.key}": "..."`).join(',\n')}
}

Field definitions:
${fieldList}

Rules:
- Only include information actually present or clearly implied in the notes. Do not invent details.
- For fields with fixed options, choose the closest matching option, or leave the value as an empty string "" if unclear.
- Translate extracted values into English for the form fields, but preserve names, places, and quotes as given.
- If a field has no information available, use an empty string "".
- Output must be a single JSON object with exactly the keys listed above, nothing else.`;

  const text = await callClaude({
    system,
    messages: [{ role: 'user', content: `Language of notes: ${language}\n\nCaseworker notes:\n${freeText}` }],
    max_tokens: 4096
  });

  return extractJson(text);
}

/**
 * Online-mode-only pipeline for local languages (Hausa, Fulfulde, Zarma) not
 * covered by the browser's Web Speech API / core structuring flow. Simulates
 * a SeamlessM4T-style interpreter: translate the note to French, then
 * structure the French translation into the active form's fields.
 */
export async function interpretAndStructureNotes({ freeText, languageLabel, form }) {
  const fieldList = form.fields
    .map((f) => `- ${f.key} (${f.type}${f.options ? `, options: ${f.options.join(' | ')}` : ''}): ${f.label}`)
    .join('\n');

  const system = `You are a real-time interpreter and caseworker assistant supporting anti-trafficking and protection casework in the Sahel region, standing in for a live Meta SeamlessM4T speech/text interpretation pipeline.

Step 1 — Interpretation: Translate the caseworker's field note from ${languageLabel} into French. Preserve names, places, and quoted statements exactly.

Step 2 — Structuring: Using your French translation, extract information into this exact JSON schema for the "${form.name}" form (return ONLY valid JSON, no prose, no markdown fences):
{
  "translation": "...",
  "fields": {
${form.fields.map((f) => `    "${f.key}": "..."`).join(',\n')}
  }
}

Field definitions:
${fieldList}

Rules:
- "translation" is the full French translation of the caseworker's note.
- For fields with fixed options (type: select), output one of the exact option strings listed — these are controlled values and stay in English, do not translate them.
- For free-text fields (type: text/textarea), write the value in French, translated from the source language.
- Only include information actually present or clearly implied in the note. Do not invent details.
- If a field has no information available, use an empty string "".
- Output must be a single JSON object with exactly the "translation" and "fields" keys, nothing else.`;

  const text = await callClaude({
    system,
    messages: [{ role: 'user', content: `Source language: ${languageLabel}\n\nCaseworker field note:\n${freeText}` }],
    max_tokens: 4096
  });

  return extractJson(text);
}

/**
 * Standalone online-mode interpretation demo: translates a local-language
 * field note into English, simulating a live Meta SeamlessM4T pass. Unlike
 * interpretAndStructureNotes(), this does not structure into a form — it's
 * the showcase panel for the interpretation capability itself.
 */
export async function interpretToEnglish({ freeText, languageLabel }) {
  const system = `You are a real-time interpreter standing in for a live Meta SeamlessM4T speech/text interpretation pipeline used in TRACE, a case management tool for anti-trafficking and protection caseworkers in the Sahel region.

Translate the caseworker's field note from ${languageLabel} into English. Preserve names, places, and quoted statements exactly.

Output format: wrap ONLY the translated English text in <translation></translation> tags, with nothing else inside or outside the tags — no preamble, no commentary, no explanation of the task.`;

  const text = await callClaude({
    system,
    messages: [{ role: 'user', content: freeText }],
    max_tokens: 512
  });

  const match = text.match(/<translation>([\s\S]*?)<\/translation>/i);
  return (match ? match[1] : text).trim();
}

// Appended to every document-generation system prompt (not the chatbot or
// structuring calls) so Claude's own output is unmistakably marked as demo
// content, on top of the client-side watermark added around downloads.
const DOCUMENT_WATERMARK_INSTRUCTION = `IMPORTANT: Begin every generated document with the following header on its own line:
⚠️ DEMO PROTOTYPE — NOT REAL CASE DATA — Austin AI Hub Hackathon 2026 ⚠️
And end every document with:
--- END OF DEMO DOCUMENT — TRACE Hackathon Prototype — trace-prototype-ten.vercel.app ---`;

function fieldSummary(form, caseData) {
  return form.fields.map((f) => `${f.label}: ${caseData?.[f.key] || '(not recorded)'}`).join('\n');
}

function riskSummaryText(riskResult) {
  return riskResult
    ? `Risk level: ${riskResult.level.toUpperCase()} (score ${riskResult.score}). Matched indicators: ${
        riskResult.matched.length ? riskResult.matched.map((m) => m.label).join(', ') : 'none'
      }`
    : 'Risk assessment not applicable to this form type.';
}

/**
 * Documents tab — AI draft generators. Each produces plain text (no markdown
 * fences/headers) that renders directly into an editable textarea (or, for
 * the missing-info report, a read-only list) so the caseworker can revise
 * before downloading.
 */
export async function generateReferralLetter({ caseData, form, riskResult, services }) {
  const serviceSummary = (services || []).map((s) => `- ${s.name} (${s.org}, ${s.country})`).join('\n') || 'No matched services yet.';

  const system = `You are TRACE, an AI assistant helping frontline anti-trafficking and protection caseworkers draft field documents. Draft a short, formally structured referral letter from the caseworker to a receiving service provider, based on the case data below.

Include: a date placeholder, a recipient agency placeholder (use the most relevant candidate service below if one fits), a brief case summary that preserves confidentiality (use the survivor's identifier/pseudonym only — never invent a real name), the reason for referral, requested services, and a caseworker sign-off placeholder. Do not invent details not present in the case data.

Output plain text only, ready to paste into a letter template — no markdown headers, no commentary.

Case data:
${fieldSummary(form, caseData)}

Risk assessment:
${riskSummaryText(riskResult)}

Candidate services:
${serviceSummary}

${DOCUMENT_WATERMARK_INSTRUCTION}`;

  return callClaude({ system, messages: [{ role: 'user', content: 'Draft the referral letter.' }], max_tokens: 1024 });
}

export async function generateCaseSummary({ caseData, form, riskResult }) {
  const system = `You are TRACE, an AI assistant helping frontline anti-trafficking and protection caseworkers draft field documents. Write a 3-paragraph narrative case summary suitable for supervision review, case handoff, or file notes, based on the case data below.

Paragraph 1: who the survivor is and how the case came to attention. Paragraph 2: the trafficking/protection concern and risk assessment. Paragraph 3: current status and recommended next steps. Do not invent details not present in the case data.

Output plain text only — no markdown headers, no commentary.

Case data:
${fieldSummary(form, caseData)}

Risk assessment:
${riskSummaryText(riskResult)}

${DOCUMENT_WATERMARK_INSTRUCTION}`;

  return callClaude({ system, messages: [{ role: 'user', content: 'Write the case summary.' }], max_tokens: 1024 });
}

export async function generateIomMonthlyReturnEntry({ caseData, form }) {
  const system = `You are TRACE, an AI assistant helping frontline anti-trafficking and protection caseworkers draft field documents. Format the case data below as a single entry for an IOM Counter-Trafficking monthly caseload return.

Use these standard IOM monthly return fields, one per line, as a clean labeled list: Case reference, Reporting month/year (use a placeholder), Country/location, Age, Gender, Nationality, Type of exploitation, Referral pathway, Case status. Write "Not recorded" for any field with no data in the case. Do not invent data not present in the case.

Output plain text only — no markdown headers, no commentary.

Case data:
${fieldSummary(form, caseData)}

${DOCUMENT_WATERMARK_INSTRUCTION}`;

  return callClaude({ system, messages: [{ role: 'user', content: 'Format the monthly return entry.' }], max_tokens: 768 });
}

export async function generateMissingInfoReport({ caseData, form, riskResult }) {
  const system = `You are TRACE, an AI assistant helping frontline anti-trafficking and protection caseworkers assess case completeness. Identify which fields in the case data below are empty, "Unknown", or unclear, focusing specifically on fields that are CTDC (Counter-Trafficking Data Collaborative) risk indicator fields — for example documents confiscated, debt/economic coercion, movement restriction, physical abuse, sexual abuse, recruitment method, and type of exploitation.

For each missing or unclear field, name the field and explain in one sentence why documenting it would matter for a complete CTDC risk assessment. If every relevant field is already documented, say so plainly.

Output as a plain-text list, one item per line prefixed with "- ", no markdown headers, no other commentary.

Case data:
${fieldSummary(form, caseData)}

Risk assessment:
${riskSummaryText(riskResult)}

${DOCUMENT_WATERMARK_INSTRUCTION}`;

  return callClaude({ system, messages: [{ role: 'user', content: 'Identify the missing information.' }], max_tokens: 1024 });
}

export async function generateFollowUpPlan({ caseData, form, riskResult }) {
  const system = `You are TRACE, an AI assistant helping frontline anti-trafficking and protection caseworkers plan next steps. Recommend concrete next steps for the next 7-14 days, based on the case's current risk level and data below.

Structure the plan as a short numbered list (3-6 items), each item actionable and specific to this case (e.g. which service to follow up with, what to re-assess, who to check in with). Do not invent details not present in the case data.

Output plain text only — no markdown headers, no commentary.

Case data:
${fieldSummary(form, caseData)}

Risk assessment:
${riskSummaryText(riskResult)}

${DOCUMENT_WATERMARK_INSTRUCTION}`;

  return callClaude({ system, messages: [{ role: 'user', content: 'Draft the follow-up plan.' }], max_tokens: 768 });
}

/**
 * Chatbot: answers caseworker questions grounded in IOM HTCDS protocol and the
 * current case's structured data, risk flag, and service directory.
 */
export async function askCaseChatbot({ question, form, caseData, riskResult, services, history, ctdcMatches, dtmContext, acledEvents, patternAlerts, aiLanguage }) {
  const caseSummary = form
    ? form.fields.map((f) => `${f.label}: ${caseData?.[f.key] || '(not recorded)'}`).join('\n')
    : 'No case loaded yet.';

  const riskSummary = riskResult
    ? `Risk level: ${riskResult.level.toUpperCase()} (score ${riskResult.score}). Matched indicators: ${
        riskResult.matched.length
          ? riskResult.matched.map((m) => `${m.label} [${m.evidence.map(formatEvidenceEn).join('; ')}]`).join(' | ')
          : 'none'
      }`
    : 'Risk assessment not applicable to this form type or not yet run.';

  const serviceSummary = (services || [])
    .map((s) => `- ${s.name} (${s.org}, ${s.country}): ${s.description} Contact: ${s.contact}`)
    .join('\n');

  const ctdcSummary = (ctdcMatches || []).length
    ? ctdcMatches.map((r) => `- [${r.indicator}, ${r.sector}, ${r.region}] ${r.pattern} (${r.prevalence})`).join('\n')
    : 'No matched CTDC pattern records for this case yet.';

  const dtmSummary = dtmContext
    ? `${dtmContext.location}, ${dtmContext.country}: ${dtmContext.displacedPopulation.toLocaleString()} displaced, vulnerability score ${dtmContext.vulnerabilityScore}/100 (${dtmContext.trend}). Primary origin: ${dtmContext.primaryOrigin}. ${dtmContext.note} (DTM update ${dtmContext.lastUpdated})`
    : 'No IOM DTM displacement data matched to this case location.';

  const acledSummary = (acledEvents || []).length
    ? acledEvents.map((e) => `- ${e.date} ${e.eventType} — ${e.location}, ${e.country} (${e.actor}, ${e.fatalities} fatalities): ${e.note}`).join('\n')
    : 'No recent ACLED conflict events matched to this case location.';

  const patternSummary = (patternAlerts || []).length
    ? patternAlerts.map((p) => `- [${p.severity.toUpperCase()}] ${p.title} (${p.region}, ${p.casesCited} cases, detected ${p.detectedDate}): ${p.description}`).join('\n')
    : 'No organization-wide pattern alerts currently active.';

  const languageInstruction = aiLanguage && aiLanguage !== 'English'
    ? `Respond in ${aiLanguage}. All outputs must be in ${aiLanguage}, including referral letters and lists — regardless of the language of the case data or grounding context below (which may be in English).\n\n`
    : '';

  const system = `${languageInstruction}You are TRACE, an AI assistant embedded in a case management tool for frontline anti-trafficking and protection caseworkers (IOM/UNHCR/NGO partners) in West and Central Africa, including the Lake Chad Basin.

Ground every answer in IOM Human Trafficking Case Data Standards (HTCDS) protocol and in the specific case data and contextual data sources provided below. Be concise, practical, and field-appropriate. If asked to generate a referral letter, produce a short, formally structured letter (date placeholder, recipient agency, case summary, reason for referral, requested services, caseworker sign-off placeholder). If asked why a case was flagged at a given risk level, explain using the matched indicators and evidence listed below — do not invent indicators that are not listed. When you use the CTDC, IOM DTM, ACLED, or pattern-intelligence context below, name the source explicitly (e.g. "per IOM DTM data..." or "CTDC-documented pattern..."), and note that in this prototype these are simulated/demo datasets standing in for the live integrations. If you don't have enough information, say so and suggest what the caseworker should document next.

Current form type: ${form ? form.name : 'None selected'}

Current case data:
${caseSummary}

Risk assessment:
${riskSummary}

Available services (IOM/UNHCR West Africa directory):
${serviceSummary}

CTDC (Counter-Trafficking Data Collaborative) matched indicator patterns — simulated dataset:
${ctdcSummary}

IOM DTM (Displacement Tracking Matrix) context for this case's location — simulated dataset:
${dtmSummary}

ACLED (Armed Conflict Location & Event Data) — recent nearby conflict events, simulated dataset:
${acledSummary}

Pattern intelligence across the organization's caseload — simulated cross-case analysis:
${patternSummary}`;

  const messages = [
    ...(history || []).map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: question }
  ];

  return callClaude({ system, messages, max_tokens: 2048 });
}

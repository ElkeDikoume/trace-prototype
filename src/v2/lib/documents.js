// Streaming document generation for the Documents tab. Reuses the SSE proxy
// (POST /api/claude/stream via streamCaseChat) with per-document system prompts
// built from the case's structured data. Output is plain text meant to render
// in a monospace preview.
import { streamCaseChat } from './claudeStream.js';

export const DOC_TYPES = [
  { id: 'referral', label: 'Referral Letter' },
  { id: 'summary', label: 'Case Summary' },
  { id: 'htcds', label: 'IOM HTCDS Form' }
];

export const docLabel = (id) => DOC_TYPES.find((d) => d.id === id)?.label || id;

function caseContextBlock(caseData) {
  const s = caseData?.structuredData || {};
  return `Case ID: ${caseData?.id || caseData?.caseNumber || 'unknown'}
Risk level: ${(caseData?.riskLevel || s.risk_level || 'unknown').toUpperCase()}
Structured data:
${JSON.stringify(s, null, 2)}
Raw notes:
${caseData?.notes || '(none)'}`;
}

const BASE_RULES = `Rules: use the case ID only, never a real personal name. Do not invent facts not present in the case data. Output plain text only (no markdown headers, no code fences), suitable for a monospace document view.`;

function systemFor(docType, caseData) {
  const ctx = caseContextBlock(caseData);
  if (docType === 'referral') {
    return `You are TRACE, drafting a formal service referral letter for a frontline anti-trafficking caseworker. Produce a short, formally structured referral letter: date placeholder, recipient agency placeholder, a confidential case summary, the reason for referral, requested services, and a caseworker sign-off placeholder. ${BASE_RULES}\n\n${ctx}`;
  }
  if (docType === 'summary') {
    return `You are TRACE, writing a narrative case summary for supervision review / case handoff. Three short paragraphs: (1) who the survivor is and how the case came to attention, (2) the trafficking/protection concern and risk assessment, (3) current status and recommended next steps. ${BASE_RULES}\n\n${ctx}`;
  }
  // htcds
  return `You are TRACE, formatting this case as an IOM Human Trafficking Case Data Standards (HTCDS) intake form. Output a clean labelled field list, one field per line (Case reference, Date, Age, Sex, Nationality, Location, Recruitment method, Control method, Type of exploitation, Risk level, CTDC indicators, Presenting needs, Case status). Write "Not recorded" for any field without data. ${BASE_RULES}\n\n${ctx}`;
}

export function streamDocument({ docType, caseData, onToken, signal }) {
  return streamCaseChat({
    system: systemFor(docType, caseData),
    history: [],
    question: 'Generate the document now.',
    max_tokens: 1500,
    onToken,
    signal
  });
}

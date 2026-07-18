// Streaming document generation for the Documents tab. Reuses the SSE proxy
// (POST /api/claude/stream via streamCaseChat) with per-document system prompts
// built from the case's structured data. Output is plain text meant to render
// in a monospace preview.
import { streamCaseChat } from './claudeStream.js';

export const DOC_TYPES = [
  { id: 'referral', label: 'Referral Letter' },
  { id: 'summary', label: 'Case Summary' },
  { id: 'htcds', label: 'IOM HTCDS Form' },
  { id: 'risk_assessment', label: 'Risk Assessment Report' },
  { id: 'family_tracing', label: 'Family Tracing Request' },
  { id: 'reintegration', label: 'Reintegration Plan' },
  { id: 'service_finder', label: 'Find a Service', isMeta: true }
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

function serviceBlock(service) {
  if (!service) return '';
  return `\nTarget referral agency:
Name: ${service.name}
Type: ${service.type}${service.secondaryType ? ' / ' + service.secondaryType : ''}
Location: ${service.location}
Address: ${service.address || 'N/A'}
Phone: ${service.contact || 'N/A'}
Email: ${service.email || 'N/A'}
Description: ${service.description}`;
}

function systemFor(docType, caseData, targetService) {
  const ctx = caseContextBlock(caseData);
  if (docType === 'referral') {
    const svc = serviceBlock(targetService);
    const recipientNote = targetService
      ? `Address the letter to ${targetService.shortName} (${targetService.type}) at ${targetService.location}.`
      : 'Use a placeholder for the recipient agency.';
    return `You are TRACE, drafting a formal service referral letter for a frontline anti-trafficking caseworker. ${recipientNote} Produce a short, formally structured referral letter: today's date, recipient agency name and address, a confidential case summary, the reason for referral, specific services requested, and a caseworker sign-off placeholder. ${BASE_RULES}\n\n${ctx}${svc}`;
  }
  if (docType === 'summary') {
    return `You are TRACE, writing a narrative case summary for supervision review / case handoff. Three short paragraphs: (1) who the survivor is and how the case came to attention, (2) the trafficking/protection concern and risk assessment, (3) current status and recommended next steps. ${BASE_RULES}\n\n${ctx}`;
  }
  if (docType === 'risk_assessment') {
    return `You are TRACE, drafting a formal risk assessment report for supervisor review. Structure: (1) Case overview and referral pathway, (2) CTDC trafficking indicators identified with supporting evidence from notes, (3) Risk level justification — HIGH/MEDIUM/LOW — with reasoning, (4) Immediate protection concerns, (5) Recommended actions ranked by urgency. Be specific and evidence-based. ${BASE_RULES}\n\n${ctx}`;
  }
  if (docType === 'family_tracing') {
    return `You are TRACE, drafting an ICRC-format Family Tracing Request for an unaccompanied or separated individual. Structure: Case reference, Date, Requestor organisation (placeholder), Subject demographics (age range, sex only — no name), Last known location, Circumstances of separation, Known family details (use 'not disclosed' if absent), Urgency level, Contact for response. Use only case ID. Output as a clean labeled field list. ${BASE_RULES}\n\n${ctx}`;
  }
  if (docType === 'reintegration') {
    return `You are TRACE, writing a Reintegration Plan for a survivor moving into the recovery phase. Structure: (1) Current situation and stability assessment, (2) Identified strengths and protective factors, (3) Short-term goals (next 30 days) — housing, medical, psychosocial, (4) Medium-term goals (3 months) — livelihood, documentation, social support, (5) Referrals to activate, (6) Review date placeholder. Tone: strengths-based, survivor-centred. ${BASE_RULES}\n\n${ctx}`;
  }
  // htcds
  return `You are TRACE, formatting this case as an IOM Human Trafficking Case Data Standards (HTCDS) intake form. Output a clean labelled field list, one field per line (Case reference, Date, Age, Sex, Nationality, Location, Recruitment method, Control method, Type of exploitation, Risk level, CTDC indicators, Presenting needs, Case status). Write "Not recorded" for any field without data. ${BASE_RULES}\n\n${ctx}`;
}

export function streamDocument({ docType, caseData, targetService, onToken, signal }) {
  return streamCaseChat({
    system: systemFor(docType, caseData, targetService),
    history: [],
    question: 'Generate the document now.',
    max_tokens: 1500,
    onToken,
    signal
  });
}

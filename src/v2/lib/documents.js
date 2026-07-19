// Streaming document generation for the Documents tab. Reuses the SSE proxy
// (POST /api/claude-stream via streamCaseChat) with per-document system prompts
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
  { id: 'safe_exit', label: 'Safe Exit Plan' },
  { id: 'safe_card', label: 'Safe Info Card', isAudio: true },
  { id: 'handoff', label: 'Case Handoff Brief', supervisorOnly: true },
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

function systemFor(docType, caseData, targetService, outputLang = 'EN') {
  const ctx = caseContextBlock(caseData);
  const langInstruction =
    outputLang === 'FR'
      ? '\n\nIMPORTANT: Write the entire document in French. Translate all field labels, headings, prose, and placeholders into French. French is the official working language in Chad and the primary language of partner organisations.'
      : '';
  if (docType === 'safe_exit') {
    // Always French — a survivor-facing plan the caseworker delivers.
    return `You are TRACE, drafting a Safe Exit Plan for a caseworker to share with a survivor. This document will be read aloud or delivered in person by a trained caseworker — it is NOT shown directly to the survivor on screen. Write in plain, warm, simple language. Use French (this region's working language). Structure: (1) Immediate safety — what the survivor should do and not do in the next 24 hours, (2) Their rights under Chadian law — right to protection, right to medical care, right to refuse return to a dangerous situation — in plain terms, (3) What the organisation will do next — next contact, next appointment, what to expect, (4) Who to call if they feel unsafe — IOM Chad +235 63 52 24 76, Police des Mineurs +235 22 52 46 57, (5) One encouraging closing sentence. Use case ID only. No medical diagnoses. No legal conclusions. Caseworker reviews before delivery. Under 200 words. ${BASE_RULES}\n\n${ctx}`;
  }
  if (docType === 'safe_card') {
    // Always French — a spoken card the survivor receives; no langInstruction.
    return `You are TRACE, generating a Safe Information Card for a survivor to receive (read aloud by a caseworker or played by the device). Write in simple, spoken French — no complex words, no jargon, short sentences. Structure: (1) Opening reassurance: "You are safe. You have the right to help." (2) What happens next — 2 sentences on next steps in plain language. (3) Emergency contacts — list IOM Chad (+235 63 52 24 76), Police des Mineurs Chad (+235 22 52 46 57), UNHCR Chad (+235 22 52 47 57). (4) Closing: "You are not alone." Output only the spoken text — no headers, no bullet points. Keep it under 120 words total so it can be spoken in under 60 seconds. ${BASE_RULES}\n\n${ctx}`;
  }
  if (docType === 'referral') {
    const svc = serviceBlock(targetService);
    const recipientNote = targetService
      ? `Address the letter to ${targetService.shortName} (${targetService.type}) at ${targetService.location}.`
      : 'Use a placeholder for the recipient agency.';
    return `You are TRACE, drafting a formal service referral letter for a frontline anti-trafficking caseworker. ${recipientNote} Produce a short, formally structured referral letter: today's date, recipient agency name and address, a confidential case summary, the reason for referral, specific services requested, and a caseworker sign-off placeholder. ${BASE_RULES}\n\n${ctx}${svc}${langInstruction}`;
  }
  if (docType === 'summary') {
    return `You are TRACE, writing a narrative case summary for supervision review / case handoff. Three short paragraphs: (1) who the survivor is and how the case came to attention, (2) the trafficking/protection concern and risk assessment, (3) current status and recommended next steps. ${BASE_RULES}\n\n${ctx}${langInstruction}`;
  }
  if (docType === 'risk_assessment') {
    return `You are TRACE, drafting a formal risk assessment report for supervisor review. Structure: (1) Case overview and referral pathway, (2) CTDC trafficking indicators identified with supporting evidence from notes, (3) Risk level justification — HIGH/MEDIUM/LOW — with reasoning, (4) Immediate protection concerns, (5) Recommended actions ranked by urgency. Be specific and evidence-based. ${BASE_RULES}\n\n${ctx}${langInstruction}`;
  }
  if (docType === 'family_tracing') {
    return `You are TRACE, drafting an ICRC-format Family Tracing Request for an unaccompanied or separated individual. Structure: Case reference, Date, Requestor organisation (placeholder), Subject demographics (age range, sex only — no name), Last known location, Circumstances of separation, Known family details (use 'not disclosed' if absent), Urgency level, Contact for response. Use only case ID. Output as a clean labeled field list. ${BASE_RULES}\n\n${ctx}${langInstruction}`;
  }
  if (docType === 'reintegration') {
    return `You are TRACE, writing a Reintegration Plan for a survivor moving into the recovery phase. Structure: (1) Current situation and stability assessment, (2) Identified strengths and protective factors, (3) Short-term goals (next 30 days) — housing, medical, psychosocial, (4) Medium-term goals (3 months) — livelihood, documentation, social support, (5) Referrals to activate, (6) Review date placeholder. Tone: strengths-based, survivor-centred. ${BASE_RULES}\n\n${ctx}${langInstruction}`;
  }
  if (docType === 'handoff') {
    return `You are TRACE, generating a structured case handoff brief for an incoming caseworker. This document transfers case knowledge between caseworkers within the same organisation. Use case ID only — no survivor name, no identifying physical description, no home location. Structure: (1) Case reference and handoff date, (2) Risk level and justification in 2 sentences, (3) CTDC indicators confirmed, (4) Current status and last action taken, (5) Open follow-up tasks — list each with priority, (6) Pending referrals — what has been initiated and what response is awaited, (7) Recommended immediate next actions for the incoming caseworker, (8) Notes on survivor communication preferences or sensitivities (without identifying detail). Tone: factual, structured, caseworker-to-caseworker. ${BASE_RULES}\n\n${ctx}${langInstruction}`;
  }
  // htcds
  return `You are TRACE, formatting this case as an IOM Human Trafficking Case Data Standards (HTCDS) intake form. Output a clean labelled field list, one field per line (Case reference, Date, Age, Sex, Nationality, Location, Recruitment method, Control method, Type of exploitation, Risk level, CTDC indicators, Presenting needs, Case status). Write "Not recorded" for any field without data. ${BASE_RULES}\n\n${ctx}${langInstruction}`;
}

export function streamDocument({ docType, caseData, targetService, outputLang = 'EN', onToken, signal }) {
  return streamCaseChat({
    system: systemFor(docType, caseData, targetService, outputLang),
    history: [],
    question: 'Generate the document now.',
    max_tokens: 1500,
    onToken,
    signal
  });
}

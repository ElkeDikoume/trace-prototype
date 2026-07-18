// Client half of the v2 "Ask TRACE AI" tab. Builds a case-grounded system
// prompt and streams the real Claude response token-by-token from the server
// proxy (POST /api/claude/stream, same key-stays-server-side pattern as v1).

// Turns the current case (record + mock structured fields + risk indicators)
// into a grounding block injected into every request, so the assistant always
// answers about the case in context rather than in the abstract.
// The case-grounding block on its own, so a caller can append it under a custom
// system prompt (e.g. the Ask AI consultation prompt).
export function buildCaseContextBlock(ctx) {
  const c = ctx?.caseRecord || {};
  const structured = (ctx?.structuredFields || [])
    .map((f) => `- ${f.label}: ${f.value}`)
    .join('\n') || '(not yet structured)';
  const indicators = (ctx?.riskIndicators || []).map((i) => `- ${i}`).join('\n') || '(none recorded)';
  const notes = (c.notes || '').trim() || '(no free-text notes yet)';

  const demographics = [
    c.ageRange ? `age range ${c.ageRange}` : null,
    c.sex === 'F' ? 'female' : c.sex === 'M' ? 'male' : c.sex ? String(c.sex) : null
  ]
    .filter(Boolean)
    .join(', ') || 'not recorded';

  return `CURRENT CASE IN CONTEXT
Case ID: ${c.id || 'new intake'}
Demographics: ${demographics}
Status: ${c.status || 'in progress'}
Assessed risk level: ${(c.riskLevel || 'unassessed').toUpperCase()}

Structured case data:
${structured}

CTDC risk indicators flagged:
${indicators}

Caseworker free-text notes:
${notes}`;
}

export function buildCaseSystemPrompt(ctx) {
  return `You are TRACE, an AI assistant embedded in a mobile case-management tool for frontline anti-trafficking and protection caseworkers (IOM / UNHCR / NGO partners) in West and Central Africa, including the Lake Chad Basin.

Ground every answer in IOM Human Trafficking Case Data Standards (HTCDS) and CTDC (Counter-Trafficking Data Collaborative) indicator framing, and in the specific case data below. Be concise, practical and field-appropriate — short paragraphs or tight bullet lists a caseworker can act on. Never invent indicators, services or facts that are not supported by the case data; if information is missing, say so and name what to document next. When asked to draft a referral letter, produce a short, formally structured letter (date placeholder, recipient agency, confidential case summary using the case ID only, reason for referral, requested services, caseworker sign-off placeholder).

Important: this is a demo prototype. The structured data and indicators below are illustrative mock data, and survivors never interact with TRACE directly — all output is reviewed by a trained caseworker. Never output a real personal name; refer to the survivor by case ID only.

${buildCaseContextBlock(ctx)}`;
}

// Streams a chat completion. `history` is the prior thread ([{role, content}]),
// `question` the new user turn. onToken(chunk) fires for each text delta.
// Returns the full assistant text. Throws on transport / API errors.
export async function streamCaseChat({ system, history = [], question, max_tokens = 1024, onToken, signal }) {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question }
  ];

  const res = await fetch('/api/claude/stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ system, messages, max_tokens }),
    signal
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'TRACE AI request failed.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    // SSE events are separated by a blank line.
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const dataLine = rawEvent.split('\n').find((l) => l.startsWith('data:'));
      if (!dataLine) continue;
      const payload = dataLine.slice(5).trim();
      if (payload === '[DONE]') return full;

      let obj;
      try {
        obj = JSON.parse(payload);
      } catch {
        continue;
      }
      if (obj.error) throw new Error(obj.error);
      if (obj.text) {
        full += obj.text;
        onToken?.(obj.text);
      }
    }
  }

  return full;
}

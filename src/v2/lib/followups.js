// Generates a follow-up task list for a case via Claude (POST /api/claude).
// Returns [{ task, due, priority, done }]. Falls back to a small sensible
// default list if the call fails, so a save never blocks on the network.

function extractJsonArray(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('[');
  const end = candidate.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array found.');
  return JSON.parse(candidate.slice(start, end + 1));
}

const DEFAULT_TASKS = [
  { task: 'Confirm the survivor is in a safe location', due: 'within 24 hours', priority: 'high' },
  { task: 'Complete any missing HTCDS fields', due: 'within 48 hours', priority: 'medium' },
  { task: 'Follow up on the primary service referral', due: 'within 1 week', priority: 'medium' }
];

export async function generateFollowUpTasks({ caseData }) {
  const system = `You are TRACE, an assistant to frontline anti-trafficking caseworkers. Based on this case's structured data and risk level, generate 3-5 specific, actionable follow-up tasks with suggested relative due dates.

Return ONLY a JSON array (no prose, no markdown fences) of objects:
[{"task": "...", "due": "within 48 hours", "priority": "high|medium|low"}]

Rules:
- Due dates are relative (e.g. "within 24 hours", "within 48 hours", "within 1 week", "within 2 weeks").
- Higher-risk cases get more urgent, safety-first tasks.
- Tasks must be specific to this case, not generic filler.

Case structured data:
${JSON.stringify(caseData?.structuredData || {}, null, 2)}

Risk level: ${(caseData?.riskLevel || 'medium').toUpperCase()}`;

  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system,
        messages: [{ role: 'user', content: 'Generate the follow-up task list.' }],
        max_tokens: 700
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'request failed');
    const arr = extractJsonArray(data.text || '');
    const tasks = arr
      .filter((t) => t && t.task)
      .slice(0, 5)
      .map((t) => ({
        task: String(t.task),
        due: String(t.due || 'within 1 week'),
        priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
        done: false
      }));
    return tasks.length ? tasks : DEFAULT_TASKS.map((t) => ({ ...t, done: false }));
  } catch {
    return DEFAULT_TASKS.map((t) => ({ ...t, done: false }));
  }
}

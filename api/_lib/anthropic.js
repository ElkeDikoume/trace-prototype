// Single source of truth for calling the Anthropic Messages API. Used by
// both the local Express dev server (server/index.js, key from API_KEY.txt)
// and the Vercel serverless function (api/claude.js, key from
// process.env.ANTHROPIC_API_KEY) so the two entry points can't drift apart.

const MODEL = 'claude-sonnet-5';

export async function callClaude({ apiKey, system, messages, max_tokens }) {
  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: max_tokens || 1024,
      system: system || undefined,
      messages
    })
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    const error = new Error(data?.error?.message || 'Anthropic API error');
    error.status = upstream.status;
    error.data = data;
    throw error;
  }

  const text = (data.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  return { text, raw: data };
}

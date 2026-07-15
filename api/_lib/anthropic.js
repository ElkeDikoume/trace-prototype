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

// Streaming sibling of callClaude: opens a streamed Messages request and calls
// onText(chunk) for each text delta as it arrives. Reads the upstream SSE with
// a byte reader + TextDecoder so it works unchanged in Node (undici fetch) and
// in the browser. Resolves with the full concatenated text once complete.
export async function streamClaude({ apiKey, system, messages, max_tokens, onText, signal }) {
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
      messages,
      stream: true
    }),
    signal
  });

  if (!upstream.ok || !upstream.body) {
    const data = await upstream.json().catch(() => ({}));
    const error = new Error(data?.error?.message || 'Anthropic API error');
    error.status = upstream.status;
    error.data = data;
    throw error;
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;

      let evt;
      try {
        evt = JSON.parse(payload);
      } catch {
        continue;
      }
      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        full += evt.delta.text;
        onText?.(evt.delta.text);
      } else if (evt.type === 'error') {
        throw new Error(evt.error?.message || 'Anthropic streaming error');
      }
    }
  }

  return full;
}

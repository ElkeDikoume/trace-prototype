// Vercel serverless function — production equivalent of the local Express
// route POST /api/claude-stream in server/index.js. Streams Anthropic's token
// deltas to the client as Server-Sent Events. The Anthropic key is read from
// ANTHROPIC_API_KEY (Vercel env), never reaching the browser bundle.

import { streamClaude } from './_lib/anthropic.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server has no Anthropic API key configured. Set ANTHROPIC_API_KEY in the Vercel project settings.' });
    return;
  }

  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Request must include a non-empty messages array.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    await streamClaude({
      apiKey,
      system,
      messages,
      max_tokens,
      onText: (chunk) => res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
    });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[TRACE api/claude-stream] Anthropic API error:', err.data || err.message);
    res.write(`data: ${JSON.stringify({ error: err.data?.error?.message || err.message || 'Streaming failed.' })}\n\n`);
    res.end();
  }
}

// Vercel serverless function — production equivalent of the local Express
// route in server/index.js. Deployed at POST /api/claude. The Anthropic key
// is read from the ANTHROPIC_API_KEY environment variable (set in the Vercel
// project's Environment Variables, never committed to the repo), so it never
// reaches the browser bundle.

import { callClaude } from './_lib/anthropic.js';

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

  try {
    const result = await callClaude({ apiKey, system, messages, max_tokens });
    res.status(200).json(result);
  } catch (err) {
    console.error('[TRACE api/claude] Anthropic API error:', err.data || err.message);
    res.status(err.status || 500).json({ error: err.data?.error?.message || err.message || 'Failed to reach Anthropic API.' });
  }
}

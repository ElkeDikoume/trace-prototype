import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callClaude, streamClaude } from '../api/_lib/anthropic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_FILE = path.resolve(__dirname, '..', 'API_KEY.txt');

function loadApiKey() {
  if (!fs.existsSync(KEY_FILE)) {
    console.error(`\n[TRACE server] Missing ${KEY_FILE}\nCreate API_KEY.txt in the project root containing your Anthropic API key.\n`);
    return null;
  }
  const raw = fs.readFileSync(KEY_FILE, 'utf-8');
  const eqMatch = raw.match(/ANTHROPIC_API_KEY\s*=\s*(\S+)/i);
  if (eqMatch) return eqMatch[1].trim();
  const bareMatch = raw.match(/sk-ant-[A-Za-z0-9_-]+/);
  if (bareMatch) return bareMatch[0].trim();
  return null;
}

const apiKey = loadApiKey();
if (!apiKey) {
  console.error('[TRACE server] Could not find a valid Anthropic API key in API_KEY.txt. AI features will fail until this is fixed.');
} else {
  console.log('[TRACE server] Loaded Anthropic API key from API_KEY.txt.');
}

const app = express();
app.use(express.json({ limit: '2mb' }));

app.post('/api/claude', async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: 'Server has no Anthropic API key configured. Check API_KEY.txt.' });
  }
  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request must include a non-empty messages array.' });
  }
  try {
    const result = await callClaude({ apiKey, system, messages, max_tokens });
    res.json(result);
  } catch (err) {
    console.error('[TRACE server] Anthropic API error:', err.data || err.message);
    res.status(err.status || 500).json({ error: err.data?.error?.message || err.message || 'Failed to reach Anthropic API.' });
  }
});

// Streaming variant used by the v2 "Ask TRACE AI" tab. Same proxy pattern as
// /api/claude (key stays server-side), but forwards Anthropic's token deltas to
// the client as Server-Sent Events so the chat can render as it generates.
// Path mirrors the Vercel serverless filename (api/claude-stream.js) so dev and
// production resolve identically.
app.post('/api/claude-stream', async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: 'Server has no Anthropic API key configured. Check API_KEY.txt.' });
  }
  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request must include a non-empty messages array.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

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
    console.error('[TRACE server] Anthropic stream error:', err.data || err.message);
    // Headers are already sent, so surface the error inside the SSE channel.
    res.write(`data: ${JSON.stringify({ error: err.data?.error?.message || err.message || 'Streaming failed.' })}\n\n`);
    res.end();
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, keyLoaded: Boolean(apiKey) });
});

const PORT = 8787;
app.listen(PORT, () => {
  console.log(`[TRACE server] Listening on http://localhost:${PORT}`);
});

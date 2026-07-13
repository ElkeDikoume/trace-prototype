import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const MODEL = 'claude-sonnet-5';

app.post('/api/claude', async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: 'Server has no Anthropic API key configured. Check API_KEY.txt.' });
  }
  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request must include a non-empty messages array.' });
  }
  try {
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
      console.error('[TRACE server] Anthropic API error:', data);
      return res.status(upstream.status).json({ error: data?.error?.message || 'Anthropic API error' });
    }
    const text = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
    res.json({ text, raw: data });
  } catch (err) {
    console.error('[TRACE server] Request failed:', err);
    res.status(500).json({ error: 'Failed to reach Anthropic API. Check your connection.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, keyLoaded: Boolean(apiKey) });
});

const PORT = 8787;
app.listen(PORT, () => {
  console.log(`[TRACE server] Listening on http://localhost:${PORT}`);
});

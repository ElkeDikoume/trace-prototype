// Abuse guard for the Claude proxy.
//
// `/api/claude` forwards arbitrary prompts to Anthropic using a server-side
// key. Without a guard it is a free, anonymous LLM endpoint that anyone who
// reads the deployed JS bundle can point a script at, and the bill lands on
// the project owner. This module is the cheap set of controls that make that
// unattractive.
//
// What it does NOT do: none of this is a substitute for a hard spend cap on
// the Anthropic account. The rate limiter is per serverless instance and
// resets on cold start, and an origin header is trivially forged. Treat this
// as friction, not as a lock.
//
// Every check is configured by environment variable. The token and origin
// checks are opt-in and skipped when unset, so a fresh clone works with no
// configuration. The rate limit and the payload caps are always on.

const WINDOW_MS = 60_000;

// Per-IP requests per minute. A caseworker structuring notes makes one call
// per case; a judge exploring the demo might make a dozen. A scraper makes
// thousands.
const PER_IP_LIMIT = Number(process.env.TRACE_RATE_LIMIT_PER_IP || 15);

// Per-instance ceiling across all callers. Backstop for a distributed caller
// that rotates IPs.
const GLOBAL_LIMIT = Number(process.env.TRACE_RATE_LIMIT_GLOBAL || 120);

// Hard ceiling on output tokens regardless of what the client asks for. The
// single most effective cost control here.
const MAX_TOKENS_CEILING = Number(process.env.TRACE_MAX_TOKENS || 1500);

// Reject oversized prompts outright. A field note plus a form schema is a few
// thousand characters. 24k is generous.
const MAX_INPUT_CHARS = Number(process.env.TRACE_MAX_INPUT_CHARS || 24_000);

const hits = new Map();

function prune(now) {
  for (const [key, stamps] of hits) {
    const kept = stamps.filter((t) => now - t < WINDOW_MS);
    if (kept.length) hits.set(key, kept);
    else hits.delete(key);
  }
}

function record(key, now) {
  const stamps = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  stamps.push(now);
  hits.set(key, stamps);
  return stamps.length;
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function originAllowed(req) {
  const configured = (process.env.TRACE_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Not configured means the check is skipped. A local clone should just work.
  if (!configured.length) return true;

  const candidate = req.headers.origin || req.headers.referer || '';
  if (!candidate) return false;

  let host;
  try {
    host = new URL(candidate).hostname;
  } catch {
    return false;
  }

  return configured.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/**
 * Runs every check against an incoming proxy request.
 *
 * Returns `{ ok: true, maxTokens }` when the request may proceed, where
 * `maxTokens` is the clamped value the caller should forward to Anthropic.
 * Returns `{ ok: false, status, error }` otherwise.
 */
export function guardRequest(req) {
  const now = Date.now();
  prune(now);

  // A. Shared secret. Opt-in: skipped entirely when TRACE_PROXY_TOKEN is unset.
  const expected = process.env.TRACE_PROXY_TOKEN;
  if (expected) {
    const presented = req.headers['x-trace-key'];
    if (presented !== expected) {
      return { ok: false, status: 401, error: 'Unauthorized.' };
    }
  }

  // B. Origin allowlist. Secondary layer on top of A, not a lock by itself.
  if (!originAllowed(req)) {
    return { ok: false, status: 403, error: 'Forbidden.' };
  }

  // C. Rate limit. Always on.
  const perIp = record(`ip:${clientIp(req)}`, now);
  if (perIp > PER_IP_LIMIT) {
    return { ok: false, status: 429, error: 'Too many requests. Try again in a minute.' };
  }

  const global = record('global', now);
  if (global > GLOBAL_LIMIT) {
    return { ok: false, status: 429, error: 'Service is busy. Try again in a minute.' };
  }

  // D. Payload caps. Always on.
  const body = req.body || {};
  const size = JSON.stringify(body.messages || []).length + String(body.system || '').length;
  if (size > MAX_INPUT_CHARS) {
    return { ok: false, status: 413, error: 'Request too large.' };
  }

  const requested = Number(body.max_tokens) || 1024;
  const maxTokens = Math.min(Math.max(requested, 1), MAX_TOKENS_CEILING);

  return { ok: true, maxTokens };
}

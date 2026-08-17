// Degraded mode — the deterministic layer standing on its own.
//
// TRACE's claim is that risk flagging does not depend on the model: the six
// CTDC/IOM indicators in data/riskIndicators.js are keyword and field matches
// that run entirely on device. This module is what lets the UI prove that when
// the model is unavailable, instead of surfacing an error and reading as broken.
//
// Any failure of a structuring/interpretation call flips this flag rather than
// raising: expired key, insufficient balance, 429, 5xx, request timeout,
// navigator.onLine === false, or malformed JSON in the response. One attempt,
// then degrade — deliberately no retry loop, because retrying a dead or
// empty-balance key burns what is left of it for nothing.
//
// ?offline=1 forces the same path against a working key, so the behaviour can
// be demonstrated on purpose rather than only observed on failure.

const listeners = new Set();
let degraded = false;

// True when the URL explicitly asks for the degraded path.
export function isForcedOffline() {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('offline') === '1';
  } catch {
    return false;
  }
}

export function isDegraded() {
  return degraded || isForcedOffline();
}

export function setDegraded(value) {
  const next = Boolean(value);
  if (next === degraded) return;
  degraded = next;
  listeners.forEach((fn) => {
    try { fn(); } catch { /* a bad subscriber must not break the others */ }
  });
}

export function subscribeDegraded(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// The single place that decides whether a thrown error means "degrade".
// Every failure class collapses to the same answer, so callers never have to
// classify: if the model call did not return usable output, the on-device
// layer takes over.
export function degradeOn(err) {
  setDegraded(true);
  if (typeof console !== 'undefined') {
    console.warn('[TRACE] AI unavailable, falling back to on-device scoring:', err?.message || err);
  }
}

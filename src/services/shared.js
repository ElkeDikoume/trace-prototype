// Shared helpers for the simulated external-data-source services in this folder.
//
// Every service in src/services/ is written as an async function returning a
// Promise, mirroring the shape of a real API client (fetch + parse + return),
// even though the data underneath is currently hardcoded. This means swapping
// in a live integration later (CTDC, IOM DTM, ACLED, an internal caseload API)
// only requires rewriting the body of the fetch function, call sites in the
// UI never change.

export function simulateLatency(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function tokenize(str) {
  return (str || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function overlapScore(a, b) {
  const tokensA = new Set(tokenize(a));
  const tokensB = tokenize(b);
  return tokensB.reduce((score, tok) => score + (tokensA.has(tok) ? 1 : 0), 0);
}

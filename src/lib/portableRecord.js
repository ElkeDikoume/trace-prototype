// Two-layer portable case record.
//
// Layer 1 (case locator): a short human-readable code agencies use to find
// each other's records. Never shown to the survivor.
//
// Layer 2 (survivor access phrase): three words the survivor memorizes and
// repeats at any TRACE-connected agency. Only a one-way SHA-256 hash of the
// phrase is ever stored, the original words never touch localStorage.

const LOCATOR_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity

export function generateCaseLocator() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += LOCATOR_CHARS[Math.floor(Math.random() * LOCATOR_CHARS.length)];
  }
  return `TRC-${code}`;
}

function normalize(str) {
  return (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function hashAccessPhrase(name, place, year) {
  const combined = `${normalize(name)}|${normalize(place)}|${normalize(year)}`;
  const data = new TextEncoder().encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function findCaseByAccessPhrase({ name, place, year }, cases) {
  const targetHash = await hashAccessPhrase(name, place, year);
  return cases.find((c) => c.portableRecord?.accessHash === targetHash) || null;
}

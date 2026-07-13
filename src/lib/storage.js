const CASES_KEY = 'trace_cases_v1';

function readAll() {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(cases) {
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
}

export function listCases() {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getCase(id) {
  return readAll().find((c) => c.id === id) || null;
}

export function saveCase(caseRecord) {
  const cases = readAll();
  const idx = cases.findIndex((c) => c.id === caseRecord.id);
  const now = Date.now();
  const updated = { ...caseRecord, updatedAt: now };
  if (idx >= 0) {
    cases[idx] = updated;
  } else {
    cases.push({ ...updated, createdAt: now });
  }
  writeAll(cases);
  return updated;
}

export function deleteCase(id) {
  writeAll(readAll().filter((c) => c.id !== id));
}

export function newCaseId() {
  return `case_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

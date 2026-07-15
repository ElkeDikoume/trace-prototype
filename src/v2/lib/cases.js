// Case persistence for the v2 shell.
// - When a real Supabase session exists, cases load from / save to the `cases`
//   table (RLS scopes them to caseworker_id = auth.uid()).
// - When running as a demo/guest user (no session), the Dashboard falls back to
//   the mock caseload so the demo still shows data.
// - When offline (or Supabase is unreachable), a saved intake is queued in
//   IndexedDB and flushed on the next load once connectivity + a session exist.
import { supabase, getCurrentUserId } from './supabase.js';
import { enqueueIntake, getQueue, setQueue } from './offlineQueue.js';
import { mockCases } from '../mockData.js';

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Supabase row -> the shape the Dashboard / CaseCard expect.
function mapRow(row) {
  return {
    id: row.case_number || `#${String(row.id || '').slice(0, 4)}`,
    ageRange: row.age_range || '—',
    sex: row.sex || '',
    riskLevel: row.risk_level || 'medium',
    status: cap(row.status) || 'Active',
    lastUpdated: relativeTime(row.updated_at || row.created_at),
    notes: row.raw_notes || '',
    structuredData: row.structured_data || null,
    ctdcIndicators: row.ctdc_indicators || null
  };
}

// caseData -> the `cases` table columns (minus caseworker_id, added at write).
function toRow(caseData) {
  return {
    case_number: caseData.caseNumber,
    raw_notes: caseData.rawNotes,
    structured_data: caseData.structuredData,
    ctdc_indicators: caseData.ctdcIndicators,
    risk_level: caseData.riskLevel,
    age_range: caseData.ageRange,
    sex: caseData.sex,
    status: caseData.status || 'active'
  };
}

// Load the caseworker's cases. Real Supabase data when authenticated, otherwise
// the mock caseload (demo/guest).
export async function fetchCases() {
  const uid = await getCurrentUserId();
  if (supabase && uid) {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('caseworker_id', uid)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) return data.map(mapRow);
  }
  return mockCases;
}

// Save a structured intake. Returns { status: 'synced' | 'queued' }.
export async function saveCase(caseData) {
  const row = toRow(caseData);
  const uid = await getCurrentUserId();

  if (navigator.onLine && supabase && uid) {
    try {
      const { error } = await supabase.from('cases').insert({ ...row, caseworker_id: uid });
      if (error) throw error;
      return { status: 'synced' };
    } catch {
      // Supabase unreachable despite being "online" — fall through to queue.
      await enqueueIntake(row);
      return { status: 'queued' };
    }
  }

  // Offline, or no real session (demo/guest): keep it safe locally.
  await enqueueIntake(row);
  return { status: 'queued' };
}

// Flush any queued intakes to Supabase. Safe to call on every app load; it is a
// no-op when offline, unconfigured, or unauthenticated. Returns count flushed.
export async function flushQueue() {
  if (!navigator.onLine || !supabase) return { flushed: 0, remaining: undefined };
  const uid = await getCurrentUserId();
  if (!uid) return { flushed: 0, remaining: undefined };

  const queue = await getQueue();
  if (!queue.length) return { flushed: 0, remaining: 0 };

  const remaining = [];
  let flushed = 0;
  for (const item of queue) {
    // Strip local-only bookkeeping fields before insert.
    const { localId, queuedAt, ...row } = item;
    try {
      const { error } = await supabase.from('cases').insert({ ...row, caseworker_id: uid });
      if (error) throw error;
      flushed += 1;
    } catch {
      remaining.push(item);
    }
  }
  await setQueue(remaining);
  return { flushed, remaining: remaining.length };
}

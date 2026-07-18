// Local overlay for Phase 4 case state (status changes, follow-up tasks + their
// completion, supervisor flags, and newly-saved intakes). Kept in localStorage
// so the demo persists across reloads without depending on a Supabase schema.
// Real Supabase writes still happen in cases.js/saveCase; this overlay is what
// the UI reads so demo + authenticated users behave consistently.
const KEY = 'trace_v2_overlay';

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return raw && typeof raw === 'object' ? { cases: {}, order: [], ...raw } : { cases: {}, order: [] };
  } catch {
    return { cases: {}, order: [] };
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

// Merge the overlay onto a base list (mock or Supabase). Overlay-only cases
// (new intakes) are prepended, most recent first.
export function mergeCases(base = []) {
  const state = read();
  const byId = new Map(base.map((c) => [c.id, { ...c }]));

  // Apply patches to existing base cases.
  Object.entries(state.cases).forEach(([id, patch]) => {
    if (byId.has(id)) byId.set(id, { ...byId.get(id), ...patch });
  });

  // Prepend overlay-only (newly created) cases in insertion order (newest first).
  const extras = [];
  state.order
    .slice()
    .reverse()
    .forEach((id) => {
      if (!base.some((c) => c.id === id) && state.cases[id]) extras.push({ ...state.cases[id] });
    });

  return [...extras, ...Array.from(byId.values())];
}

// Insert or update a case in the overlay (used for new saved intakes).
export function upsertCase(caseObj) {
  const state = read();
  const existed = Boolean(state.cases[caseObj.id]);
  state.cases[caseObj.id] = { ...(state.cases[caseObj.id] || {}), ...caseObj };
  if (!existed && !state.order.includes(caseObj.id)) state.order.push(caseObj.id);
  write(state);
}

// Shallow-merge a patch into a case's overlay entry.
export function patchCase(id, patch) {
  const state = read();
  state.cases[id] = { ...(state.cases[id] || {}), ...patch };
  write(state);
}

export function setStatus(id, status, extra = {}) {
  patchCase(id, { status, ...extra });
}

export function setFollowUpTasks(id, tasks) {
  patchCase(id, { follow_up_tasks: tasks });
}

// Toggle a single follow-up task's completion for a case, returning the new list.
// baseTasks is the task list from the base case object (mockData or Supabase)
// used as fallback when the overlay has no entry yet for this case.
export function toggleTask(id, index, baseTasks = []) {
  const state = read();
  const entry = state.cases[id] || {};
  const tasks = (entry.follow_up_tasks || baseTasks).map((task, i) =>
    i === index ? { ...task, done: !task.done } : task
  );
  state.cases[id] = { ...entry, follow_up_tasks: tasks };
  write(state);
  return tasks;
}

export function hasIncompleteTasks(caseObj) {
  const tasks = caseObj?.follow_up_tasks || [];
  return tasks.length > 0 && tasks.some((t) => !t.done);
}

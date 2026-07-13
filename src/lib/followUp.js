const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Recomputes the reminder only when risk level actually changes, so an
// existing countdown (and the caseworker's on/off toggle) isn't reset by
// every keystroke while the level stays the same.
export function computeFollowUpReminder(level, existingReminder) {
  if (level !== 'high' && level !== 'medium') return null;
  if (existingReminder && existingReminder.level === level) return existingReminder;

  const durationMs = level === 'high' ? 48 * HOUR : 7 * DAY;
  return {
    level,
    dueAt: Date.now() + durationMs,
    enabled: true
  };
}

export function isReminderDue(reminder) {
  return !!reminder?.enabled && Date.now() >= reminder.dueAt;
}

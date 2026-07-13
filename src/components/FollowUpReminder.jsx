import { useI18n } from '../lib/i18n.jsx';

function formatDue(dueAt, t) {
  const diffMs = dueAt - Date.now();
  if (diffMs <= 0) return t('due now');
  const hours = Math.round(diffMs / (60 * 60 * 1000));
  if (hours < 48) return `${t('due in')} ${hours}h`;
  return `${t('due in')} ${Math.round(hours / 24)}d`;
}

export default function FollowUpReminder({ reminder, onToggle }) {
  const { t } = useI18n();
  if (!reminder) return null;

  return (
    <div className="flex items-center justify-between bg-trace-800 border border-trace-700 rounded-lg p-3 mb-4">
      <div className="text-xs text-slate-300">
        <span className="font-medium">⏰ {t('Follow-up reminder')}</span>
        <span className="text-slate-500"> — {formatDue(reminder.dueAt, t)} ({reminder.level === 'high' ? '48h' : t('7-day')} {t('window')})</span>
      </div>
      <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          checked={reminder.enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-sky-500"
        />
        <span className="text-xs text-slate-400">{reminder.enabled ? t('On') : t('Off')}</span>
      </label>
    </div>
  );
}

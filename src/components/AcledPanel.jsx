import SourceBadge from './SourceBadge.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function AcledPanel({ events }) {
  const { t } = useI18n();
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-trace-800 border border-trace-700 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">{t('Nearby conflict events')}</h3>
        <SourceBadge label="ACLED" />
      </div>
      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="text-xs border-l-2 border-trace-700 pl-2">
            <div className="text-slate-100 font-medium">{e.eventType} · <span className="text-slate-400 font-normal">{e.date}</span></div>
            <div className="text-slate-500">{e.location}, {e.country} — {e.actor} {e.fatalities > 0 && `· ${e.fatalities} ${t('fatalities')}`}</div>
            <div className="text-slate-400 mt-0.5">{e.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

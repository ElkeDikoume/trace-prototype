import { useI18n } from '../lib/i18n.jsx';

export default function ServiceSuggestions({ services }) {
  const { t } = useI18n();
  if (!services || services.length === 0) return null;

  return (
    <div data-tutorial="services" className="mb-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-2">{t('Suggested services')}</h3>
      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="bg-trace-800 border border-trace-700 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-slate-100">{s.name}</div>
                <div className="text-xs text-trace-accent">{s.org} · {s.country}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t(s.description)}</p>
            <p className="text-xs text-slate-500 mt-1">📍 {s.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

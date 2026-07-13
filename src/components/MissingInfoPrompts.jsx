import { useI18n } from '../lib/i18n.jsx';

export default function MissingInfoPrompts({ missingFields }) {
  const { t } = useI18n();
  if (!missingFields || missingFields.length === 0) return null;

  return (
    <div className="bg-trace-800 border border-trace-700 rounded-lg p-3 mb-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-2">{t('Missing information that could sharpen this risk read')}</h3>
      <ul className="space-y-1.5">
        {missingFields.map((f) => (
          <li key={f.key} className="text-xs text-slate-400">
            <span className="text-slate-300 font-medium">{t(f.label)}:</span> {t(f.reason)}
          </li>
        ))}
      </ul>
    </div>
  );
}

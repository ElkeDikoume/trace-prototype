import { useI18n } from '../lib/i18n.jsx';

export default function FollowUpBanner({ dueCases, onOpen, onDismiss }) {
  const { t } = useI18n();
  if (!dueCases || dueCases.length === 0) return null;

  return (
    <div className="flex-shrink-0 bg-trace-risk-medium/10 border-b border-trace-risk-medium px-4 py-2">
      <div className="text-xs font-semibold text-trace-risk-medium mb-1">⏰ {t('Follow-up due')}</div>
      <div className="space-y-1">
        {dueCases.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-xs gap-2">
            <span className="text-slate-300 truncate">{c.label}</span>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => onOpen(c.id)} className="text-trace-accent hover:underline">{t('Open')}</button>
              <button onClick={() => onDismiss(c.id)} className="text-slate-500 hover:text-slate-300">{t('Dismiss')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

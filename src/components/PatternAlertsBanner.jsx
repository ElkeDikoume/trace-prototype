import { useState } from 'react';
import SourceBadge from './SourceBadge.jsx';
import { useI18n } from '../lib/i18n.jsx';

const SEVERITY_STYLES = {
  high: 'border-trace-risk-high text-trace-risk-high',
  elevated: 'border-trace-risk-medium text-trace-risk-medium',
  watch: 'border-trace-risk-low text-trace-risk-low'
};

export default function PatternAlertsBanner({ alerts }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  if (!alerts || alerts.length === 0) return null;

  return (
    <section data-tutorial="pattern-banner" className="flex-shrink-0 bg-trace-900 border-b border-trace-700 px-4 py-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="text-sm font-semibold text-slate-200 whitespace-nowrap">{t('Pattern intelligence')}</h2>
          <SourceBadge label="Cross-case" />
        </div>
        <span className="text-slate-500 text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
          {alerts.map((a) => (
            <div key={a.id} className={`text-xs border-l-2 pl-2 ${SEVERITY_STYLES[a.severity] || 'border-trace-700 text-slate-300'}`}>
              <div className="font-medium">
                {a.title} <span className="text-slate-500 font-normal">— {a.region} · {a.casesCited} {t('cases')} · {a.detectedDate}</span>
              </div>
              <div className="text-slate-400 font-normal">{a.description}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

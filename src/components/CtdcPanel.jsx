import SourceBadge from './SourceBadge.jsx';
import DemoDataBadge from './DemoDataBadge.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function CtdcPanel({ records }) {
  const { t } = useI18n();
  if (!records || records.length === 0) return null;

  return (
    <div className="bg-trace-800 border border-trace-700 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-200">{t('Matched trafficking patterns')}</h3>
        <div className="flex items-center gap-1.5">
          <SourceBadge label="CTDC indicators" />
          <DemoDataBadge />
        </div>
      </div>
      <div className="space-y-2">
        {records.map((r) => (
          <div key={r.id} className="text-xs border-l-2 border-trace-700 pl-2">
            <div className="text-slate-100 font-medium">{t(r.indicator)} · <span className="text-slate-400 font-normal">{r.sector}</span></div>
            <div className="text-slate-400">{r.pattern}</div>
            <div className="text-slate-500 mt-0.5">{r.region}, {r.prevalence}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

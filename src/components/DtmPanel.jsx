import SourceBadge from './SourceBadge.jsx';
import DemoDataBadge from './DemoDataBadge.jsx';
import { useI18n } from '../lib/i18n.jsx';

const TREND_ICON = { increasing: '↑', stable: '→', decreasing: '↓' };

export default function DtmPanel({ context }) {
  const { t } = useI18n();
  if (!context) return null;

  return (
    <div className="bg-trace-800 border border-trace-700 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-200">{t('Displacement context')} — {context.location}</h3>
        <div className="flex items-center gap-1.5">
          <SourceBadge label="IOM DTM" />
          <DemoDataBadge />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <div className="text-slate-500">{t('Displaced population')}</div>
          <div className="text-slate-100 font-medium">{context.displacedPopulation.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-500">{t('Vulnerability score')}</div>
          <div className="text-slate-100 font-medium">{context.vulnerabilityScore}/100 {TREND_ICON[context.trend]} {t(context.trend)}</div>
        </div>
      </div>
      <div className="text-xs text-slate-400">
        <span className="text-slate-500">{t('Primary origin:')}</span> {context.primaryOrigin}
      </div>
      <div className="text-xs text-slate-400 mt-1">{context.note}</div>
      <div className="text-[10px] text-slate-600 mt-1">{t('DTM update:')} {context.lastUpdated}</div>
    </div>
  );
}

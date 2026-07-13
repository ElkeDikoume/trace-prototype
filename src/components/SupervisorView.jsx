import AfricaHeatMap from './AfricaHeatMap.jsx';
import { useI18n } from '../lib/i18n.jsx';

const HARDCODED_ALERTS = [
  'Same employer name in 3 unconnected cases this week',
  'New corridor flagged: Agadez–Tripoli, 4 cases in 7 days'
];

export default function SupervisorView({ stats }) {
  const { t } = useI18n();
  return (
    <section className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-slate-100">{t('Supervisor dashboard')}</h2>
        <p className="text-xs text-slate-500">{t('Live in full deployment — demo data shown.')}</p>
      </div>

      <AfricaHeatMap />

      <div className="bg-trace-800 border border-trace-700 rounded-lg p-3 mt-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">{t('Caseload stats')}</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-slate-100">{stats.total}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t('Total')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-trace-risk-high">{stats.high}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t('High')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-trace-risk-medium">{stats.medium}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t('Medium')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-trace-risk-low">{stats.low}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t('Low')}</div>
          </div>
        </div>
      </div>

      <div className="bg-trace-800 border border-trace-700 rounded-lg p-3 mt-4 mb-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">{t('Pattern alerts')}</h3>
        <ul className="space-y-2">
          {HARDCODED_ALERTS.map((a) => (
            <li key={a} className="text-xs text-slate-300 border-l-2 border-trace-risk-medium pl-2">{t(a)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

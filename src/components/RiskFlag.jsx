import { useI18n } from '../lib/i18n.jsx';

const LEVEL_STYLES = {
  low: { bg: 'bg-trace-risk-low/15', border: 'border-trace-risk-low', text: 'text-trace-risk-low', label: 'LOW' },
  medium: { bg: 'bg-trace-risk-medium/15', border: 'border-trace-risk-medium', text: 'text-trace-risk-medium', label: 'MEDIUM' },
  high: { bg: 'bg-trace-risk-high/15', border: 'border-trace-risk-high', text: 'text-trace-risk-high', label: 'HIGH' }
};

function formatEvidence(e, t) {
  return e.type === 'field'
    ? `${t('Field')} "${e.field}" = "${t(e.value)}"`
    : `${t('Keyword match')}: "${e.keyword}"`;
}

export default function RiskFlag({ riskResult, onAskWhy }) {
  const { t } = useI18n();
  if (!riskResult) return null;
  const style = LEVEL_STYLES[riskResult.level];

  return (
    <div data-tutorial="risk-flag" className={`border rounded-lg p-3 mb-4 ${style.bg} ${style.border}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className={`text-sm font-bold tracking-wide ${style.text}`}>{t(style.label)} {t('RISK')}</span>
          <span className="text-xs text-slate-400 ml-2">{t('score')} {riskResult.score.toFixed(1)}</span>
        </div>
        <button
          onClick={onAskWhy}
          className="text-xs px-2 py-1 rounded bg-trace-800 border border-trace-700 hover:bg-trace-700 text-slate-200"
        >
          {t('Ask AI why →')}
        </button>
      </div>

      <div className="mt-2">
        {riskResult.matched.length === 0 ? (
          <p className="text-xs text-slate-400">{t('No trafficking indicators detected in the current case data.')}</p>
        ) : (
          <ul className="space-y-1">
            {riskResult.matched.map((m) => (
              <li key={m.id} className="text-xs text-slate-200">
                <span className="font-medium">{t(m.label)}</span>
                <span className="text-slate-400"> — {m.evidence.map((e) => formatEvidence(e, t)).join('; ')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

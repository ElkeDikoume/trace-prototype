import { useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { getFormById } from '../data/forms.js';
import { analyzeRisk } from '../data/riskIndicators.js';

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

// Cross-case overlap, computed locally from whatever cases happen to be
// stored in this browser — a stand-in for real org-wide pattern
// intelligence, not a substitute for it (see the disclaimer rendered below).
function computePatternContext(riskResult, caseId) {
  if (!riskResult || riskResult.matched.length === 0) return null;
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem('trace_cases_v1') || '[]');
  } catch {
    stored = [];
  }
  const otherCases = stored.filter((c) => c.id !== caseId);
  if (otherCases.length === 0) return null;

  const otherResults = otherCases.map((c) => {
    const form = getFormById(c.formId);
    return form?.riskEligible ? analyzeRisk(c.data) : null;
  });

  const overlaps = riskResult.matched
    .map((m) => ({
      id: m.id,
      label: m.label,
      count: otherResults.filter((r) => r?.matched.some((om) => om.id === m.id)).length
    }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count);

  return { overlaps, otherCaseTotal: otherCases.length };
}

export default function RiskFlag({ riskResult, onAskWhy, caseId }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  const [patternOpen, setPatternOpen] = useState(false);
  const patternContext = useMemo(() => computePatternContext(riskResult, caseId), [riskResult, caseId]);
  if (!riskResult) return null;
  const style = LEVEL_STYLES[riskResult.level];

  return (
    <div data-tutorial="risk-flag" className={`border rounded-lg p-3 mb-4 ${style.bg} ${style.border}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className={`text-sm font-bold tracking-wide ${style.text}`}>{t(style.label)} {t('RISK')}</span>
          <span className="text-xs text-slate-400 ml-2">{t('score')} {riskResult.score.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-tutorial="ask-ai-why"
            onClick={onAskWhy}
            className="text-xs px-2 py-1 rounded bg-trace-800 border border-trace-700 hover:bg-trace-700 text-slate-200"
          >
            {t('Ask AI why →')}
          </button>
          <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-slate-200 text-xs flex-shrink-0">
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {open && (
        <>
          <p className="text-[10px] text-slate-500 mt-1">Decision support only — caseworker review required before any action.</p>

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

          {patternContext && (
            <div className="mt-3 pt-2 border-t border-trace-700/50">
              <button
                onClick={() => setPatternOpen(!patternOpen)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <span>{patternOpen ? '▼' : '▶'}</span> {t('Pattern context')}
              </button>
              {patternOpen && (
                <div className="mt-2 space-y-1">
                  {patternContext.overlaps.length === 0 ? (
                    <p className="text-xs text-slate-500">{t('No other cases stored on this device share these indicators yet.')}</p>
                  ) : (
                    patternContext.overlaps.map((o) => (
                      <p key={o.id} className="text-xs text-slate-300">
                        <span className="font-medium text-slate-100">{o.count}</span>{' '}
                        {o.count === 1 ? t('other case shares') : t('other cases share')}{' '}
                        <span className="text-slate-200">{t(o.label)}</span>
                      </p>
                    ))
                  )}
                  <p className="text-[10px] text-slate-600 mt-1">
                    {t('Computed locally from cases stored on this device — not organization-wide pattern analysis.')}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function FormSelector({ forms, cases, activeCaseId, onNewCase, onOpenCase }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(!activeCaseId);

  useEffect(() => {
    setExpanded(!activeCaseId);
  }, [activeCaseId]);

  if (!expanded) {
    const activeCase = cases.find((c) => c.id === activeCaseId);
    const activeFormDef = forms.find((f) => f.id === activeCase?.formId);
    const label = activeCase
      ? activeCase.data?.fullName || activeCase.data?.clientIdentifier || activeCase.data?.survivorIdentifier || activeCase.data?.caseId || t('Untitled')
      : null;

    return (
      <section data-tutorial="form-selector" className="flex-shrink-0 bg-trace-900 border-b border-trace-700 px-4 py-2">
        <button onClick={() => setExpanded(true)} className="w-full flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400 truncate">
            {activeFormDef && <span className="text-trace-accent">{t(activeFormDef.shortName)}</span>}{' '}
            {label && <span className="text-slate-200 font-medium">{label}</span>}
          </div>
          <span className="flex-shrink-0 text-xs px-2 py-1 rounded bg-trace-800 border border-trace-700 text-slate-300">
            {t('+ New / switch case')}
          </span>
        </button>
      </section>
    );
  }

  return (
    <section data-tutorial="form-selector" className="flex-shrink-0 bg-trace-900 border-b border-trace-700 px-4 py-4 max-h-[40vh] overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t('Start a new case')}</h2>
        {activeCaseId && (
          <button onClick={() => setExpanded(false)} className="text-xs text-slate-400 hover:text-slate-200">
            {t('Collapse ▲')}
          </button>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mb-3">{t('Uses pseudonyms, consented data sharing, and minimal case data by default.')}</p>
      <div data-tutorial="form-cards-primary" className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {forms.slice(0, 3).map((form) => (
          <button
            key={form.id}
            onClick={() => onNewCase(form.id)}
            className="text-left bg-trace-800 hover:bg-trace-700 active:scale-[0.98] transition rounded-lg p-3 border border-trace-700"
          >
            <div className="text-sm font-medium text-slate-100">{t(form.shortName)}</div>
            <div className="text-xs text-slate-400 mt-1 line-clamp-2">{t(form.description)}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {forms.slice(3).map((form) => (
          <button
            key={form.id}
            onClick={() => onNewCase(form.id)}
            className="text-left bg-trace-800 hover:bg-trace-700 active:scale-[0.98] transition rounded-lg p-3 border border-trace-700"
          >
            <div className="text-sm font-medium text-slate-100">{t(form.shortName)}</div>
            <div className="text-xs text-slate-400 mt-1 line-clamp-2">{t(form.description)}</div>
          </button>
        ))}
      </div>

      {cases.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">{t('Open existing case')}</h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {cases.map((c) => {
              const form = forms.find((f) => f.id === c.formId);
              const label = c.data?.fullName || c.data?.clientIdentifier || c.data?.survivorIdentifier || c.data?.caseId || t('Untitled');
              return (
                <button
                  key={c.id}
                  onClick={() => onOpenCase(c.id)}
                  className={`flex-shrink-0 rounded-lg px-3 py-2 border text-left min-w-[150px] ${
                    c.id === activeCaseId
                      ? 'border-trace-accent bg-trace-800'
                      : 'border-trace-700 bg-trace-800/60 hover:bg-trace-800'
                  }`}
                >
                  <div className="text-xs text-trace-accent">{t(form?.shortName) || c.formId}</div>
                  <div className="text-sm font-medium truncate max-w-[140px]">{label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

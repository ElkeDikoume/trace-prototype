import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

const ONLINE_FEATURES = [
  'AI form structuring',
  'TRACE Assistant chatbot',
  'Hausa/Fulfulde/Zarma interpretation',
  'Document & referral generation',
  'Pattern intelligence',
  'Live DTM/ACLED context'
];

const OFFLINE_FEATURES = [
  'Manual form entry',
  'Risk scoring (cached)',
  'Service directory (cached)',
  'Case storage (local)',
  'Follow-up reminders'
];

export default function OnlineStatusToggle({ onlineMode, onToggle }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      <button
        data-tutorial="offline-indicator"
        onClick={onToggle}
        className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${
          onlineMode
            ? 'bg-trace-risk-low/15 border-trace-risk-low text-trace-risk-low'
            : 'bg-trace-700 border-trace-600 text-slate-300'
        }`}
      >
        {onlineMode ? `● ${t('Online')}` : `○ ${t('Offline')}`}
      </button>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('What works online vs offline')}
        title={t('What works online vs offline')}
        className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full text-[11px] text-slate-500 hover:text-slate-300"
      >
        ⓘ
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-trace-900 border border-trace-700 rounded-xl shadow-2xl p-4 w-72">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-trace-risk-low mb-1.5">🟢 {t('Online')}</div>
              <ul className="space-y-1">
                {ONLINE_FEATURES.map((f) => (
                  <li key={f} className="text-[11px] text-slate-300">✓ {t(f)}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1.5">⚪ {t('Offline')}</div>
              <ul className="space-y-1">
                {OFFLINE_FEATURES.map((f) => (
                  <li key={f} className="text-[11px] text-slate-300">✓ {t(f)}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">{t('Data syncs automatically when connection is restored.')}</p>
        </div>
      )}
    </div>
  );
}

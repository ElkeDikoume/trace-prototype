import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function HeaderOverflowMenu({ onOpenLookup }) {
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('More options')}
        title={t('More options')}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-trace-800 border border-trace-700 text-sm hover:bg-trace-700"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-trace-800 border border-trace-700 rounded-lg shadow-lg p-1.5 flex flex-col gap-0.5 min-w-[180px]">
          <button
            onClick={() => { onOpenLookup(); setOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-trace-700 hover:text-white text-left"
          >
            <span>🔎</span> {t('Find portable record')}
          </button>
        </div>
      )}
    </div>
  );
}

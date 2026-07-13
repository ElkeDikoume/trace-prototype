import { useEffect, useRef, useState } from 'react';
import { UI_LANGUAGES } from '../lib/i18n.jsx';

// Full interface-language switching is a production feature — this demo
// intentionally keeps the UI in English regardless of which option is
// clicked, so the dropdown is browsable but non-functional beyond showing
// what's on the roadmap. See the "Language selector" guided-tour step.
export default function LanguageSelector({ lang }) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const ref = useRef(null);
  const current = UI_LANGUAGES.find((l) => l.code === lang) || UI_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(false), 2500);
    return () => clearTimeout(id);
  }, [notice]);

  function handleSelect(l) {
    setOpen(false);
    if (l.code !== lang) setNotice(true);
  }

  return (
    <div ref={ref} className="relative">
      <button
        data-tutorial="language-selector"
        onClick={() => setOpen((o) => !o)}
        aria-label="Interface language"
        title="Interface language"
        className="text-xs pl-1.5 pr-1 py-1 rounded-full bg-trace-800 border border-trace-700 text-slate-300 hover:bg-trace-700 flex items-center gap-1"
      >
        {current.flag} {current.label}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-trace-900 border border-trace-700 rounded-xl shadow-2xl py-1.5 w-44">
          {UI_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l)}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-trace-800 ${
                l.code === lang ? 'text-trace-accent font-medium' : 'text-slate-300'
              }`}
            >
              <span>{l.flag}</span> {l.label}
              {l.code === lang && <span className="ml-auto text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}

      {notice && (
        <div className="absolute right-0 top-9 z-[60] bg-trace-800 border border-trace-700 rounded-lg shadow-xl px-3 py-2 w-56 text-[11px] text-slate-300 leading-relaxed">
          Language switching available in production — currently showing English for this demo.
        </div>
      )}
    </div>
  );
}

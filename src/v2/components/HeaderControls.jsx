// Header controls for the Dashboard top bar: a globe language switcher and a
// sun/moon light-dark toggle. Language changes flow through i18next (and drive
// RTL for Arabic); theme changes flow through ThemeContext.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../lib/i18n.js';
import { useTheme } from '../lib/ThemeContext.jsx';

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeaderControls() {
  const { i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  function choose(code) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-1">
      {/* Language switcher */}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Change language"
          aria-expanded={open}
          className="flex items-center gap-1 rounded-lg border border-tracev2-border bg-tracev2-card px-2 py-1.5 text-tracev2-muted transition-colors duration-150 hover:text-tracev2-text"
        >
          <GlobeIcon />
          <span className="text-[11px] font-semibold">{current.label}</span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute z-50 mt-1 ltr:right-0 rtl:left-0 w-36 overflow-hidden rounded-xl border border-tracev2-border bg-tracev2-card shadow-xl">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => choose(l.code)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm transition-colors duration-150 hover:bg-tracev2-bg ${
                    l.code === current.code ? 'text-tracev2-accent' : 'text-tracev2-text'
                  }`}
                >
                  <span>{l.name}</span>
                  <span className="text-[11px] text-tracev2-subtle">{l.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="flex items-center justify-center rounded-lg border border-tracev2-border bg-tracev2-card p-1.5 text-tracev2-muted transition-colors duration-150 hover:text-tracev2-text"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
}

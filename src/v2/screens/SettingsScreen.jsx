// Settings — a light surface (like the app's sheets) covering language,
// appearance, organisation, data and about. Everything here writes straight to
// localStorage; the theme toggle goes through ThemeContext so the app actually
// repaints rather than just recording a preference.
import { useEffect, useState } from 'react';
import i18n from '../lib/i18n.js';
import { useTheme } from '../lib/ThemeContext.jsx';

const GITHUB_URL = 'https://github.com/ElkeDikoume/trace-humanitarian';

// The four field languages, matching the onboarding picker.
const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'ha', flag: '🌍', name: 'Hausa' },
  { code: 'ar', flag: '🇹🇩', name: 'Arabic' }
];

function Section({ title, children }) {
  return (
    <div className="mt-6 first:mt-4">
      <h2 className="mb-2 px-4 text-xs uppercase tracking-widest text-slate-400">{title}</h2>
      <div className="bg-white">{children}</div>
    </div>
  );
}

function Row({ label, value, onClick, danger = false, children }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-center justify-between border-b border-slate-100 px-4 py-3.5 text-start ${
        onClick ? 'transition-colors hover:bg-slate-50' : ''
      }`}
    >
      <span className={`text-sm ${danger ? 'text-red-500' : 'text-slate-700'}`}>{label}</span>
      {children ?? <span className="text-sm text-slate-400">{value}</span>}
    </Tag>
  );
}

export default function SettingsScreen({ onBack }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  const [lang, setLang] = useState(() => localStorage.getItem('trace_lang') || i18n.language || 'en');
  const [org, setOrg] = useState(() => localStorage.getItem('trace_org') || '');

  // Mirror the theme onto the document root as well, for anything outside the
  // phone frame that keys off a `dark` class.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  function chooseLanguage(code) {
    setLang(code);
    localStorage.setItem('trace_lang', code);
    i18n.changeLanguage(code);
  }

  function clearData() {
    if (!window.confirm('This will delete all local case data. Are you sure?')) return;
    localStorage.clear();
    window.location.href = '?v2&tour';
  }

  return (
    // Copy here is hardcoded English, so pin LTR like the tour card.
    <div dir="ltr" className="flex flex-1 flex-col overflow-y-auto bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3">
        <button onClick={onBack} aria-label="Back" className="text-slate-500 transition-colors hover:text-slate-800">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-base font-bold">Settings</h1>
      </div>

      <Section title="Working language">
        {LANGUAGES.map((l) => {
          const selected = lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => chooseLanguage(l.code)}
              aria-pressed={selected}
              className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3.5 text-start transition-colors hover:bg-slate-50"
            >
              <span className={`text-sm ${selected ? 'font-medium text-blue-600' : 'text-slate-700'}`}>
                <span className="mr-2" aria-hidden="true">
                  {l.flag}
                </span>
                {l.name}
              </span>
              {selected && <span className="text-blue-600">✓</span>}
            </button>
          );
        })}
      </Section>

      <Section title="Appearance">
        <Row label="Dark mode">
          <label className="inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={dark} onChange={toggle} className="sr-only" />
            <span
              className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                dark ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  dark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
          </label>
        </Row>
      </Section>

      <Section title="Organisation">
        <div className="border-b border-slate-100 px-4 py-3.5">
          <label htmlFor="trace-org" className="block text-sm text-slate-700">
            Organisation name
          </label>
          <input
            id="trace-org"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            onBlur={(e) => localStorage.setItem('trace_org', e.target.value)}
            placeholder="e.g. IOM Niger"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
        </div>
        <Row label="Caseworker ID" value="CW-2026-0041" />
      </Section>

      <Section title="Data & sync">
        <Row label="Last synced" value="14 min ago" />
        <Row label="Offline records" value="2 pending" />
        <Row label="Clear all local data" onClick={clearData} danger value="" />
      </Section>

      <Section title="About">
        <Row label="Version" value="2.1.0-demo" />
        <Row label="Build" value="Open Atlas Hackathon · Jul 2026" />
        <Row
          label="View on GitHub"
          onClick={() => window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')}
          value="↗"
        />
      </Section>

      <div className="h-6" />
    </div>
  );
}

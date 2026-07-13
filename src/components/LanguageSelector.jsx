import { UI_LANGUAGES } from '../lib/i18n.jsx';

export default function LanguageSelector({ lang, onChange }) {
  return (
    <select
      data-tutorial="language-selector"
      value={lang}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Interface language"
      title="Interface language"
      className="text-xs pl-1.5 pr-1 py-1 rounded-full bg-trace-800 border border-trace-700 text-slate-300 hover:bg-trace-700"
    >
      {UI_LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.label}
        </option>
      ))}
    </select>
  );
}

import { useI18n } from '../lib/i18n.jsx';

export default function ThemeToggle({ theme, onToggle }) {
  const { t } = useI18n();
  return (
    <button
      onClick={onToggle}
      aria-label={t('Toggle color theme')}
      title={t('Toggle dark / light mode')}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-trace-800 border border-trace-700 text-slate-300 hover:bg-trace-700 text-sm"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

import { useI18n } from '../lib/i18n.jsx';

export default function SourceBadge({ label }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-trace-700 text-trace-accent">
      {t(label)}
      <span className="text-slate-400 font-normal normal-case">· {t('simulated')}</span>
    </span>
  );
}

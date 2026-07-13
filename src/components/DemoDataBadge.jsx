import { useI18n } from '../lib/i18n.jsx';

export default function DemoDataBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex flex-shrink-0 items-center whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border border-dashed border-slate-600 text-slate-500">
      {t('Demo data')}
    </span>
  );
}

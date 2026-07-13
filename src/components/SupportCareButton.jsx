import { useI18n } from '../lib/i18n.jsx';

export default function SupportCareButton({ onClick }) {
  const { t } = useI18n();
  return (
    <button
      data-tutorial="support-care"
      onClick={onClick}
      aria-label={t('Open support and care resources')}
      title={t('Support & Care')}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-trace-800 border border-trace-700 text-sm hover:bg-trace-700"
    >
      💛
    </button>
  );
}

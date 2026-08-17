import { useEffect, useState } from 'react';
import { isDegraded, subscribeDegraded } from '../lib/degradedMode.js';
import { useI18n } from '../lib/i18n.jsx';

// Renders above the risk result, not below it: the point is to frame the score
// before the caseworker reads it, so "no AI structuring" is understood as a
// stated mode rather than a missing feature. Subscribes to the module store in
// lib/degradedMode.js because both intake paths — the button in
// VoiceTextIntake and the tour's window.__traceStructureNow in App — can raise it.
export default function DegradedBanner() {
  const { t } = useI18n();
  const [degraded, setDegraded] = useState(() => isDegraded());
  useEffect(() => subscribeDegraded(() => setDegraded(isDegraded())), []);

  if (!degraded) return null;

  return (
    <div
      data-tutorial="degraded-banner"
      role="status"
      className="mb-3 rounded-md border border-amber-600/50 bg-amber-900/25 px-3 py-2 text-[11px] leading-relaxed text-amber-200"
    >
      <span className="font-semibold">{t('Working offline.')}</span>{' '}
      {t('AI structuring is unavailable, so this record shows on-device CTDC indicator coverage and the deterministic risk score. Every flag below cites the phrase that triggered it.')}
    </div>
  );
}

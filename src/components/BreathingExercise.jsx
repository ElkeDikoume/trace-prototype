import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

const CYCLE_SECONDS = 7;
const PHASES = [
  { label: 'Breathe in…', start: 0, end: 3.5 },
  { label: 'Breathe out…', start: 3.5, end: 7 }
];

export default function BreathingExercise() {
  const { t } = useI18n();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      setElapsed(((Date.now() - startedAt) / 1000) % CYCLE_SECONDS);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const phase = PHASES.find((p) => elapsed >= p.start && elapsed < p.end) || PHASES[0];
  const secondsLeft = Math.max(1, Math.ceil(phase.end - elapsed));

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
        <div className="breathe-circle absolute inset-0 rounded-full bg-trace-accent/25 border-2 border-trace-accent" />
        <span className="relative text-2xl font-semibold text-trace-accent">{secondsLeft}</span>
      </div>
      <p className="text-sm font-medium text-slate-200">{t(phase.label)}</p>
      <p className="text-[11px] text-slate-500 mt-1">{t('Quick breathing exercise · 7 seconds, inhale then exhale')}</p>
    </div>
  );
}

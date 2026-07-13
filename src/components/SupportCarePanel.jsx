import { useEffect, useState } from 'react';
import BreathingExercise from './BreathingExercise.jsx';
import { useI18n } from '../lib/i18n.jsx';

const RESOURCES = [
  {
    label: 'IOM Staff Care',
    href: 'https://www.iom.int/staff-care',
    note: 'Confidential staff counselling and wellbeing support.'
  },
  {
    label: 'IASC MHPSS Guidelines',
    href: 'https://interagencystandingcommittee.org/mental-health-and-psychosocial-support-emergency-settings',
    note: 'Inter-Agency Standing Committee mental health & psychosocial support guidance.'
  },
  {
    label: 'UNHCR Peer Support Network',
    href: 'https://www.unhcr.org',
    note: 'Staff welfare and peer support — ask your focal point for the current referral path.'
  }
];

export default function SupportCarePanel({ open, onClose, highRiskPrompt }) {
  const { t } = useI18n();
  const [breathingStarted, setBreathingStarted] = useState(false);

  // Reset to the calm choice screen every time the panel is freshly opened,
  // so the breathing exercise never auto-plays.
  useEffect(() => {
    if (open) setBreathingStarted(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-trace-900 border border-trace-700 rounded-xl w-full max-w-sm max-h-[85vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-trace-700 sticky top-0 bg-trace-900">
          <h2 className="text-sm font-semibold text-slate-100">💛 {t('Support & Care')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg leading-none">×</button>
        </div>

        <div className="p-4">
          {highRiskPrompt && (
            <div className="bg-trace-risk-high/15 border border-trace-risk-high rounded-lg p-3 mb-4 text-xs text-slate-200">
              {t('This case was just flagged')} <span className="font-semibold text-trace-risk-high">{t('HIGH risk')}</span>. {t('Vicarious trauma is real — take a moment for yourself before continuing.')}
            </div>
          )}

          {!breathingStarted && (
            <div className="flex flex-col items-center text-center py-4 mb-2">
              <p className="text-sm text-slate-300 mb-4">{t('A short breathing exercise can help you reset.')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setBreathingStarted(true)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-trace-accent text-white hover:bg-sky-500"
                >
                  🫁 {t('Start breathing exercise')}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm text-slate-300 border border-trace-700 hover:bg-trace-800"
                >
                  {t('Dismiss')}
                </button>
              </div>
            </div>
          )}

          {breathingStarted && <BreathingExercise />}

          <div className="mt-2 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Resources')}</h3>
            {RESOURCES.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="block bg-trace-800 border border-trace-700 rounded-lg p-3 hover:bg-trace-700"
              >
                <div className="text-sm font-medium text-trace-accent">{r.label} ↗</div>
                <div className="text-xs text-slate-400 mt-0.5">{t(r.note)}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

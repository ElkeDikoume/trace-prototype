// Deliberately DISCREET risk badge for the Active Intake screen.
// Collapsed: a small muted amber dot + tiny "Risk" label (8px).
// Expanded (tap): a small card with the risk level + a few mock CTDC
// indicators. Muted colours only — it must never dominate the screen.
// Tap the X or anywhere outside to collapse.
import { RISK_DOT, RISK_TEXT, RISK_LABEL } from '../theme.js';

export default function RiskBadge({ open, onToggle, onClose, level = 'medium', indicators = [] }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Risk indicators"
        className="flex items-center gap-1 rounded-full border border-tracev2-border/70 bg-tracev2-card/70 px-2 py-1 text-slate-400 transition-colors duration-150 hover:text-slate-200"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${RISK_DOT[level]} opacity-70`} />
        <span className="text-[8px] font-medium uppercase tracking-wide leading-none">Risk</span>
      </button>

      {open && (
        <>
          {/* click-outside catcher */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-xl border border-tracev2-border bg-tracev2-card p-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${RISK_DOT[level]} opacity-80`} />
                <span className={`text-xs font-semibold ${RISK_TEXT[level]} opacity-90`}>{RISK_LABEL[level]}</span>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-slate-300 leading-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">CTDC indicators</p>
            <ul className="mt-1 space-y-1">
              {indicators.map((ind) => (
                <li key={ind} className="flex gap-1.5 text-[11px] leading-snug text-slate-300">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-slate-500" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[9px] leading-snug text-slate-600">
              Mock indicators. Reviewed by a trained caseworker — never shown to survivors.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
